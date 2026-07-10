package ultracode

import kotlin.metadata.ClassKind
import kotlin.metadata.KmClass
import kotlin.metadata.KmFunction
import kotlin.metadata.KmPackage
import kotlin.metadata.KmProperty
import kotlin.metadata.Visibility
import kotlin.metadata.declaresDefaultValue
import kotlin.metadata.kind
import kotlin.metadata.visibility
import kotlin.metadata.jvm.JvmMethodSignature
import kotlin.metadata.jvm.KotlinClassMetadata
import kotlin.metadata.jvm.fieldSignature
import kotlin.metadata.jvm.getterSignature
import kotlin.metadata.jvm.signature
import mu.KotlinLogging
import org.objectweb.asm.AnnotationVisitor
import org.objectweb.asm.ClassReader
import org.objectweb.asm.ClassVisitor
import org.objectweb.asm.FieldVisitor
import org.objectweb.asm.MethodVisitor
import org.objectweb.asm.Opcodes
import org.objectweb.asm.Type
import ultracode.types.Contract
import java.io.File
import java.util.jar.JarFile

private val logger = KotlinLogging.logger {}

/**
 * Resolves the PUBLIC API CONTRACTS of symbols from COMPILED dependency JARs.
 *
 * Unlike [K2Parser] (which parses Kotlin SOURCE text and cannot see compiled deps), this reads
 * the bytecode of the JARs directly: ASM extracts class/method/field shape + annotations without
 * loading any class (no static initializers run), and kotlin-metadata-jvm decodes the
 * `@kotlin.Metadata` annotation to recover Kotlin-level facts the bytecode alone hides
 * (default parameters, vararg, object/property kinds, and top-level function/property FQNs that
 * live inside synthetic `*Kt` facade classes).
 *
 * Two-phase design:
 *   1. ASM pass reads every `.class` in every JAR into a [RawClass] (access flags, JVM method/field
 *      descriptors, per-member deprecation annotations, and the raw `@Metadata` if present).
 *   2. Build pass turns each class into [Contract]s — from metadata when it is a Kotlin class,
 *      otherwise from the Java bytecode. Deprecation for Kotlin members is cross-referenced against
 *      the bytecode (multi-file facades keep the public method — and its @Deprecated — on the
 *      facade class, not the metadata part).
 *
 * Targeted mode (symbols given) extracts everything then filters by exact FQN — this sidesteps the
 * package/class-boundary ambiguity of a raw dotted name. Bulk mode (symbols null/empty) returns all.
 */
class ContractResolver {

    fun resolve(classpath: List<String>, symbols: List<String>?): List<Contract> {
        val jars = classpath.map(::File).filter { it.isFile }
        if (jars.isEmpty()) return emptyList()

        // Phase 1: read all classes on the classpath via ASM (no class loading).
        val rawByInternal = LinkedHashMap<String, RawClass>()
        for (jar in jars) {
            try {
                JarFile(jar).use { jf ->
                    val entries = jf.entries()
                    while (entries.hasMoreElements()) {
                        val e = entries.nextElement()
                        if (e.isDirectory) continue
                        val name = e.name
                        if (!name.endsWith(".class")) continue
                        if (name.endsWith("module-info.class") || name.endsWith("package-info.class")) continue
                        if (name.startsWith("META-INF/")) continue
                        try {
                            val bytes = jf.getInputStream(e).use { it.readBytes() }
                            val rc = readClass(bytes) ?: continue
                            rawByInternal[rc.internalName] = rc
                        } catch (ex: Throwable) {
                            // Unreadable/unsupported class file — skip it, keep going.
                        }
                    }
                }
            } catch (ex: Throwable) {
                logger.warn(ex) { "resolveContracts: failed to read jar ${jar.path}" }
            }
        }

        // Phase 2: build contracts.
        val out = ArrayList<Contract>()
        for (rc in rawByInternal.values) {
            try {
                if (rc.metadata != null) {
                    emitFromMetadata(rc, rawByInternal, out)
                } else {
                    emitFromJava(rc, out)
                }
            } catch (ex: Throwable) {
                logger.warn(ex) { "resolveContracts: failed to build contracts for ${rc.internalName}" }
            }
        }

        val distinct = out.distinct()
        val filtered = if (symbols.isNullOrEmpty()) {
            distinct
        } else {
            val set = symbols.toHashSet()
            distinct.filter { it.fqName in set }
        }
        return filtered.sortedWith(compareBy({ it.fqName }, { it.kind }, { it.arityMax }, { it.paramTypes.size }))
    }

    // ---------------------------------------------------------------------------------------------
    // Phase 1: ASM bytecode reading
    // ---------------------------------------------------------------------------------------------

    private class RawMethod(val name: String, val descriptor: String, val access: Int, val deprecated: Boolean)
    private class RawField(val name: String, val descriptor: String, val access: Int, val deprecated: Boolean)

    private class RawClass(
        val internalName: String,
        val access: Int,
        val deprecated: Boolean,
        val metadata: Metadata?,
        val methods: List<RawMethod>,
        val fields: List<RawField>,
    ) {
        // Unique per JVM rules (name+descriptor is unique within a class).
        val methodsByKey: Map<String, RawMethod> by lazy(LazyThreadSafetyMode.NONE) {
            methods.associateBy { it.name + it.descriptor }
        }
    }

    private fun readClass(bytes: ByteArray): RawClass? {
        var internalName = ""
        var classAccess = 0
        var classDeprecated = false
        var hasMeta = false
        var metaK = 1
        var metaMv: IntArray? = null
        var metaD1: MutableList<String>? = null
        var metaD2: MutableList<String>? = null
        var metaXi = 0
        var metaXs = ""
        var metaPn = ""
        val methods = ArrayList<RawMethod>()
        val fields = ArrayList<RawField>()

        val cv = object : ClassVisitor(Opcodes.ASM9) {
            override fun visit(
                version: Int, access: Int, name: String, signature: String?,
                superName: String?, interfaces: Array<out String>?,
            ) {
                internalName = name
                classAccess = access
                if (access and Opcodes.ACC_DEPRECATED != 0) classDeprecated = true
            }

            override fun visitAnnotation(descriptor: String, visible: Boolean): AnnotationVisitor? {
                if (isDeprecatedDesc(descriptor)) classDeprecated = true
                if (descriptor == "Lkotlin/Metadata;") {
                    hasMeta = true
                    return object : AnnotationVisitor(Opcodes.ASM9) {
                        override fun visit(name: String?, value: Any?) {
                            when (name) {
                                "k" -> metaK = value as? Int ?: metaK
                                "mv" -> metaMv = value as? IntArray
                                "xi" -> metaXi = value as? Int ?: metaXi
                                "xs" -> metaXs = value as? String ?: metaXs
                                "pn" -> metaPn = value as? String ?: metaPn
                            }
                        }

                        override fun visitArray(name: String?): AnnotationVisitor? = when (name) {
                            "d1" -> ArrayList<String>().also { metaD1 = it }.let(::stringArrayCollector)
                            "d2" -> ArrayList<String>().also { metaD2 = it }.let(::stringArrayCollector)
                            else -> null
                        }
                    }
                }
                return null
            }

            override fun visitMethod(
                access: Int, name: String, descriptor: String,
                signature: String?, exceptions: Array<out String>?,
            ): MethodVisitor {
                var dep = access and Opcodes.ACC_DEPRECATED != 0
                return object : MethodVisitor(Opcodes.ASM9) {
                    override fun visitAnnotation(d: String, visible: Boolean): AnnotationVisitor? {
                        if (isDeprecatedDesc(d)) dep = true
                        return null
                    }

                    override fun visitEnd() {
                        methods.add(RawMethod(name, descriptor, access, dep))
                    }
                }
            }

            override fun visitField(
                access: Int, name: String, descriptor: String,
                signature: String?, value: Any?,
            ): FieldVisitor {
                var dep = access and Opcodes.ACC_DEPRECATED != 0
                return object : FieldVisitor(Opcodes.ASM9) {
                    override fun visitAnnotation(d: String, visible: Boolean): AnnotationVisitor? {
                        if (isDeprecatedDesc(d)) dep = true
                        return null
                    }

                    override fun visitEnd() {
                        fields.add(RawField(name, descriptor, access, dep))
                    }
                }
            }
        }

        ClassReader(bytes).accept(cv, ClassReader.SKIP_CODE or ClassReader.SKIP_DEBUG or ClassReader.SKIP_FRAMES)
        if (internalName.isEmpty()) return null

        val metadata: Metadata? = if (hasMeta) {
            try {
                // kotlin-metadata-jvm's KotlinClassMetadata.read* takes a real kotlin.Metadata
                // instance; the idiomatic way to build one from ASM-extracted values is to call the
                // annotation's constructor directly. Its constructor is not part of the public API
                // surface, hence the INVISIBLE_REFERENCE suppression — this is the documented
                // pattern for decoding @Metadata off bytecode and is stable on the pinned Kotlin
                // 2.0.21 toolchain. (A Proxy over the Metadata interface would avoid the warning but
                // couples us to how the library reads the annotation internally — more fragile.)
                @Suppress("INVISIBLE_MEMBER", "INVISIBLE_REFERENCE")
                Metadata(
                    kind = metaK,
                    metadataVersion = metaMv ?: IntArray(0),
                    data1 = (metaD1 ?: emptyList()).toTypedArray(),
                    data2 = (metaD2 ?: emptyList()).toTypedArray(),
                    extraString = metaXs,
                    packageName = metaPn,
                    extraInt = metaXi,
                )
            } catch (ex: Throwable) {
                null
            }
        } else {
            null
        }

        return RawClass(internalName, classAccess, classDeprecated, metadata, methods, fields)
    }

    private fun stringArrayCollector(target: MutableList<String>): AnnotationVisitor =
        object : AnnotationVisitor(Opcodes.ASM9) {
            override fun visit(name: String?, value: Any?) {
                if (value is String) target.add(value)
            }
        }

    private fun isDeprecatedDesc(d: String): Boolean =
        d == "Lkotlin/Deprecated;" || d == "Ljava/lang/Deprecated;"

    // ---------------------------------------------------------------------------------------------
    // Phase 2a: Kotlin classes (via @Metadata)
    // ---------------------------------------------------------------------------------------------

    private fun emitFromMetadata(rc: RawClass, all: Map<String, RawClass>, out: MutableList<Contract>) {
        val parsed = try {
            KotlinClassMetadata.readLenient(rc.metadata!!)
        } catch (ex: Throwable) {
            return // undecodable metadata (e.g. far-future version) — skip class.
        }
        when (parsed) {
            is KotlinClassMetadata.Class -> emitKmClass(parsed.kmClass, rc, out)
            is KotlinClassMetadata.FileFacade -> emitKmPackage(parsed.kmPackage, rc, rc, out)
            is KotlinClassMetadata.MultiFileClassPart -> {
                val facade = all[parsed.facadeClassName] ?: rc
                emitKmPackage(parsed.kmPackage, rc, facade, out)
            }
            // SyntheticClass (lambdas), MultiFileClassFacade (aggregator; parts carry the members),
            // Unknown -> nothing to contribute.
            else -> Unit
        }
    }

    private fun emitKmClass(km: KmClass, rc: RawClass, out: MutableList<Contract>) {
        if (!isVisibleApi(km.visibility)) return
        val classFq = km.name.replace('/', '.')
        val kind = when (km.kind) {
            ClassKind.INTERFACE -> "interface"
            ClassKind.ENUM_CLASS -> "enum"
            ClassKind.OBJECT, ClassKind.COMPANION_OBJECT -> "object"
            ClassKind.ANNOTATION_CLASS -> "interface" // no dedicated "annotation" kind in the contract
            else -> "class"
        }
        out.add(Contract(classFq, kind, -1, -1, emptyList(), "", rc.deprecated))

        // Members: bytecode owner == the class itself.
        for (f in km.functions) emitKmFunction(f, "$classFq.${f.name}", rc, rc, out)
        for (p in km.properties) emitKmProperty(p, "$classFq.${p.name}", rc, rc, out)
        // Nested classes appear as their own top-level .class entries and are handled independently.
    }

    private fun emitKmPackage(km: KmPackage, ownerRaw: RawClass, bytecodeRaw: RawClass, out: MutableList<Contract>) {
        val pkg = ownerRaw.internalName.substringBeforeLast('/', "").replace('/', '.')
        for (f in km.functions) {
            val fq = if (pkg.isEmpty()) f.name else "$pkg.${f.name}"
            emitKmFunction(f, fq, ownerRaw, bytecodeRaw, out)
        }
        for (p in km.properties) {
            val fq = if (pkg.isEmpty()) p.name else "$pkg.${p.name}"
            emitKmProperty(p, fq, ownerRaw, bytecodeRaw, out)
        }
    }

    private fun emitKmFunction(
        km: KmFunction, fqName: String,
        ownerRaw: RawClass, bytecodeRaw: RawClass, out: MutableList<Contract>,
    ) {
        if (!isVisibleApi(km.visibility)) return
        val vps = km.valueParameters
        val hasVararg = vps.any { it.varargElementType != null }
        val arityMin = vps.count { !it.declaresDefaultValue && it.varargElementType == null }
        val arityMax = if (hasVararg) -1 else vps.size

        var paramTypes: List<String> = emptyList()
        var returnType = ""
        val sig = km.signature
        if (sig != null) {
            val (args, ret) = parseJvmDescriptor(sig.descriptor)
            var p = args
            // The JVM descriptor of an extension fun lists the receiver as its first parameter;
            // metadata's valueParameters do not — drop it so paramTypes align with arity.
            if (km.receiverParameterType != null && p.isNotEmpty()) p = p.drop(1)
            // A suspend fun gains a trailing Continuation parameter in bytecode — drop it.
            if (p.isNotEmpty() && p.last() == "kotlin.coroutines.Continuation") p = p.dropLast(1)
            paramTypes = p
            returnType = ret
        }
        val deprecated = methodDeprecated(sig, ownerRaw, bytecodeRaw)
        out.add(Contract(fqName, "fun", arityMin, arityMax, paramTypes, returnType, deprecated))
    }

    private fun emitKmProperty(
        km: KmProperty, fqName: String,
        ownerRaw: RawClass, bytecodeRaw: RawClass, out: MutableList<Contract>,
    ) {
        if (!isVisibleApi(km.visibility)) return
        val getter = km.getterSignature
        val field = km.fieldSignature
        val returnType = when {
            getter != null -> parseJvmDescriptor(getter.descriptor).second
            field != null -> Type.getType(field.descriptor).className
            else -> ""
        }
        var deprecated = methodDeprecated(getter, ownerRaw, bytecodeRaw)
        if (!deprecated && field != null) {
            val key = field.name + field.descriptor
            deprecated = sequenceOf(ownerRaw, bytecodeRaw)
                .mapNotNull { rc -> rc.fields.firstOrNull { it.name + it.descriptor == key } }
                .any { it.deprecated }
        }
        out.add(Contract(fqName, "property", -1, -1, emptyList(), returnType, deprecated))
    }

    private fun methodDeprecated(sig: JvmMethodSignature?, vararg raws: RawClass): Boolean {
        if (sig == null) return false
        val key = sig.name + sig.descriptor
        return raws.any { it.methodsByKey[key]?.deprecated == true }
    }

    private fun isVisibleApi(v: Visibility): Boolean =
        v == Visibility.PUBLIC || v == Visibility.PROTECTED

    // ---------------------------------------------------------------------------------------------
    // Phase 2b: Java classes (no @Metadata) — pure bytecode
    // ---------------------------------------------------------------------------------------------

    private fun emitFromJava(rc: RawClass, out: MutableList<Contract>) {
        if (rc.access and Opcodes.ACC_PUBLIC == 0) return
        if (rc.access and Opcodes.ACC_SYNTHETIC != 0) return
        val classFq = rc.internalName.replace('/', '.').replace('$', '.')
        val kind = when {
            rc.access and Opcodes.ACC_ANNOTATION != 0 -> "interface"
            rc.access and Opcodes.ACC_INTERFACE != 0 -> "interface"
            rc.access and Opcodes.ACC_ENUM != 0 -> "enum"
            else -> "class"
        }
        out.add(Contract(classFq, kind, -1, -1, emptyList(), "", rc.deprecated))

        for (m in rc.methods) {
            if (m.access and Opcodes.ACC_PUBLIC == 0) continue
            if (m.access and (Opcodes.ACC_SYNTHETIC or Opcodes.ACC_BRIDGE) != 0) continue
            if (m.name == "<init>" || m.name == "<clinit>") continue
            val (args, ret) = parseJvmDescriptor(m.descriptor)
            val isVararg = m.access and Opcodes.ACC_VARARGS != 0
            val arityMax = if (isVararg) -1 else args.size
            val arityMin = if (isVararg) (args.size - 1).coerceAtLeast(0) else args.size
            out.add(Contract("$classFq.${m.name}", "fun", arityMin, arityMax, args, ret, m.deprecated))
        }
        for (f in rc.fields) {
            if (f.access and Opcodes.ACC_PUBLIC == 0) continue
            if (f.access and Opcodes.ACC_SYNTHETIC != 0) continue
            val t = Type.getType(f.descriptor).className
            out.add(Contract("$classFq.${f.name}", "property", -1, -1, emptyList(), t, f.deprecated))
        }
    }

    // ---------------------------------------------------------------------------------------------
    // JVM descriptor -> readable JVM type names ("int", "java.lang.String", "int[]", "boolean", ...)
    // ---------------------------------------------------------------------------------------------

    private fun parseJvmDescriptor(descriptor: String): Pair<List<String>, String> {
        val args = Type.getArgumentTypes(descriptor).map { it.className }
        val ret = Type.getReturnType(descriptor).className
        return args to ret
    }
}

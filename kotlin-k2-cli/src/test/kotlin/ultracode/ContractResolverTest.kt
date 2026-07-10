package ultracode

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import ultracode.types.Contract
import ultracode.types.ContractsResult
import java.io.File

/**
 * Smoke test for [ContractResolver] against a REAL compiled dependency JAR:
 * kotlin-stdlib-2.0.21.jar, located from this test JVM's own runtime classpath (so it works on
 * any machine without hard-coding a Gradle-cache path). Run under JAVA_HOME = JDK 21.
 */
class ContractResolverTest {

    private fun stdlibJar(): String {
        val cp = System.getProperty("java.class.path").split(File.pathSeparator)
        return cp.firstOrNull {
            val n = File(it).name
            n.startsWith("kotlin-stdlib") && n.endsWith(".jar") &&
                !n.contains("sources") && !n.contains("common") && !n.contains("jdk")
        } ?: error("kotlin-stdlib jar not found on test classpath: $cp")
    }

    @Test
    fun resolvesTopLevelFunctionWithVararg() {
        val res = ContractResolver().resolve(listOf(stdlibJar()), listOf("kotlin.collections.listOf"))
        val listOfs = res.filter { it.fqName == "kotlin.collections.listOf" }
        assertTrue(listOfs.isNotEmpty(), "expected kotlin.collections.listOf to resolve")
        assertTrue(listOfs.all { it.kind == "fun" }, "listOf overloads should be kind=fun")
        // listOf(vararg elements: T): List<T>  -> unbounded arity
        assertTrue(listOfs.any { it.arityMax == -1 }, "expected a vararg overload with arityMax == -1")
        // JVM-erased return type is java.util.List
        assertTrue(listOfs.all { it.returnType.isNotEmpty() }, "returnType must be populated")
        assertTrue(listOfs.any { it.returnType == "java.util.List" }, "expected java.util.List return type")
        println("[smoke] kotlin.collections.listOf overloads:")
        listOfs.forEach { println("  $it") }
    }

    @Test
    fun resolvesClassKind() {
        val res = ContractResolver().resolve(listOf(stdlibJar()), listOf("kotlin.Pair"))
        val pair = res.firstOrNull { it.fqName == "kotlin.Pair" }
        assertNotNull(pair, "expected kotlin.Pair to resolve")
        assertEquals("class", pair!!.kind)
        assertEquals(-1, pair.arityMin)
        assertEquals(-1, pair.arityMax)
        println("[smoke] kotlin.Pair -> $pair")
    }

    @Test
    fun detectsDeprecatedSymbol() {
        // kotlin.text.capitalize (String.capitalize) is permanently @Deprecated in the stdlib.
        val res = ContractResolver().resolve(listOf(stdlibJar()), listOf("kotlin.text.capitalize"))
        val caps = res.filter { it.fqName == "kotlin.text.capitalize" }
        assertTrue(caps.isNotEmpty(), "expected kotlin.text.capitalize to resolve")
        assertTrue(caps.any { it.deprecated }, "expected at least one deprecated capitalize overload")
        println("[smoke] kotlin.text.capitalize overloads:")
        caps.forEach { println("  $it") }
    }

    @Test
    fun unknownSymbolIsOmitted() {
        val res = ContractResolver().resolve(
            listOf(stdlibJar()),
            listOf("kotlin.Pair", "com.nope.DoesNotExist"),
        )
        assertTrue(res.any { it.fqName == "kotlin.Pair" }, "known symbol should be present")
        assertTrue(res.none { it.fqName == "com.nope.DoesNotExist" }, "unknown symbol must be omitted")
    }

    @Test
    fun emptyClasspathIsGraceful() {
        val res = ContractResolver().resolve(emptyList(), listOf("kotlin.Pair"))
        assertTrue(res.isEmpty(), "empty classpath => empty contracts (no error)")
    }

    @Test
    fun bulkModeReturnsManyContracts() {
        // symbols = null => resolve ALL public symbols on the classpath.
        val res = ContractResolver().resolve(listOf(stdlibJar()), null)
        assertTrue(res.size > 500, "bulk mode over kotlin-stdlib should yield many contracts, got ${res.size}")
        assertTrue(res.any { it.fqName == "kotlin.Pair" && it.kind == "class" })
        assertTrue(res.any { it.kind == "fun" })
        assertTrue(res.any { it.kind == "property" })
        println("[smoke] bulk mode contract count = ${res.size}")
    }

    @Test
    fun wireShapeMatchesSpec() {
        // Mirror K2Cli's Json config exactly so this test locks the on-the-wire shape.
        val json = Json { ignoreUnknownKeys = true; encodeDefaults = false }

        val success = ContractsResult(
            id = "id1",
            success = true,
            contracts = listOf(Contract("com.foo.Bar.baz", "fun", 1, 2, listOf("int", "java.lang.String"), "boolean", false)),
        )
        val successJson = json.encodeToString(success)
        println("[wire] success = $successJson")
        assertTrue(successJson.contains("\"contracts\""), "success must include contracts")
        assertFalse(successJson.contains("\"error\""), "success must omit error")
        // Every Contract field is always present (even deprecated=false / empty lists).
        for (field in listOf("fqName", "kind", "arityMin", "arityMax", "paramTypes", "returnType", "deprecated")) {
            assertTrue(successJson.contains("\"$field\""), "Contract must always emit field: $field")
        }
        assertTrue(successJson.contains("\"deprecated\":false"), "deprecated=false must be emitted, not omitted")

        val failure = ContractsResult(id = "id2", success = false, contracts = null, error = "boom")
        val failureJson = json.encodeToString(failure)
        println("[wire] failure = $failureJson")
        assertFalse(failureJson.contains("\"contracts\""), "failure must omit contracts")
        assertTrue(failureJson.contains("\"error\""), "failure must include error")

        // Graceful-empty success still emits an (empty) contracts array.
        val empty = ContractsResult(id = "id3", success = true, contracts = emptyList())
        val emptyJson = json.encodeToString(empty)
        println("[wire] empty-success = $emptyJson")
        assertTrue(emptyJson.contains("\"contracts\":[]"), "empty success must emit contracts:[]")
    }
}

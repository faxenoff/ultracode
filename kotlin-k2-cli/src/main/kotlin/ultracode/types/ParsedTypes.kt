package ultracode.types

import kotlinx.serialization.Serializable

@Serializable
data class Command(
    val id: String,
    val type: String, // "parse", "shutdown", or "resolveContracts"
    val filePath: String? = null,
    val content: String? = null,
    // resolveContracts inputs:
    val classpath: List<String>? = null, // absolute paths to dependency JARs to load
    val symbols: List<String>? = null     // FQNs the project uses; null/empty => resolve ALL public symbols
)

@Serializable
data class ParseResult(
    val id: String,
    val success: Boolean,
    val entities: List<ParsedEntity> = emptyList(),
    val relationships: List<EntityRelationship> = emptyList(),
    val callGraph: List<CallEdge> = emptyList(),
    val error: String? = null
)

@Serializable
data class ParsedEntity(
    val name: String,
    val type: String, // "class", "interface", "function", "property", "enum", "object", "method", "field", "import", "module"
    val filePath: String,
    val location: Location,
    val modifiers: List<String>? = null,
    val parameters: List<Parameter>? = null,
    val returnType: String? = null,
    val superTypes: List<String>? = null,
    val documentation: String? = null,
    val children: List<ParsedEntity>? = null
)

@Serializable
data class Location(
    val start: Position,
    val end: Position
)

@Serializable
data class Position(
    val line: Int,
    val column: Int,
    val index: Int
)

@Serializable
data class Parameter(
    val name: String,
    val type: String? = null,
    val optional: Boolean = false,
    val defaultValue: String? = null
)

@Serializable
data class EntityRelationship(
    val from: String,
    val to: String,
    val type: String, // "imports", "inherits", "implements", "contains", "calls", "references"
    val metadata: Map<String, String>? = null
)

@Serializable
data class CallEdge(
    val from: String?,
    val to: String?,
    val line: Int
)

/**
 * Result of a "resolveContracts" command.
 *
 * With the shared Json config (encodeDefaults = false):
 *  - success: { "id", "success": true, "contracts": [...] }   (contracts always emitted, even when empty)
 *  - failure: { "id", "success": false, "error": "..." }      (contracts null => omitted; error emitted)
 */
@Serializable
data class ContractsResult(
    val id: String,
    val success: Boolean,
    val contracts: List<Contract>? = null,
    val error: String? = null
)

/**
 * Public API contract of a single symbol resolved from a compiled dependency JAR.
 *
 * All fields are non-optional (no defaults) so every field is always serialized — even
 * deprecated=false, an empty paramTypes list, or an empty returnType — giving the Zig
 * client a stable, fully-populated shape to mirror.
 *
 * - kind:      one of class | interface | object | enum | fun | property  (lowercase)
 * - arityMin:  required params (no default, not vararg). -1 for non-callable kinds.
 * - arityMax:  total params, or -1 when a vararg is present (unbounded). -1 for non-callable kinds.
 * - paramTypes: JVM-level type names (e.g. "int", "java.lang.String", "int[]"). Empty for non-callables.
 * - returnType: JVM-level return type for fun; property type for property; "" for class/interface/object/enum.
 * - deprecated: true if the symbol carries @kotlin.Deprecated OR @java.lang.Deprecated.
 */
@Serializable
data class Contract(
    val fqName: String,
    val kind: String,
    val arityMin: Int,
    val arityMax: Int,
    val paramTypes: List<String>,
    val returnType: String,
    val deprecated: Boolean
)

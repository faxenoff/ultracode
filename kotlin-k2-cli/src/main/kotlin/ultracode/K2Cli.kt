package ultracode

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import mu.KotlinLogging
import ultracode.types.*
import java.io.File

private val logger = KotlinLogging.logger {}
private val json = Json {
    ignoreUnknownKeys = true
    encodeDefaults = false
}

/**
 * K2 CLI - Kotlin Analysis API based parser
 *
 * Reads JSON commands from stdin (one per line):
 * - { "id": "uuid", "type": "parse", "filePath": "...", "content": "..." }
 * - { "id": "uuid", "type": "shutdown" }
 *
 * Writes JSON results to stdout (one per line):
 * - { "id": "uuid", "success": true, "entities": [...], "relationships": [...], "callGraph": [...] }
 * - { "id": "uuid", "success": false, "error": "..." }
 */
fun main() {
    logger.info { "K2 CLI starting..." }

    val parser = K2Parser()

    try {
        parser.initialize()
        logger.info { "K2 CLI initialized, ready for commands" }

        // Read commands from stdin (JSON Lines)
        generateSequence(::readLine).forEach { line ->
            if (line.isBlank()) return@forEach

            try {
                val cmd = json.decodeFromString<Command>(line)

                when (cmd.type) {
                    "parse" -> {
                        val result = handleParse(parser, cmd)
                        println(json.encodeToString(result))
                        System.out.flush()
                    }
                    "resolveContracts" -> {
                        val result = handleResolveContracts(cmd)
                        println(json.encodeToString(result))
                        System.out.flush()
                    }
                    "shutdown" -> {
                        logger.info { "Shutdown requested" }
                        parser.dispose()
                        return
                    }
                    else -> {
                        val error = ParseResult(
                            id = cmd.id,
                            success = false,
                            error = "Unknown command type: ${cmd.type}"
                        )
                        println(json.encodeToString(error))
                        System.out.flush()
                    }
                }
            } catch (e: Exception) {
                logger.error(e) { "Error processing command: $line" }
                val errorResult = ParseResult(
                    id = "error",
                    success = false,
                    error = e.message ?: "Unknown error"
                )
                println(json.encodeToString(errorResult))
                System.out.flush()
            }
        }
    } catch (e: Exception) {
        logger.error(e) { "Fatal error" }
        System.exit(1)
    } finally {
        parser.dispose()
    }
}

private fun handleParse(parser: K2Parser, cmd: Command): ParseResult {
    val filePath = cmd.filePath ?: return ParseResult(
        id = cmd.id,
        success = false,
        error = "filePath is required"
    )

    val content = cmd.content ?: return ParseResult(
        id = cmd.id,
        success = false,
        error = "content is required"
    )

    return try {
        val startTime = System.currentTimeMillis()
        val result = parser.parse(filePath, content)
        val elapsed = System.currentTimeMillis() - startTime
        logger.debug { "Parsed $filePath in ${elapsed}ms: ${result.entities.size} entities" }

        result.copy(id = cmd.id)
    } catch (e: Exception) {
        logger.error(e) { "Parse error for $filePath" }
        ParseResult(
            id = cmd.id,
            success = false,
            error = e.message ?: "Parse error"
        )
    }
}

/**
 * Extract public API contracts of the requested symbols from the compiled dependency JARs
 * named in cmd.classpath. Reads bytecode + @kotlin.Metadata directly (no class loading).
 * A symbol that cannot be resolved is omitted (graceful). Empty classpath => empty contracts.
 * ContractResolver is stateless and independent of the source-PSI K2Parser environment.
 */
private fun handleResolveContracts(cmd: Command): ContractsResult {
    return try {
        val startTime = System.currentTimeMillis()
        val classpath = cmd.classpath ?: emptyList()
        val contracts = ContractResolver().resolve(classpath, cmd.symbols)
        val elapsed = System.currentTimeMillis() - startTime
        logger.debug { "resolveContracts: ${contracts.size} contracts from ${classpath.size} jars in ${elapsed}ms" }
        ContractsResult(id = cmd.id, success = true, contracts = contracts)
    } catch (e: Exception) {
        logger.error(e) { "resolveContracts error" }
        ContractsResult(id = cmd.id, success = false, error = e.message ?: "resolveContracts error")
    }
}

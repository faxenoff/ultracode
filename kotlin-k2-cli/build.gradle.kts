plugins {
    kotlin("jvm") version "2.0.21"
    kotlin("plugin.serialization") version "2.0.21"
    application
}

group = "ultracode"
version = "1.1.0"

repositories {
    mavenCentral()
}

val kotlinVersion = "2.0.21"

dependencies {
    // Kotlin standard library
    implementation(kotlin("stdlib"))

    // Kotlin Compiler for PSI parsing (includes full AST support)
    // PSI provides: classes, functions, properties, inheritance, imports, call graph
    implementation("org.jetbrains.kotlin:kotlin-compiler-embeddable:$kotlinVersion")

    // resolveContracts: decode @kotlin.Metadata from compiled dependency JARs
    // (Kotlin-level default params / vararg / object & property kinds / top-level facade FQNs).
    implementation("org.jetbrains.kotlin:kotlin-metadata-jvm:$kotlinVersion")

    // resolveContracts: read compiled JAR bytecode without loading classes
    // (Java classes, @Deprecated / @kotlin.Deprecated annotations, JVM descriptors -> type names).
    implementation("org.ow2.asm:asm:9.9")

    // JSON serialization for stdin/stdout protocol
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    // Logging
    implementation("io.github.microutils:kotlin-logging-jvm:3.0.5")
    implementation("ch.qos.logback:logback-classic:1.4.14")

    // Tests (resolveContracts smoke test against a real dependency JAR)
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "failed", "skipped")
        showStandardStreams = true
    }
}

application {
    mainClass.set("ultracode.K2CliKt")
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
    }
}

tasks.withType<JavaCompile> {
    sourceCompatibility = "11"
    targetCompatibility = "11"
}

// Fat JAR with all dependencies
tasks.register<Jar>("fatJar") {
    group = "build"
    description = "Creates a fat JAR with all dependencies"

    archiveBaseName.set("kotlin-k2-cli")
    archiveClassifier.set("all")

    manifest {
        attributes["Main-Class"] = "ultracode.K2CliKt"
    }

    duplicatesStrategy = DuplicatesStrategy.EXCLUDE

    from(sourceSets.main.get().output)

    dependsOn(configurations.runtimeClasspath)
    from({
        configurations.runtimeClasspath.get().filter { it.name.endsWith("jar") }.map { zipTree(it) }
    })
}

// Alias for convenience
tasks.register("shadowJar") {
    group = "build"
    dependsOn("fatJar")
}

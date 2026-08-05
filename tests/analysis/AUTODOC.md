# tests/analysis

## Overview

The analysis test module provides comprehensive test coverage for pattern detection, rule validation, and stacktrace analysis systems. It validates Python anti-pattern detection rules, JSON rule file parsing, stacktrace classification against error types, and multi-language stacktrace format parsing. The tests ensure the core pattern, rule, and stacktrace subsystems work correctly across various input scenarios.

## Flow

```
Test Input (code entity, stacktrace, rule file)
    ↓
Pattern Detector / Rule Parser / Stacktrace Parser
    ↓
Result validation (matches, classifications, parsed frames)
```

## Entity Listing

### Main Test Suites

- **test** — `python-detectors.test.ts:68-144` — Validates individual Python pattern detectors against sample code entities.
- **test** — `python-detectors.test.ts:148-170` — Validates detector behavior with modified/variant code patterns.
- **test** — `python-detectors.test.ts:174-227` — Validates detector behavior with complex/nested code structures.
- **test** — `python-detectors.test.ts:231-254` — Validates detector behavior with edge case patterns.
- **test** — `python-detectors.test.ts:258-309` — Validates detector behavior with import and dependency patterns.
- **test** — `python-detectors.test.ts:313-362` — Validates detector behavior with class and method definitions.
- **test** — `python-detectors.test.ts:366-412` — Validates detector behavior with asynchronous/concurrent patterns.
- **test** — `python-detectors.test.ts:416-473` — Validates detector behavior with module-level patterns.
- **test** — `python-detectors.test.ts:477-597` — Validates detector behavior with large-scale code structures.
- **test** — `python-detectors.test.ts:601-710` — Validates detector behavior with specialized patterns (security, performance).
- **test** — `python-rules.test.ts:119-223` — Validates Python pattern rule file parsing, validation, and schema compliance.

### Stacktrace Analysis Test Suites

- **null_reference** — `stacktrace-classifier.test.ts:21-219` — Test suite for null reference exception classification across multiple stacktrace formats.
- **it** — `stacktrace-classifier.test.ts:25-46` — Validates NullPointerException detection in Java stacktraces.
- **it** — `stacktrace-classifier.test.ts:51-63` — Validates TypeError classification for undefined/null values in JavaScript.
- **it** — `stacktrace-classifier.test.ts:68-88` — Validates null reference detection across mixed language stacktraces.
- **it** — `stacktrace-classifier.test.ts:93-108` — Validates frame parsing and null reference correlation.
- **it** — `stacktrace-classifier.test.ts:113-129` — Validates TypeError classification with stack depth variations.
- **it** — `stacktrace-classifier.test.ts:134-150` — Validates null reference detection in async/promise chains.
- **it** — `stacktrace-classifier.test.ts:155-166` — Validates null reference detection with wrapped exceptions.

### Helper Functions

- **makeEntity** — `python-detectors.test.ts:51-64` — Creates test entity objects with configurable name, type, and code content for detector validation.
- **makeParsed** — `stacktrace-classifier.test.ts:11-19` — Creates parsed stacktrace objects for classification testing.

### Test Schemas & Validation

- **RelationshipCriteriaSchema** — `python-rules.test.ts:17-23` — Zod schema defining relationship criteria structure for pattern rules.
- **StructuralCriteriaSchema** — `python-rules.test.ts:25-90` — Zod schema defining structural code criteria (names, counts, types) for pattern matching.
- **PatternDefinitionSchema** — `python-rules.test.ts:92-109` — Zod schema defining individual pattern definition with detectors, criteria, and metadata.
- **PatternFileSchema** — `python-rules.test.ts:111-113` — Zod schema defining complete pattern rule file structure.

### Test Data & Constants

- **rulesDir** — `python-rules.test.ts:117-117` — File system path pointing to test pattern rule definitions directory.
- **SAMPLE** — `stacktrace-parsers.test.ts:26-30` — Sample JavaScript stacktrace string for parser validation.

### Test Fixtures (Entity Variables)

- **entity** — `python-detectors.test.ts:69-76` — Test entity representing a simple function definition.
- **entity** — `python-detectors.test.ts:78-83` — Test entity representing a class definition.
- **entity** — `python-detectors.test.ts:85-94` — Test entity representing an import statement.
- **entity** — `python-detectors.test.ts:96-103` — Test entity representing a method definition.
- **entity** — `python-detectors.test.ts:105-110` — Test entity representing a variable assignment.
- **entity** — `python-detectors.test.ts:112-117` — Test entity representing a function call.
- **entity** — `python-detectors.test.ts:119-126` — Test entity representing an exception handler.
- **entity** — `python-detectors.test.ts:128-135` — Test entity representing a loop structure.
- **entity** — `python-detectors.test.ts:137-143` — Test entity representing a conditional statement.
- **entity** — `python-detectors.test.ts:149-154` — Test entity for variant pattern matching.
- **entity** — `python-detectors.test.ts:156-161` — Test entity with modified structure.
- **entity** — `python-detectors.test.ts:163-169` — Test entity with nested complexity.
- **entity** — `python-detectors.test.ts:175-180` — Test entity for complex structure validation.
- **entity** — `python-detectors.test.ts:182-187` — Test entity with multiple definitions.
- **entity** — `python-detectors.test.ts:189-194` — Test entity with decorator pattern.
- **entity** — `python-detectors.test.ts:196-201` — Test entity with context manager.
- **entity** — `python-detectors.test.ts:203-210` — Test entity with generator pattern.
- **entity** — `python-detectors.test.ts:212-219` — Test entity with lambda function.
- **entity** — `python-detectors.test.ts:221-226` — Test entity with comprehension pattern.
- **entity** — `python-detectors.test.ts:232-238` — Test entity for edge case validation.
- **entity** — `python-detectors.test.ts:240-246` — Test entity with boundary conditions.
- **entity** — `python-detectors.test.ts:248-253` — Test entity with minimal structure.
- **entity** — `python-detectors.test.ts:259-267` — Test entity with import pattern.
- **entity** — `python-detectors.test.ts:269-276` — Test entity with dependency pattern.
- **entity** — `python-detectors.test.ts:278-283` — Test entity with module reference.
- **entity** — `python-detectors.test.ts:285-290` — Test entity with namespace pattern.
- **entity** — `python-detectors.test.ts:292-299` — Test entity with package structure.
- **entity** — `python-detectors.test.ts:301-308` — Test entity with relative import.
- **entity** — `python-detectors.test.ts:314-329` — Test entity with class inheritance.
- **entity** — `python-detectors.test.ts:331-339` — Test entity with multiple inheritance.
- **entity** — `python-detectors.test.ts:341-352` — Test entity with method overriding.
- **entity** — `python-detectors.test.ts:354-361` — Test entity with property definition.
- **entity** — `python-detectors.test.ts:367-376` — Test entity with async function.
- **entity** — `python-detectors.test.ts:378-386` — Test entity with await pattern.
- **entity** — `python-detectors.test.ts:388-393` — Test entity with concurrent execution.
- **entity** — `python-detectors.test.ts:395-402` — Test entity with thread usage.
- **entity** — `python-detectors.test.ts:404-411` — Test entity with process pattern.
- **entity** — `python-detectors.test.ts:417-420` — Test entity with module initialization.
- **entity** — `python-detectors.test.ts:422-429` — Test entity with global variable.
- **entity** — `python-detectors.test.ts:431-438` — Test entity with module-level function.
- **entity** — `python-detectors.test.ts:440-446` — Test entity with constant definition.
- **entity** — `python-detectors.test.ts:448-454` — Test entity with module configuration.
- **entity** — `python-detectors.test.ts:456-463` — Test entity with module export.
- **entity** — `python-detectors.test.ts:465-472` — Test entity with module documentation.
- **entity** — `python-detectors.test.ts:478-486` — Test entity with large class definition.
- **entity** — `python-detectors.test.ts:488-496` — Test entity with multiple methods.
- **entity** — `python-detectors.test.ts:498-506` — Test entity with deep nesting.
- **entity** — `python-detectors.test.ts:508-516` — Test entity with complex logic.
- **entity** — `python-detectors.test.ts:518-526` — Test entity with exception handling.
- **entity** — `python-detectors.test.ts:528-540` — Test entity with SQL query pattern.
- **entity** — `python-detectors.test.ts:542-552` — Test entity with command execution.
- **entity** — `python-detectors.test.ts:554-564` — Test entity with file operations.
- **entity** — `python-detectors.test.ts:566-574` — Test entity with network operations.
- **entity** — `python-detectors.test.ts:576-586` — Test entity with cryptographic operations.
- **entity** — `python-detectors.test.ts:588-596` — Test entity with performance-critical code.
- **entity** — `python-detectors.test.ts:602-612` — Test entity with data processing.
- **entity** — `python-detectors.test.ts:614-622` — Test entity with machine learning pattern.
- **entity** — `python-detectors.test.ts:624-634` — Test entity with data serialization.
- **entity** — `python-detectors.test.ts:636-644` — Test entity with caching pattern.
- **entity** — `python-detectors.test.ts:646-655` — Test entity with logging pattern.
- **entity** — `python-detectors.test.ts:657-665` — Test entity with monitoring pattern.
- **entity** — `python-detectors.test.ts:667-677` — Test entity with debugging pattern.
- **entity** — `python-detectors.test.ts:679-687` — Test entity with testing pattern.
- **entity** — `python-detectors.test.ts:689-699` — Test entity with validation pattern.
- **entity** — `python-detectors.test.ts:701-709` — Test entity with error recovery pattern.

### Rule File Validation Variables

- **content** — `python-rules.test.ts:120-128` — Raw rule file content for schema validation test.
- **content** — `python-rules.test.ts:130-135` — Rule file with relationship criteria test data.
- **content** — `python-rules.test.ts:137-143` — Rule file with structural criteria test data.
- **content** — `python-rules.test.ts:145-151` — Rule file with pattern definition test data.
- **p** — `python-rules.test.ts:148-148` — Parsed pattern from rule file validation.
- **content** — `python-rules.test.ts:153-163` — Rule file with detector references test data.
- **content** — `python-rules.test.ts:165-181` — Rule file with complex detector mapping test data.
- **RegExp** — `python-rules.test.ts:172-172` — Regex pattern for rule validation.
- **RegExp** — `python-rules.test.ts:177-177` — Regex pattern for detector name extraction.
- **content** — `python-rules.test.ts:183-204` — Rule file with hints/recommendations test data.
- **p** — `python-rules.test.ts:188-199` — Parsed hints from rule file.
- **content** — `python-rules.test.ts:206-213` — Rule file with severity levels test data.
- **content** — `python-rules.test.ts:215-222` — Rule file with category classification test data.
- **files** — `python-rules.test.ts:225-239` — Collection of rule files for batch validation.
- **f** — `python-rules.test.ts:226-226` — Individual rule file for iteration.
- **content** — `python-rules.test.ts:229-237` — Bulk rule file content validation.

### Stacktrace Parsing Variables

- **result** — `stacktrace-parsers.test.ts:41-41` — Parsed result from JavaScript stacktrace sample.
- **result** — `stacktrace-parsers.test.ts:48-48` — Parsed result with frame filtering.
- **result** — `stacktrace-parsers.test.ts:53-53` — Parsed result with async frame detection.
- **first** — `stacktrace-parsers.test.ts:54-54` — First frame from parsed stacktrace.
- **result** — `stacktrace-parsers.test.ts:62-62` — Parsed result with node_modules handling.
- **asyncFrame** — `stacktrace-parsers.test.ts:63-63` — Async function frame extraction.
- **result** — `stacktrace-parsers.test.ts:69-69` — Parsed result with node_modules identification.
- **nodeModFrame** — `stacktrace-parsers.test.ts:70-70` — Frame from node_modules detection.
- **sample** — `stacktrace-parsers.test.ts:77-78` — Sample stacktrace fixture.
- **result** — `stacktrace-parsers.test.ts:79-79` — Parsed result from sample stacktrace.
- **sample** — `stacktrace-parsers.test.ts:85-86` — Alternative sample stacktrace fixture.
- **result** — `stacktrace-parsers.test.ts:87-87` — Parsed result from alternative sample.
- **parser** — `stacktrace-parsers.test.ts:24-24` — Stacktrace parser instance.
- **parser** — `stacktrace-parsers.test.ts:99-99` — Parser for Java stacktrace format.
- **SAMPLE** — `stacktrace-parsers.test.ts:101-108` — Java stacktrace sample fixture.
- **result** — `stacktrace-parsers.test.ts:115-115` — Parsed result from Java stacktrace.
- **result** — `stacktrace-parsers.test.ts:122-122` — Parsed frame count validation.
- **result** — `stacktrace-parsers.test.ts:127-127` — Parsed frame content validation.

### Stacktrace Classifier Result Variables

- **result** — `stacktrace-classifier.test.ts:27-27` — Classification result for NullPointerException.
- **result** — `stacktrace-classifier.test.ts:33-33` — Classification result for null field access.
- **result** — `stacktrace-classifier.test.ts:38-38` — Classification result for null array index.
- **result** — `stacktrace-classifier.test.ts:43-43` — Classification result for null method call.
- **result** — `stacktrace-classifier.test.ts:53-53` — Classification result for JavaScript TypeError.
- **result** — `stacktrace-classifier.test.ts:60-60` — Classification result for undefined property.
- **result** — `stacktrace-classifier.test.ts:70-70` — Classification result for mixed language null reference.
- **result** — `stacktrace-classifier.test.ts:75-75` — Classification result for nested null dereference.
- **result** — `stacktrace-classifier.test.ts:80-80` — Classification result for chained null access.
- **result** — `stacktrace-classifier.test.ts:85-85` — Classification result for array bounds null.
- **result** — `stacktrace-classifier.test.ts:95-95` — Classification result for frame-level null detection.
- **result** — `stacktrace-classifier.test.ts:100-100` — Classification result for frame parsing validation.
- **result** — `stacktrace-classifier.test.ts:105-105` — Classification result for frame correlation.
- **result** — `stacktrace-classifier.test.ts:115-115` — Classification result for deep stack null reference.
- **result** — `stacktrace-classifier.test.ts:120-120` — Classification result for intermediate frame null.
- **result** — `stacktrace-classifier.test.ts:126-126` — Classification result for TypeError with stack depth.
- **result** — `stacktrace-classifier.test.ts:136-136` — Classification result for async null reference.
- **result** — `stacktrace-classifier.test.ts:142-142` — Classification result for promise chain null.
- **result** — `stacktrace-classifier.test.ts:147-147` — Classification result for async/await null reference.
- **result** — `stacktrace-classifier.test.ts:157-157` — Classification result for wrapped exception null.
- **result** — `stacktrace-classifier.test.ts:163-163` — Classification result for cause chain null reference.
- **result** — `stacktrace-classifier.test.ts:173-173` — Additional null reference classification test result.
- **result** — `stacktrace-classifier.test.ts:178-178` — Additional null reference classification test result.
- **result** — `stacktrace-classifier.test.ts:188-188` — Additional null reference classification test result.
- **result** — `stacktrace-classifier.test.ts:194-194` — Additional null reference classification test result.
- **result** — `stacktrace-classifier.test.ts:204-204` — Additional null reference classification test result.
- **result** — `stacktrace-classifier.test.ts:209-209` — Additional null reference classification test result.
- **result** — `stacktrace-classifier.test.ts:214-214` — Additional null reference classification test result.

## Dependencies

**Internal:**
- ~~`src/analysis/patterns/detectors/python.js`~~ (deleted) — Python anti-pattern detection functions (checkAssertTrueBool, checkDjangoSqlInjection, checkPdDataLeakage, etc.)
- ~~`src/analysis/stacktrace/classifier.ts`~~ (deleted) — Stacktrace classification engine
- `src/analysis/stacktrace/parsers/*` — Language-specific stacktrace parsers (JavaScript, Java, Python, etc.)
- ~~`src/types/storage.js`~~ (deleted) — Entity and EntityType type definitions

**External:**
- `zod` — Schema validation library for rule file parsing
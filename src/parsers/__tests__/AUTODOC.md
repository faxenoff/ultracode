# Module: src/parsers/__tests__

## 🤖 Overview

The `HelmParser` module is designed to parse and extract entities from Helm charts, particularly focusing on the `Chart.yaml` file. It is used by developers and maintainers of Helm charts to understand and manage their chart's metadata and dependencies.

## 🤖 Architecture

```
  +-------------------+
  |   HelmParser     |
  +-------------------+
  | - parseChartYAML  |
  | - extractEntities |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   parseChartYAML  |
  +-------------------+
  |     |             |
  |     v             |
  +-------------------+
  | extractEntities   |
  +-------------------+
  |     |             |
  |     v             |
  +-------------------+
  |   return entities |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **callNames** — Maps the calls in the file entity to their names `helm-parser.test.ts:278-278`
- **callNames** — Stores names of called functions or methods `helm-parser.test.ts:910-910`
- **define** — Finds the child entity named "my-chart.name" in the file entity `helm-parser.test.ts:191-191`
- **define** — Finds the child entity named "my-chart.labels" in the result entities `helm-parser.test.ts:202-202`
- **defines** — Filters the children of the result entities to find those with metadata of type "named-template" `helm-parser.test.ts:221-221`
- **defines** — Filters entities to find those with a named-template metadata `helm-parser.test.ts:239-239`
- **elseIfBranch** — Finds the branch of type "else-if" in the cf branches `helm-parser.test.ts:441-441`
- **ifBranch** — Finds the branch of type "if" in the cf branches `helm-parser.test.ts:408-408`
- **indentPattern** — Identifies the pattern with the indent function "indent" `helm-parser.test.ts:558-558`
- **names** — Stores names of entities parsed from the Chart.yaml file `helm-parser.test.ts:122-122`
- **nindentPattern** — Identifies the pattern with the indent function "nindent" `helm-parser.test.ts:542-542`
- **pgDep** — Represents a PostgreSQL dependency in the Chart.yaml file `helm-parser.test.ts:81-81`
- **redisDep** — Represents a Redis dependency in the Chart.yaml file `helm-parser.test.ts:88-88`
- **resources** — Finds the entity named "resources" in the result `helm-parser.test.ts:156-156`
- **targets** — Maps the relationships in the result to their targets `helm-parser.test.ts:307-307`
- **toYamlPattern** — Converts a value to a YAML pattern `helm-parser.test.ts:604-604`
- **valuesRefs** — Filters the refs to find those matching ".Values.replicaCount" `helm-parser.test.ts:380-380`
- **varEntity** — Finds the child entity named "$name" in the file entity `helm-parser.test.ts:491-491`
- **varEntity** — Finds the entity with the name "$x" among the children `helm-parser.test.ts:520-520`
- **varEntity** — Represents a variable entity in the parsed chart `helm-parser.test.ts:930-930`
- **vars** — Filters entities to find those with metadata indicating they are template variables `helm-parser.test.ts:509-509`
- **withBranch** — Finds the branch of type "if" with condition ".Values.nodeSelector" in the cf branches `helm-parser.test.ts:466-466`

### Import_decl
- **../helm-parser.js** — Imports `../helm-parser.js` from `../helm-parser.js`. `helm-parser.test.ts:2-2`
- **vitest** — Imports `vitest` from `vitest`. `helm-parser.test.ts:1-1`

### Property
- **indentFunction** — Stores the indent function as a string `helm-parser.test.ts:537-537`
- **indentFunction** — Parses indentation levels in YAML content `helm-parser.test.ts:553-553`
- **indentFunction** — Represents the indentation function as a string `helm-parser.test.ts:569-569`, `helm-parser.test.ts:599-599`
- **indentValue** — Stores the indent value as a number `helm-parser.test.ts:538-538`
- **indentValue** — Represents a value with its indentation level `helm-parser.test.ts:554-554`
- **indentValue** — Represents the indentation value as a number `helm-parser.test.ts:600-600`
- **pipeline** — Represents a sequence of operations for parsing Helm charts `helm-parser.test.ts:570-570`
- **yamlContextIndent** — Manages indentation context for YAML parsing `helm-parser.test.ts:583-583`

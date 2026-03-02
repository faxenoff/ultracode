/**
 * Global Cache Data Exports
 *
 * Re-exports all language built-ins and framework patterns.
 */

export {
  ANGULAR_PATTERNS,
  EXPRESS_PATTERNS,
  NESTJS_PATTERNS,
  REACT_PATTERNS,
  VUE_PATTERNS,
} from "./frameworks.js";
export { GO_BUILTINS, RUST_BUILTINS } from "./go-rust.js";
export { JAVA_BUILTINS, KOTLIN_BUILTINS } from "./java-kotlin.js";
export { JAVASCRIPT_BUILTINS, JAVASCRIPT_ENTITY_PATTERNS, TYPESCRIPT_BUILTINS } from "./javascript.js";
export { NODEJS_BUILTINS } from "./nodejs.js";
export { PYTHON_BUILTINS } from "./python.js";
export { TESTING_PATTERNS } from "./testing.js";

import type { GlobalCacheEntry } from "../types.js";
import { ANGULAR_PATTERNS, EXPRESS_PATTERNS, NESTJS_PATTERNS, REACT_PATTERNS, VUE_PATTERNS } from "./frameworks.js";
import { GO_BUILTINS, RUST_BUILTINS } from "./go-rust.js";
import { JAVA_BUILTINS, KOTLIN_BUILTINS } from "./java-kotlin.js";
import { JAVASCRIPT_BUILTINS, JAVASCRIPT_ENTITY_PATTERNS, TYPESCRIPT_BUILTINS } from "./javascript.js";
import { NODEJS_BUILTINS } from "./nodejs.js";
import { PYTHON_BUILTINS } from "./python.js";
import { TESTING_PATTERNS } from "./testing.js";

/**
 * Get all global cache entries combined
 */
export function getAllGlobalEntries(): GlobalCacheEntry[] {
  return [
    ...JAVASCRIPT_BUILTINS,
    ...JAVASCRIPT_ENTITY_PATTERNS,
    ...TYPESCRIPT_BUILTINS,
    ...NODEJS_BUILTINS,
    ...PYTHON_BUILTINS,
    ...JAVA_BUILTINS,
    ...KOTLIN_BUILTINS,
    ...GO_BUILTINS,
    ...RUST_BUILTINS,
    ...REACT_PATTERNS,
    ...ANGULAR_PATTERNS,
    ...VUE_PATTERNS,
    ...EXPRESS_PATTERNS,
    ...NESTJS_PATTERNS,
    ...TESTING_PATTERNS,
  ];
}

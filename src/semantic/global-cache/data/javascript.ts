/**
 * JavaScript/TypeScript Built-ins
 */

import type { GlobalCacheEntry } from "../types.js";

/**
 * JavaScript/TypeScript built-in objects and methods
 */
export const JAVASCRIPT_BUILTINS: GlobalCacheEntry[] = [
  // Array methods
  { text: "Array.prototype.map", category: "builtin", language: "javascript" },
  { text: "Array.prototype.filter", category: "builtin", language: "javascript" },
  { text: "Array.prototype.reduce", category: "builtin", language: "javascript" },
  { text: "Array.prototype.forEach", category: "builtin", language: "javascript" },
  { text: "Array.prototype.find", category: "builtin", language: "javascript" },
  { text: "Array.prototype.findIndex", category: "builtin", language: "javascript" },
  { text: "Array.prototype.some", category: "builtin", language: "javascript" },
  { text: "Array.prototype.every", category: "builtin", language: "javascript" },
  { text: "Array.prototype.includes", category: "builtin", language: "javascript" },
  { text: "Array.prototype.indexOf", category: "builtin", language: "javascript" },
  { text: "Array.prototype.slice", category: "builtin", language: "javascript" },
  { text: "Array.prototype.splice", category: "builtin", language: "javascript" },
  { text: "Array.prototype.concat", category: "builtin", language: "javascript" },
  { text: "Array.prototype.join", category: "builtin", language: "javascript" },
  { text: "Array.prototype.sort", category: "builtin", language: "javascript" },
  { text: "Array.prototype.reverse", category: "builtin", language: "javascript" },
  { text: "Array.prototype.flat", category: "builtin", language: "javascript" },
  { text: "Array.prototype.flatMap", category: "builtin", language: "javascript" },
  { text: "Array.from", category: "builtin", language: "javascript" },
  { text: "Array.isArray", category: "builtin", language: "javascript" },

  // Object methods
  { text: "Object.keys", category: "builtin", language: "javascript" },
  { text: "Object.values", category: "builtin", language: "javascript" },
  { text: "Object.entries", category: "builtin", language: "javascript" },
  { text: "Object.assign", category: "builtin", language: "javascript" },
  { text: "Object.freeze", category: "builtin", language: "javascript" },
  { text: "Object.seal", category: "builtin", language: "javascript" },
  { text: "Object.create", category: "builtin", language: "javascript" },
  { text: "Object.defineProperty", category: "builtin", language: "javascript" },
  { text: "Object.getOwnPropertyNames", category: "builtin", language: "javascript" },
  { text: "Object.hasOwn", category: "builtin", language: "javascript" },

  // String methods
  { text: "String.prototype.split", category: "builtin", language: "javascript" },
  { text: "String.prototype.trim", category: "builtin", language: "javascript" },
  { text: "String.prototype.replace", category: "builtin", language: "javascript" },
  { text: "String.prototype.replaceAll", category: "builtin", language: "javascript" },
  { text: "String.prototype.includes", category: "builtin", language: "javascript" },
  { text: "String.prototype.startsWith", category: "builtin", language: "javascript" },
  { text: "String.prototype.endsWith", category: "builtin", language: "javascript" },
  { text: "String.prototype.toLowerCase", category: "builtin", language: "javascript" },
  { text: "String.prototype.toUpperCase", category: "builtin", language: "javascript" },
  { text: "String.prototype.slice", category: "builtin", language: "javascript" },
  { text: "String.prototype.substring", category: "builtin", language: "javascript" },
  { text: "String.prototype.padStart", category: "builtin", language: "javascript" },
  { text: "String.prototype.padEnd", category: "builtin", language: "javascript" },

  // Promise
  { text: "Promise.resolve", category: "builtin", language: "javascript" },
  { text: "Promise.reject", category: "builtin", language: "javascript" },
  { text: "Promise.all", category: "builtin", language: "javascript" },
  { text: "Promise.allSettled", category: "builtin", language: "javascript" },
  { text: "Promise.race", category: "builtin", language: "javascript" },
  { text: "Promise.any", category: "builtin", language: "javascript" },
  { text: "new Promise", category: "builtin", language: "javascript" },
  { text: "async function", category: "builtin", language: "javascript" },
  { text: "await", category: "builtin", language: "javascript" },

  // Console
  { text: "console.log", category: "builtin", language: "javascript" },
  { text: "console.error", category: "builtin", language: "javascript" },
  { text: "console.warn", category: "builtin", language: "javascript" },
  { text: "console.info", category: "builtin", language: "javascript" },
  { text: "console.debug", category: "builtin", language: "javascript" },
  { text: "console.table", category: "builtin", language: "javascript" },
  { text: "console.time", category: "builtin", language: "javascript" },
  { text: "console.timeEnd", category: "builtin", language: "javascript" },

  // Math
  { text: "Math.abs", category: "builtin", language: "javascript" },
  { text: "Math.floor", category: "builtin", language: "javascript" },
  { text: "Math.ceil", category: "builtin", language: "javascript" },
  { text: "Math.round", category: "builtin", language: "javascript" },
  { text: "Math.max", category: "builtin", language: "javascript" },
  { text: "Math.min", category: "builtin", language: "javascript" },
  { text: "Math.random", category: "builtin", language: "javascript" },
  { text: "Math.pow", category: "builtin", language: "javascript" },
  { text: "Math.sqrt", category: "builtin", language: "javascript" },

  // JSON
  { text: "JSON.parse", category: "builtin", language: "javascript" },
  { text: "JSON.stringify", category: "builtin", language: "javascript" },

  // Date
  { text: "new Date", category: "builtin", language: "javascript" },
  { text: "Date.now", category: "builtin", language: "javascript" },
  { text: "Date.parse", category: "builtin", language: "javascript" },

  // Map/Set
  { text: "new Map", category: "builtin", language: "javascript" },
  { text: "new Set", category: "builtin", language: "javascript" },
  { text: "new WeakMap", category: "builtin", language: "javascript" },
  { text: "new WeakSet", category: "builtin", language: "javascript" },

  // Timers
  { text: "setTimeout", category: "builtin", language: "javascript" },
  { text: "setInterval", category: "builtin", language: "javascript" },
  { text: "clearTimeout", category: "builtin", language: "javascript" },
  { text: "clearInterval", category: "builtin", language: "javascript" },

  // Error handling
  { text: "try catch", category: "pattern", language: "javascript" },
  { text: "throw new Error", category: "pattern", language: "javascript" },
  { text: "try catch finally", category: "pattern", language: "javascript" },
];

/**
 * Common JavaScript/TypeScript entity-level patterns.
 * These appear as real parsed entities and have predictable embeddingText.
 */
export const JAVASCRIPT_ENTITY_PATTERNS: GlobalCacheEntry[] = [
  // Class members — appear as real parsed entities
  {
    text: "constructor",
    embeddingText: "constructor function\ndescription: class constructor initializes instance",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "toString",
    embeddingText: "toString method\ndescription: returns string representation of the object\nreturns: string",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "valueOf",
    embeddingText: "valueOf method\ndescription: returns primitive value of the object",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "toJSON",
    embeddingText:
      "toJSON method\ndescription: returns json-serializable representation of the object\nreturns: object",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "fromJSON",
    embeddingText: "fromJSON function\ndescription: deserializes object from json representation\nreturns: object",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "clone",
    embeddingText: "clone method\ndescription: creates a deep copy of the object",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "equals",
    embeddingText: "equals method\ndescription: compares equality with another object\nreturns: boolean",
    category: "pattern",
    language: "javascript",
  },
  // Entry points
  {
    text: "main",
    embeddingText: "main function\ndescription: application entry point",
    category: "pattern",
    language: "javascript",
  },
  // Common lifecycle/setup patterns
  {
    text: "init",
    embeddingText: "init function\ndescription: initializes module or service",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "setup",
    embeddingText: "setup function\ndescription: sets up configuration or dependencies",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "teardown",
    embeddingText: "teardown function\ndescription: cleans up resources and state",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "destroy",
    embeddingText: "destroy method\ndescription: cleans up resources and event listeners",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "dispose",
    embeddingText: "dispose method\ndescription: releases managed resources",
    category: "pattern",
    language: "javascript",
  },
];

/**
 * TypeScript-specific built-ins and utility types
 */
export const TYPESCRIPT_BUILTINS: GlobalCacheEntry[] = [
  // Utility types
  { text: "Partial<T>", category: "builtin", language: "typescript" },
  { text: "Required<T>", category: "builtin", language: "typescript" },
  { text: "Readonly<T>", category: "builtin", language: "typescript" },
  { text: "Pick<T, K>", category: "builtin", language: "typescript" },
  { text: "Omit<T, K>", category: "builtin", language: "typescript" },
  { text: "Record<K, V>", category: "builtin", language: "typescript" },
  { text: "Exclude<T, U>", category: "builtin", language: "typescript" },
  { text: "Extract<T, U>", category: "builtin", language: "typescript" },
  { text: "NonNullable<T>", category: "builtin", language: "typescript" },
  { text: "ReturnType<T>", category: "builtin", language: "typescript" },
  { text: "Parameters<T>", category: "builtin", language: "typescript" },
  { text: "InstanceType<T>", category: "builtin", language: "typescript" },
  { text: "Awaited<T>", category: "builtin", language: "typescript" },

  // Type operators
  { text: "keyof", category: "builtin", language: "typescript" },
  { text: "typeof", category: "builtin", language: "typescript" },
  { text: "infer", category: "builtin", language: "typescript" },
  { text: "extends", category: "builtin", language: "typescript" },
  { text: "as const", category: "builtin", language: "typescript" },
  { text: "satisfies", category: "builtin", language: "typescript" },

  // Common patterns
  { text: "interface", category: "pattern", language: "typescript" },
  { text: "type alias", category: "pattern", language: "typescript" },
  { text: "enum", category: "pattern", language: "typescript" },
  { text: "generic function", category: "pattern", language: "typescript" },
  { text: "type guard", category: "pattern", language: "typescript" },
  { text: "discriminated union", category: "pattern", language: "typescript" },
];

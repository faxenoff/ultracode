/**
 * Go and Rust Built-ins
 */

import type { GlobalCacheEntry } from "../types.js";

/**
 * Go built-ins
 */
export const GO_BUILTINS: GlobalCacheEntry[] = [
  // Built-in functions
  { text: "fmt.Println", category: "stdlib", language: "go" },
  { text: "fmt.Printf", category: "stdlib", language: "go" },
  { text: "fmt.Sprintf", category: "stdlib", language: "go" },
  { text: "fmt.Errorf", category: "stdlib", language: "go" },
  { text: "make", category: "builtin", language: "go" },
  { text: "new", category: "builtin", language: "go" },
  { text: "append", category: "builtin", language: "go" },
  { text: "copy", category: "builtin", language: "go" },
  { text: "delete", category: "builtin", language: "go" },
  { text: "len", category: "builtin", language: "go" },
  { text: "cap", category: "builtin", language: "go" },
  { text: "close", category: "builtin", language: "go" },
  { text: "panic", category: "builtin", language: "go" },
  { text: "recover", category: "builtin", language: "go" },

  // Common imports
  { text: 'import "fmt"', category: "stdlib", language: "go" },
  { text: 'import "os"', category: "stdlib", language: "go" },
  { text: 'import "io"', category: "stdlib", language: "go" },
  { text: 'import "net/http"', category: "stdlib", language: "go" },
  { text: 'import "encoding/json"', category: "stdlib", language: "go" },
  { text: 'import "context"', category: "stdlib", language: "go" },
  { text: 'import "sync"', category: "stdlib", language: "go" },
  { text: 'import "time"', category: "stdlib", language: "go" },
  { text: 'import "errors"', category: "stdlib", language: "go" },
  { text: 'import "strings"', category: "stdlib", language: "go" },

  // Patterns — including entity-level with embeddingText
  { text: "if err != nil", category: "pattern", language: "go" },
  { text: "defer", category: "pattern", language: "go" },
  { text: "go func()", category: "pattern", language: "go" },
  { text: "select", category: "pattern", language: "go" },
  { text: "chan", category: "pattern", language: "go" },
  { text: "interface{}", category: "pattern", language: "go" },
  { text: "struct{}", category: "pattern", language: "go" },
  {
    text: "New",
    embeddingText: "New function\ndescription: go constructor function returns new instance",
    category: "pattern",
    language: "go",
  },
  {
    text: "String",
    embeddingText: "String method\ndescription: go stringer interface returns string representation\nreturns: string",
    category: "pattern",
    language: "go",
  },
  {
    text: "Error",
    embeddingText: "Error method\ndescription: go error interface returns error message\nreturns: string",
    category: "pattern",
    language: "go",
  },
  {
    text: "main",
    embeddingText: "main function\ndescription: go application entry point",
    category: "pattern",
    language: "go",
  },
  {
    text: "init",
    embeddingText: "init function\ndescription: go package initialization function called before main",
    category: "pattern",
    language: "go",
  },
  {
    text: "Close",
    embeddingText: "Close method\ndescription: closes connection or resource and releases associated memory",
    category: "pattern",
    language: "go",
  },
  {
    text: "ServeHTTP",
    embeddingText:
      "ServeHTTP method\ndescription: go http handler interface serves http requests\nparams: w:ResponseWriter, r:*Request",
    category: "pattern",
    language: "go",
  },
];

/**
 * Rust built-ins
 */
export const RUST_BUILTINS: GlobalCacheEntry[] = [
  // Common types
  { text: "Option<T>", category: "builtin", language: "rust" },
  { text: "Result<T, E>", category: "builtin", language: "rust" },
  { text: "Vec<T>", category: "builtin", language: "rust" },
  { text: "String", category: "builtin", language: "rust" },
  { text: "&str", category: "builtin", language: "rust" },
  { text: "Box<T>", category: "builtin", language: "rust" },
  { text: "Rc<T>", category: "builtin", language: "rust" },
  { text: "Arc<T>", category: "builtin", language: "rust" },
  { text: "HashMap<K, V>", category: "builtin", language: "rust" },
  { text: "HashSet<T>", category: "builtin", language: "rust" },

  // Common methods
  { text: ".unwrap()", category: "builtin", language: "rust" },
  { text: ".expect()", category: "builtin", language: "rust" },
  { text: ".ok()", category: "builtin", language: "rust" },
  { text: ".err()", category: "builtin", language: "rust" },
  { text: ".map()", category: "builtin", language: "rust" },
  { text: ".and_then()", category: "builtin", language: "rust" },
  { text: ".or_else()", category: "builtin", language: "rust" },
  { text: ".collect()", category: "builtin", language: "rust" },
  { text: ".iter()", category: "builtin", language: "rust" },
  { text: ".into_iter()", category: "builtin", language: "rust" },
  { text: ".clone()", category: "builtin", language: "rust" },

  // Macros
  { text: "println!", category: "builtin", language: "rust" },
  { text: "format!", category: "builtin", language: "rust" },
  { text: "vec!", category: "builtin", language: "rust" },
  { text: "panic!", category: "builtin", language: "rust" },
  { text: "assert!", category: "builtin", language: "rust" },
  { text: "assert_eq!", category: "builtin", language: "rust" },
  { text: "derive", category: "builtin", language: "rust" },

  // Common imports
  { text: "use std::collections::HashMap", category: "stdlib", language: "rust" },
  { text: "use std::io", category: "stdlib", language: "rust" },
  { text: "use std::fs", category: "stdlib", language: "rust" },
  { text: "use std::sync::Arc", category: "stdlib", language: "rust" },
  { text: "use std::sync::Mutex", category: "stdlib", language: "rust" },

  // Patterns — including entity-level with embeddingText
  { text: "impl", category: "pattern", language: "rust" },
  { text: "match", category: "pattern", language: "rust" },
  { text: "if let", category: "pattern", language: "rust" },
  { text: "while let", category: "pattern", language: "rust" },
  { text: "async fn", category: "pattern", language: "rust" },
  { text: ".await", category: "pattern", language: "rust" },
  { text: "#[derive(", category: "pattern", language: "rust" },
  {
    text: "fn main",
    embeddingText: "main function\ndescription: rust application entry point",
    category: "pattern",
    language: "rust",
  },
  {
    text: "fn new",
    embeddingText: "new function\ndescription: rust constructor creates a new instance",
    category: "pattern",
    language: "rust",
  },
  {
    text: "fn fmt",
    embeddingText:
      "fmt method\ndescription: rust display trait implementation for formatting\nparams: f:Formatter\nreturns: Result",
    category: "pattern",
    language: "rust",
  },
  {
    text: "fn from",
    embeddingText: "from function\ndescription: rust from trait converts from another type",
    category: "pattern",
    language: "rust",
  },
  {
    text: "fn drop",
    embeddingText: "drop method\ndescription: rust drop trait cleanup called when value goes out of scope",
    category: "pattern",
    language: "rust",
  },
];

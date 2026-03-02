/**
 * Node.js Core Module Patterns
 */

import type { GlobalCacheEntry } from "../types.js";

/**
 * Node.js built-in modules: fs, path, process, os, Buffer, http, stream, events
 */
export const NODEJS_BUILTINS: GlobalCacheEntry[] = [
  // fs module
  { text: "fs.readFile", category: "stdlib", language: "javascript" },
  { text: "fs.writeFile", category: "stdlib", language: "javascript" },
  { text: "fs.readFileSync", category: "stdlib", language: "javascript" },
  { text: "fs.writeFileSync", category: "stdlib", language: "javascript" },
  { text: "fs.readdir", category: "stdlib", language: "javascript" },
  { text: "fs.readdirSync", category: "stdlib", language: "javascript" },
  { text: "fs.stat", category: "stdlib", language: "javascript" },
  { text: "fs.statSync", category: "stdlib", language: "javascript" },
  { text: "fs.mkdir", category: "stdlib", language: "javascript" },
  { text: "fs.mkdirSync", category: "stdlib", language: "javascript" },
  { text: "fs.unlink", category: "stdlib", language: "javascript" },
  { text: "fs.unlinkSync", category: "stdlib", language: "javascript" },
  { text: "fs.existsSync", category: "stdlib", language: "javascript" },
  { text: "fs.copyFile", category: "stdlib", language: "javascript" },
  { text: "fs.rename", category: "stdlib", language: "javascript" },
  { text: "fs.createReadStream", category: "stdlib", language: "javascript" },
  { text: "fs.createWriteStream", category: "stdlib", language: "javascript" },
  { text: "fs/promises", category: "stdlib", language: "javascript" },
  { text: "import fs from 'node:fs'", category: "stdlib", language: "javascript" },
  { text: "import { readFile, writeFile } from 'node:fs/promises'", category: "stdlib", language: "javascript" },

  // path module
  { text: "path.join", category: "stdlib", language: "javascript" },
  { text: "path.resolve", category: "stdlib", language: "javascript" },
  { text: "path.dirname", category: "stdlib", language: "javascript" },
  { text: "path.basename", category: "stdlib", language: "javascript" },
  { text: "path.extname", category: "stdlib", language: "javascript" },
  { text: "path.parse", category: "stdlib", language: "javascript" },
  { text: "path.relative", category: "stdlib", language: "javascript" },
  { text: "path.isAbsolute", category: "stdlib", language: "javascript" },
  { text: "import path from 'node:path'", category: "stdlib", language: "javascript" },
  { text: "import { join, resolve, dirname } from 'node:path'", category: "stdlib", language: "javascript" },

  // process
  { text: "process.env", category: "stdlib", language: "javascript" },
  { text: "process.exit", category: "stdlib", language: "javascript" },
  { text: "process.cwd", category: "stdlib", language: "javascript" },
  { text: "process.argv", category: "stdlib", language: "javascript" },
  { text: "process.platform", category: "stdlib", language: "javascript" },
  { text: "process.stdout", category: "stdlib", language: "javascript" },
  { text: "process.stderr", category: "stdlib", language: "javascript" },

  // os module
  { text: "os.homedir", category: "stdlib", language: "javascript" },
  { text: "os.platform", category: "stdlib", language: "javascript" },
  { text: "os.tmpdir", category: "stdlib", language: "javascript" },
  { text: "os.cpus", category: "stdlib", language: "javascript" },
  { text: "os.freemem", category: "stdlib", language: "javascript" },
  { text: "import os from 'node:os'", category: "stdlib", language: "javascript" },

  // Buffer
  { text: "Buffer.from", category: "builtin", language: "javascript" },
  { text: "Buffer.alloc", category: "builtin", language: "javascript" },
  { text: "Buffer.concat", category: "builtin", language: "javascript" },
  { text: "Buffer.isBuffer", category: "builtin", language: "javascript" },

  // http / https
  { text: "http.createServer", category: "stdlib", language: "javascript" },
  { text: "https.request", category: "stdlib", language: "javascript" },
  { text: "import http from 'node:http'", category: "stdlib", language: "javascript" },
  { text: "import https from 'node:https'", category: "stdlib", language: "javascript" },

  // url
  { text: "new URL", category: "builtin", language: "javascript" },
  { text: "URL.parse", category: "stdlib", language: "javascript" },
  { text: "import { URL } from 'node:url'", category: "stdlib", language: "javascript" },

  // crypto
  { text: "crypto.randomUUID", category: "stdlib", language: "javascript" },
  { text: "crypto.createHash", category: "stdlib", language: "javascript" },
  { text: "crypto.createHmac", category: "stdlib", language: "javascript" },
  { text: "import crypto from 'node:crypto'", category: "stdlib", language: "javascript" },

  // stream
  { text: "stream.Readable", category: "stdlib", language: "javascript" },
  { text: "stream.Writable", category: "stdlib", language: "javascript" },
  { text: "stream.Transform", category: "stdlib", language: "javascript" },

  // events
  { text: "EventEmitter", category: "stdlib", language: "javascript" },
  { text: "import { EventEmitter } from 'node:events'", category: "stdlib", language: "javascript" },

  // child_process
  { text: "child_process.exec", category: "stdlib", language: "javascript" },
  { text: "child_process.spawn", category: "stdlib", language: "javascript" },
  { text: "child_process.execSync", category: "stdlib", language: "javascript" },

  // util
  { text: "util.promisify", category: "stdlib", language: "javascript" },
  { text: "util.inspect", category: "stdlib", language: "javascript" },
  { text: "import { promisify } from 'node:util'", category: "stdlib", language: "javascript" },

  // ESM patterns
  {
    text: "fileURLToPath",
    embeddingText:
      "fileURLToPath function\ndescription: convert file URL to filesystem path\nreturns: string\nparams: url:URL|string",
    category: "stdlib",
    language: "javascript",
  },
  { text: "import.meta.url", category: "pattern", language: "javascript" },
  { text: "import.meta.dirname", category: "pattern", language: "javascript" },
  {
    text: "import { fileURLToPath } from 'node:url'",
    category: "stdlib",
    language: "javascript",
  },
];

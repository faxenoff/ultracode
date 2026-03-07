/**
 * Rust Analyzer Integration
 *
 * Provides Rust analysis using rust-analyzer LSP.
 * Uses LSP protocol to get diagnostics and symbol information.
 *
 * Philosophy: Rust developers have rust-analyzer installed.
 *
 * Features:
 * - Diagnostics (errors, warnings)
 * - Type information
 * - Symbol resolution
 */

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { log } from "../logging/index.js";
import type { ParsedEntity } from "../types/parser.js";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * LSP document symbol from rust-analyzer
 */
interface LSPDocumentSymbol {
  name: string;
  kind: number;
  range?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  location?: {
    range: {
      start: { line: number; character: number };
      end: { line: number; character: number };
    };
  };
  detail?: string;
  children?: LSPDocumentSymbol[];
}

/**
 * Extended ParsedEntity with rust-analyzer info
 */
interface ParsedEntityWithRAInfo extends ParsedEntity {
  rustAnalyzerInfo?: {
    kind: string;
    detail: string;
  };
}

/**
 * Runtime-aware sleep - uses Bun.sleep for Bun, setTimeout for Node.js
 */
async function sleep(ms: number): Promise<void> {
  if (typeof globalThis.Bun?.sleep === "function") {
    await globalThis.Bun.sleep(ms);
  } else {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface RustDiagnostic {
  severity: "error" | "warning" | "info" | "hint";
  message: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  code?: string;
  source?: string | undefined;
}

export interface RustAnalyzerResult {
  diagnostics: RustDiagnostic[];
  symbols?: RustSymbolInfo[];
}

export interface RustSymbolInfo {
  name: string;
  kind: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  detail?: string | undefined;
}

// LSP message types
interface LSPMessage {
  jsonrpc: "2.0";
  id?: number | undefined;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string };
}

// =============================================================================
// RUST-ANALYZER CLIENT
// =============================================================================

let rustAnalyzerPath: string | null = null;
let rustAnalyzerChecked = false;
let rustAnalyzerProcess: ChildProcess | null = null;
let messageId = 0;
const pendingRequests = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
let initialized = false;
let messageBuffer = "";

/**
 * Find rust-analyzer executable
 */
export async function findRustAnalyzer(): Promise<string | null> {
  if (rustAnalyzerChecked) {
    return rustAnalyzerPath;
  }

  rustAnalyzerChecked = true;

  const commands = [
    "rust-analyzer",
    "rust-analyzer.exe",
    // Common installation paths
    join(process.env["HOME"] || "", ".cargo", "bin", "rust-analyzer"),
    join(process.env["USERPROFILE"] || "", ".cargo", "bin", "rust-analyzer.exe"),
  ];

  for (const cmd of commands) {
    try {
      const available = await checkCommand(cmd);
      if (available) {
        rustAnalyzerPath = cmd;
        log.i("RAINTEGRATION", "found", { cmd });
        return rustAnalyzerPath;
      }
    } catch {
      // Try next
    }
  }

  log.w("RAINTEGRATION", "not_found");
  return null;
}

/**
 * Check if a command is available
 */
async function checkCommand(cmd: string): Promise<boolean> {
  const proc = spawn(cmd, ["--version"], {
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  });

  const abortController = new AbortController();

  const resultPromise = new Promise<boolean>((resolve) => {
    proc.on("error", () => {
      abortController.abort();
      resolve(false);
    });
    proc.on("close", (code) => {
      abortController.abort();
      resolve(code === 0);
    });
  });

  const timeoutPromise = (async (): Promise<boolean> => {
    await sleep(5000);
    if (!abortController.signal.aborted) {
      proc.kill();
      return false;
    }
    return new Promise(() => {}); // Never resolves if aborted
  })();

  return Promise.race([resultPromise, timeoutPromise]);
}

/**
 * Check if rust-analyzer is available
 */
export function isRustAnalyzerAvailable(): boolean {
  return rustAnalyzerPath !== null;
}

/**
 * Start rust-analyzer LSP server
 */
export async function startRustAnalyzer(workspaceRoot: string): Promise<boolean> {
  if (!rustAnalyzerPath) {
    await findRustAnalyzer();
  }

  if (!rustAnalyzerPath) {
    return false;
  }

  if (rustAnalyzerProcess) {
    return true; // Already running
  }

  return new Promise((resolve) => {
    try {
      rustAnalyzerProcess = spawn(rustAnalyzerPath!, [], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: workspaceRoot,
        windowsHide: true,
      });

      rustAnalyzerProcess.stdout?.on("data", (data: Buffer) => {
        handleLspData(data.toString());
      });

      rustAnalyzerProcess.stderr?.on("data", (data: Buffer) => {
        log.d("RAINTEGRATION", "stderr", { msg: data.toString().trim() });
      });

      rustAnalyzerProcess.on("error", (err: Error) => {
        log.e("RAINTEGRATION", "proc_err", { err: String(err) });
        rustAnalyzerProcess = null;
        resolve(false);
      });

      rustAnalyzerProcess.on("close", (_code: number | null) => {
        rustAnalyzerProcess = null;
        initialized = false;
      });

      // Send initialize request
      initializeLsp(workspaceRoot)
        .then(() => {
          initialized = true;
          resolve(true);
        })
        .catch((err) => {
          log.e("RAINTEGRATION", "init_fail", { err: String(err) });
          resolve(false);
        });
    } catch (err) {
      log.e("RAINTEGRATION", "spawn_err", { err: String(err) });
      resolve(false);
    }
  });
}

/**
 * Handle incoming LSP data
 */
function handleLspData(data: string): void {
  messageBuffer += data;

  while (true) {
    // Parse Content-Length header
    const headerEnd = messageBuffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) break;

    const header = messageBuffer.substring(0, headerEnd);
    const contentLengthMatch = header.match(/Content-Length:\s*(\d+)/i);
    if (!contentLengthMatch || !contentLengthMatch[1]) {
      messageBuffer = messageBuffer.substring(headerEnd + 4);
      continue;
    }

    const contentLength = parseInt(contentLengthMatch[1], 10);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + contentLength;

    if (messageBuffer.length < bodyEnd) break;

    const body = messageBuffer.substring(bodyStart, bodyEnd);
    messageBuffer = messageBuffer.substring(bodyEnd);

    try {
      const message = JSON.parse(body) as LSPMessage;
      handleLspMessage(message);
    } catch (e) {
      log.w("RAINTEGRATION", "parse_err", { err: String(e) });
    }
  }
}

/**
 * Handle parsed LSP message
 */
function handleLspMessage(message: LSPMessage): void {
  if (message.id !== undefined) {
    const pending = pendingRequests.get(message.id);
    if (pending) {
      pendingRequests.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
    }
  }
}

/**
 * Send LSP request
 */
async function sendRequest(method: string, params: unknown): Promise<unknown> {
  if (!rustAnalyzerProcess?.stdin) {
    throw new Error("rust-analyzer not running");
  }

  const id = ++messageId;
  const message: LSPMessage = {
    jsonrpc: "2.0",
    id,
    method,
    params,
  };

  const body = JSON.stringify(message);
  const header = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n`;

  const abortController = new AbortController();

  const responsePromise = new Promise<unknown>((resolve, reject) => {
    pendingRequests.set(id, {
      resolve: (value) => {
        abortController.abort();
        resolve(value);
      },
      reject: (err) => {
        abortController.abort();
        reject(err);
      },
    });
    rustAnalyzerProcess!.stdin!.write(header + body);
  });

  const timeoutPromise = (async (): Promise<never> => {
    await sleep(30000);
    if (!abortController.signal.aborted) {
      pendingRequests.delete(id);
      throw new Error(`Request ${method} timed out`);
    }
    return new Promise(() => {});
  })();

  return Promise.race([responsePromise, timeoutPromise]);
}

/**
 * Send LSP notification (no response expected)
 */
function sendNotification(method: string, params: unknown): void {
  if (!rustAnalyzerProcess?.stdin) return;

  const message: LSPMessage = {
    jsonrpc: "2.0",
    method,
    params,
  };

  const body = JSON.stringify(message);
  const header = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n`;

  rustAnalyzerProcess.stdin.write(header + body);
}

/**
 * Initialize LSP connection
 */
async function initializeLsp(workspaceRoot: string): Promise<void> {
  await sendRequest("initialize", {
    processId: process.pid,
    capabilities: {
      textDocument: {
        publishDiagnostics: {
          relatedInformation: true,
        },
        documentSymbol: {
          hierarchicalDocumentSymbolSupport: true,
        },
      },
    },
    rootUri: `file://${workspaceRoot.replace(/\\/g, "/")}`,
    workspaceFolders: [
      {
        uri: `file://${workspaceRoot.replace(/\\/g, "/")}`,
        name: "workspace",
      },
    ],
  });

  sendNotification("initialized", {});
}

/**
 * Open a document in rust-analyzer
 */
export function openDocument(filePath: string, content: string): void {
  if (!initialized) return;

  const uri = `file://${filePath.replace(/\\/g, "/")}`;

  sendNotification("textDocument/didOpen", {
    textDocument: {
      uri,
      languageId: "rust",
      version: 1,
      text: content,
    },
  });
}

/**
 * Close a document in rust-analyzer
 */
export function closeDocument(filePath: string): void {
  if (!initialized) return;

  const uri = `file://${filePath.replace(/\\/g, "/")}`;

  sendNotification("textDocument/didClose", {
    textDocument: { uri },
  });
}

/**
 * Get document symbols
 */
export async function getDocumentSymbols(filePath: string): Promise<RustSymbolInfo[]> {
  if (!initialized) return [];

  const uri = `file://${filePath.replace(/\\/g, "/")}`;

  try {
    const result = (await sendRequest("textDocument/documentSymbol", {
      textDocument: { uri },
    })) as LSPDocumentSymbol[];

    if (!result) return [];

    const symbols: RustSymbolInfo[] = [];

    function processSymbol(sym: LSPDocumentSymbol): void {
      const range = sym.range ||
        sym.location?.range || {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        };
      symbols.push({
        name: sym.name,
        kind: getSymbolKindName(sym.kind),
        range,
        ...(sym.detail != null ? { detail: sym.detail } : {}),
      });

      if (sym.children) {
        for (const child of sym.children) {
          processSymbol(child);
        }
      }
    }

    for (const sym of result) {
      processSymbol(sym);
    }

    return symbols;
  } catch (err) {
    log.w("RAINTEGRATION", "symbols_err", { err: String(err) });
    return [];
  }
}

/**
 * Convert LSP symbol kind to string
 */
function getSymbolKindName(kind: number): string {
  const kinds: Record<number, string> = {
    1: "file",
    2: "module",
    3: "namespace",
    4: "package",
    5: "class",
    6: "method",
    7: "property",
    8: "field",
    9: "constructor",
    10: "enum",
    11: "interface",
    12: "function",
    13: "variable",
    14: "constant",
    15: "string",
    16: "number",
    17: "boolean",
    18: "array",
    19: "object",
    20: "key",
    21: "null",
    22: "enummember",
    23: "struct",
    24: "event",
    25: "operator",
    26: "typeparameter",
  };
  return kinds[kind] || "unknown";
}

/**
 * Stop rust-analyzer
 */
export function stopRustAnalyzer(): void {
  if (rustAnalyzerProcess) {
    sendNotification("shutdown", null);
    sendNotification("exit", null);
    rustAnalyzerProcess.kill();
    rustAnalyzerProcess = null;
    initialized = false;
  }
}

/**
 * Enhance parsed entities with rust-analyzer information
 */
export async function enhanceWithRustAnalyzer(
  entities: ParsedEntity[],
  filePath: string,
  content: string,
): Promise<void> {
  if (!initialized) return;

  try {
    // Open document
    openDocument(filePath, content);

    // Get symbols
    const symbols = await getDocumentSymbols(filePath);

    // Create a map of symbols by line
    const symbolsByLine = new Map<number, RustSymbolInfo[]>();
    for (const sym of symbols) {
      if (sym.range) {
        const line = sym.range.start.line + 1; // Convert to 1-indexed
        const existing = symbolsByLine.get(line) || [];
        existing.push(sym);
        symbolsByLine.set(line, existing);
      }
    }

    // Enhance entities with symbol info
    for (const entity of entities) {
      if (!entity.location) continue;

      const startLine = entity.location.start.line;
      const lineSymbols = symbolsByLine.get(startLine);

      if (lineSymbols) {
        for (const sym of lineSymbols) {
          if (sym.name === entity.name && sym.detail) {
            (entity as ParsedEntityWithRAInfo).rustAnalyzerInfo = {
              kind: sym.kind,
              detail: sym.detail,
            };
            break;
          }
        }
      }
    }

    // Close document
    closeDocument(filePath);
  } catch (err) {
    log.w("RAINTEGRATION", "enhance_err", { err: String(err) });
  }
}

/**
 * Get rust-analyzer version
 */
export async function getRustAnalyzerVersion(): Promise<string | null> {
  if (!rustAnalyzerPath) return null;

  return new Promise((resolve) => {
    const proc = spawn(rustAnalyzerPath!, ["--version"], {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    let output = "";

    proc.stdout?.on("data", (data: Buffer) => {
      output += data.toString();
    });

    proc.on("close", () => {
      const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
      resolve(versionMatch?.[1] ?? null);
    });

    proc.on("error", () => {
      resolve(null);
    });
  });
}

/**
 * Find Cargo.toml in parent directories
 */
export function findCargoToml(filePath: string): string | null {
  let dir = dirname(filePath);
  const root = process.platform === "win32" ? dir.split("\\")[0] + "\\" : "/";

  while (dir !== root) {
    const cargoPath = join(dir, "Cargo.toml");
    if (existsSync(cargoPath)) {
      return dir;
    }
    dir = dirname(dir);
  }

  return null;
}

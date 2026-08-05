/**
 * Reaching Definitions Analysis — ported from ultracode.zig/src/analysis/reaching_def.zig
 *
 * Classic data-flow analysis: for each point in the program, determines which
 * variable definitions (assignments/declarations) might reach that point.
 *
 * Algorithm: iterative fixed-point on the CFG
 *   reaching_out[n] = gen[n] ∪ (reaching_in[n] \ kill[n])
 *   reaching_in[n]  = ∪ reaching_out[p] for all predecessors p of n
 *
 * Uses BitSet (Uint32Array) for efficient set operations — same approach as Zig's DynamicBitSet.
 *
 * Used by: condition-analyzer (dead branch detection), taint analysis (variable tracking).
 */

import type { CfgNode, MethodCfg } from "./cfg-builder.js";

// =============================================================================
// Types
// =============================================================================

export type DefKind = "assignment" | "parameter" | "declaration" | "for_binding" | "catch_binding" | "import_binding";

export interface Definition {
  variable: string;
  cfgNodeId: number;
  sourceLine: number;
  kind: DefKind;
}

export interface ReachingDefResult {
  definitions: Definition[];
  /** For each CFG node index: bitset of definition indices reaching IN */
  reachingIn: BitSet[];
  /** For each CFG node index: bitset of definition indices reaching OUT */
  reachingOut: BitSet[];
  /** Map CFG node ID → index in reachingIn/reachingOut arrays */
  nodeIdToIdx: Map<number, number>;
}

// =============================================================================
// BitSet — compact set operations on Uint32Array
// =============================================================================

export class BitSet {
  private data: Uint32Array;
  readonly size: number;

  constructor(size: number) {
    this.size = size;
    this.data = new Uint32Array(Math.ceil(size / 32));
  }

  static empty(size: number): BitSet {
    return new BitSet(size);
  }

  clone(): BitSet {
    const copy = new BitSet(this.size);
    copy.data.set(this.data);
    return copy;
  }

  set(bit: number): void {
    this.data[bit >>> 5]! |= 1 << (bit & 31);
  }

  unset(bit: number): void {
    this.data[bit >>> 5]! &= ~(1 << (bit & 31));
  }

  isSet(bit: number): boolean {
    return (this.data[bit >>> 5]! & (1 << (bit & 31))) !== 0;
  }

  /** this = this ∪ other */
  union(other: BitSet): void {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i]! |= other.data[i]!;
    }
  }

  /** Return new = this \ other (set difference) */
  difference(other: BitSet): BitSet {
    const result = this.clone();
    for (let i = 0; i < result.data.length; i++) {
      result.data[i]! &= ~other.data[i]!;
    }
    return result;
  }

  /** Check equality */
  equals(other: BitSet): boolean {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i]! !== other.data[i]!) return false;
    }
    return true;
  }

  /** Iterate set bits */
  *[Symbol.iterator](): IterableIterator<number> {
    for (let w = 0; w < this.data.length; w++) {
      let word = this.data[w]!;
      while (word !== 0) {
        const bit = 31 - Math.clz32(word & -word); // lowest set bit
        yield w * 32 + bit;
        word &= word - 1; // clear lowest set bit
      }
    }
  }
}

// =============================================================================
// Definition Extraction (from source text)
// =============================================================================

const DECL_PATTERN = /^\s*(?:let|var|const|auto|val|mut)\s+(\w+)/;
const ASSIGN_PATTERN = /^\s*(\w+)\s*(?:[+\-*/%&|^])?=(?!=|>)/;
const FOR_BINDING_PATTERN = /^\s*for\s*\(\s*(?:let|var|const)\s+(\w+)\s+(?:of|in)\b/;
const CATCH_BINDING_PATTERN = /^\s*(?:catch\s*\(\s*(\w+)|except\s+\w+\s+as\s+(\w+))/;
const IMPORT_PATTERN = /^\s*import\s+(?:\{\s*(\w+)|(\w+)\s+from)/;
const PARAM_PATTERN = /\(\s*([\w\s,:=?*&.]+)\)/;

const KEYWORDS = new Set([
  "function",
  "return",
  "if",
  "else",
  "while",
  "for",
  "do",
  "switch",
  "case",
  "break",
  "class",
  "new",
  "this",
  "super",
  "import",
  "export",
  "from",
  "async",
  "await",
  "yield",
  "try",
  "catch",
  "throw",
  "void",
  "typeof",
  "null",
  "undefined",
  "true",
  "false",
  "let",
  "var",
  "const",
]);

function extractDefinitionsFromLines(lines: string[], cfgNodes: CfgNode[]): Definition[] {
  const defs: Definition[] = [];

  for (const node of cfgNodes) {
    if (node.type === "entry" || node.type === "exit") continue;
    const lineIdx = node.sourceStart;
    if (lineIdx >= lines.length) continue;
    const line = lines[lineIdx]!;

    // Declaration: let/var/const/auto/val x
    const declMatch = DECL_PATTERN.exec(line);
    if (declMatch?.[1]) {
      defs.push({ variable: declMatch[1], cfgNodeId: node.id, sourceLine: lineIdx, kind: "declaration" });
      continue;
    }

    // For binding: for (let x of ...)
    const forMatch = FOR_BINDING_PATTERN.exec(line);
    if (forMatch?.[1]) {
      defs.push({ variable: forMatch[1], cfgNodeId: node.id, sourceLine: lineIdx, kind: "for_binding" });
      continue;
    }

    // Catch binding: catch(e) / except ... as e
    const catchMatch = CATCH_BINDING_PATTERN.exec(line);
    const catchVar = catchMatch?.[1] || catchMatch?.[2];
    if (catchVar) {
      defs.push({ variable: catchVar, cfgNodeId: node.id, sourceLine: lineIdx, kind: "catch_binding" });
      continue;
    }

    // Import binding: import { x } / import x from
    const importMatch = IMPORT_PATTERN.exec(line);
    const importVar = importMatch?.[1] || importMatch?.[2];
    if (importVar && !KEYWORDS.has(importVar)) {
      defs.push({ variable: importVar, cfgNodeId: node.id, sourceLine: lineIdx, kind: "import_binding" });
      continue;
    }

    // Assignment: x = expr (not ==, !=)
    const assignMatch = ASSIGN_PATTERN.exec(line);
    if (assignMatch?.[1] && !KEYWORDS.has(assignMatch[1])) {
      defs.push({ variable: assignMatch[1], cfgNodeId: node.id, sourceLine: lineIdx, kind: "assignment" });
    }
  }

  return defs;
}

/** Extract parameter definitions from the first line (function signature) */
function extractParameterDefs(firstLine: string, entryNodeId: number): Definition[] {
  const defs: Definition[] = [];
  const paramMatch = PARAM_PATTERN.exec(firstLine);
  if (!paramMatch?.[1]) return defs;

  const paramList = paramMatch[1];
  for (const param of paramList.split(",")) {
    let p = param.trim();
    // Remove type annotation: x: Type
    const colonIdx = p.indexOf(":");
    if (colonIdx > 0) p = p.slice(0, colonIdx).trim();
    // Remove default value: x = val
    const eqIdx = p.indexOf("=");
    if (eqIdx > 0) p = p.slice(0, eqIdx).trim();
    // Remove leading *, &, ...
    p = p.replace(/^[*&.]+/, "");
    // Remove type prefix (e.g., "String name" → "name")
    const spaceIdx = p.lastIndexOf(" ");
    if (spaceIdx > 0) p = p.slice(spaceIdx + 1).trim();

    const varMatch = /^(\w+)$/.exec(p);
    if (varMatch?.[1] && !KEYWORDS.has(varMatch[1])) {
      defs.push({ variable: varMatch[1], cfgNodeId: entryNodeId, sourceLine: 0, kind: "parameter" });
    }
  }

  return defs;
}

// =============================================================================
// Solver
// =============================================================================

const MAX_ITERATIONS = 20;

/**
 * Solve reaching definitions on a MethodCfg.
 *
 * @param cfg - Control flow graph from buildCfgFromSource()
 * @param sourceLines - Source code lines (same as passed to buildCfgFromSource)
 * @returns ReachingDefResult with definitions and per-node bitsets
 */
export function solveReachingDefinitions(cfg: MethodCfg, sourceLines: string[]): ReachingDefResult {
  const nodeCount = cfg.nodes.length;

  // Build node ID → index mapping
  const nodeIdToIdx = new Map<number, number>();
  for (let i = 0; i < nodeCount; i++) {
    nodeIdToIdx.set(cfg.nodes[i]!.id, i);
  }

  // Step 1: Collect all definitions
  const paramDefs = sourceLines.length > 0 ? extractParameterDefs(sourceLines[0]!, cfg.entryId) : [];
  const stmtDefs = extractDefinitionsFromLines(sourceLines, cfg.nodes);
  const definitions = [...paramDefs, ...stmtDefs];
  const defCount = definitions.length;

  if (defCount === 0) {
    return {
      definitions,
      reachingIn: cfg.nodes.map(() => BitSet.empty(0)),
      reachingOut: cfg.nodes.map(() => BitSet.empty(0)),
      nodeIdToIdx,
    };
  }

  // Step 2: Compute GEN and KILL sets
  const genSets: BitSet[] = [];
  const killSets: BitSet[] = [];
  for (let i = 0; i < nodeCount; i++) {
    genSets.push(BitSet.empty(defCount));
    killSets.push(BitSet.empty(defCount));
  }

  for (let di = 0; di < defCount; di++) {
    const def = definitions[di]!;
    const nodeIdx = nodeIdToIdx.get(def.cfgNodeId);
    if (nodeIdx === undefined) continue;

    genSets[nodeIdx]!.set(di);

    // KILL: all other definitions of the same variable
    for (let oi = 0; oi < defCount; oi++) {
      if (oi !== di && definitions[oi]!.variable === def.variable) {
        killSets[nodeIdx]!.set(oi);
      }
    }
  }

  // Step 3: Build predecessor map
  // Array.from keeps PACKED elements; new Array(n) would stay HOLEY forever
  const predecessors: number[][] = Array.from({ length: nodeCount }, () => []);
  for (const edge of cfg.edges) {
    const fromIdx = nodeIdToIdx.get(edge.from);
    const toIdx = nodeIdToIdx.get(edge.to);
    if (fromIdx !== undefined && toIdx !== undefined) {
      predecessors[toIdx]!.push(fromIdx);
    }
  }

  // Step 4: Iterative fixed-point
  const reachingIn: BitSet[] = [];
  const reachingOut: BitSet[] = [];
  for (let i = 0; i < nodeCount; i++) {
    reachingIn.push(BitSet.empty(defCount));
    reachingOut.push(BitSet.empty(defCount));
  }

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let changed = false;

    for (let n = 0; n < nodeCount; n++) {
      // IN[n] = ∪ OUT[p] for all predecessors p
      const newIn = BitSet.empty(defCount);
      for (const predIdx of predecessors[n]!) {
        newIn.union(reachingOut[predIdx]!);
      }

      // OUT[n] = GEN[n] ∪ (IN[n] \ KILL[n])
      const inMinusKill = newIn.difference(killSets[n]!);
      const newOut = genSets[n]!.clone();
      newOut.union(inMinusKill);

      if (!reachingOut[n]!.equals(newOut)) {
        changed = true;
        reachingOut[n] = newOut;
      }
      reachingIn[n] = newIn;
    }

    if (!changed) break;
  }

  return { definitions, reachingIn, reachingOut, nodeIdToIdx };
}

// =============================================================================
// Query Helpers
// =============================================================================

/**
 * Check if a specific definition reaches a CFG node.
 */
export function defReachesNode(result: ReachingDefResult, defIdx: number, nodeId: number): boolean {
  const idx = result.nodeIdToIdx.get(nodeId);
  if (idx === undefined) return false;
  return result.reachingIn[idx]!.isSet(defIdx);
}

/**
 * Get all definitions of a variable that reach a CFG node.
 */
export function defsReachingNode(result: ReachingDefResult, nodeId: number, variable: string): Definition[] {
  const idx = result.nodeIdToIdx.get(nodeId);
  if (idx === undefined) return [];

  const inSet = result.reachingIn[idx]!;
  const matches: Definition[] = [];
  for (const bit of inSet) {
    if (result.definitions[bit]!.variable === variable) {
      matches.push(result.definitions[bit]!);
    }
  }
  return matches;
}

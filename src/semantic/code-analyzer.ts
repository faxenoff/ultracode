import { log } from "../logging/index.js";
import type {
  CloneGroup,
  CrossLangResult,
  RefactoringSuggestion,
  SemanticAnalysis,
  SimilarCode,
} from "../types/semantic.js";
import type { EmbeddingGenerator } from "./embedding-generator.js";
import type { SemanticCache } from "./semantic-cache.js";
import type { VectorStore } from "./vector-store.js";

const CLONE_THRESHOLDS = { type1: 0.95, type2: 0.85, type3: 0.75, type4: 0.65 } as const;

const COMPLEXITY_WEIGHTS: Record<keyof Omit<CodeMetrics, "complexity">, number> = {
  lines: 0.1,
  branches: 0.3,
  loops: 0.2,
  functions: 0.2,
  classes: 0.2,
};

interface CodeMetrics {
  lines: number;
  branches: number;
  loops: number;
  functions: number;
  classes: number;
  complexity: number;
}

interface CodePattern {
  pattern: string;
  type: "antipattern" | "smell" | "improvement";
  description: string;
  suggestion: string;
}

const BUILTIN_PATTERNS: readonly CodePattern[] = [
  {
    pattern: "nested_loops",
    type: "smell",
    description: "Deeply nested loops detected",
    suggestion: "Consider extracting inner loops into separate functions",
  },
  {
    pattern: "long_function",
    type: "smell",
    description: "Function exceeds recommended length",
    suggestion: "Break down into smaller, focused functions",
  },
  {
    pattern: "duplicate_logic",
    type: "antipattern",
    description: "Similar logic appears multiple times",
    suggestion: "Extract common logic into a reusable function",
  },
  {
    pattern: "complex_condition",
    type: "smell",
    description: "Complex conditional expression",
    suggestion: "Extract condition into a well-named variable or function",
  },
];

function cnt(src: string, re: RegExp): number {
  return (src.match(re) ?? []).length;
}

function extractCodeMetrics(code: string): CodeMetrics {
  const lines = code.split("\n").length;
  const branches = cnt(code, /if\s*\(|else\s*{|switch\s*\(|case\s+/g);
  const loops = cnt(code, /for\s*\(|while\s*\(|do\s*{/g);
  const functions = cnt(code, /function\s+\w+|=>\s*{|async\s+function/g);
  const classes = cnt(code, /class\s+\w+/g);
  const raw: Omit<CodeMetrics, "complexity"> = { lines, branches, loops, functions, classes };
  let complexity = 0;
  for (const k of Object.keys(COMPLEXITY_WEIGHTS) as (keyof typeof COMPLEXITY_WEIGHTS)[])
    complexity += raw[k] * COMPLEXITY_WEIGHTS[k];
  return { lines, branches, loops, functions, classes, complexity };
}

function determineSemanticType(code: string): SemanticAnalysis["semanticType"] {
  const lc = code.toLowerCase();
  const rules: [boolean, SemanticAnalysis["semanticType"]][] = [
    [lc.includes("test") || lc.includes("spec"), "test"],
    [lc.includes("class"), "class"],
    [lc.includes("function") || lc.includes("=>"), "function"],
    [lc.includes("export") || lc.includes("module"), "module"],
  ];
  return rules.find(([ok]) => ok)?.[1] ?? "utility";
}

function extractEntities(code: string): string[] {
  const pairs: [RegExp, RegExp][] = [
    [/function\s+(\w+)/g, /^function\s+/],
    [/class\s+(\w+)/g, /^class\s+/],
    [/(?:const|let|var)\s+(\w+)/g, /^(?:const|let|var)\s+/],
  ];
  const all = pairs.flatMap(([g, s]) => (code.match(g) ?? []).map((m) => m.replace(s, "")));
  return [...new Set(all)];
}

function metaStr(meta: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!meta) return "";
  for (const k of keys) {
    const v = meta[k];
    if (typeof v === "string") return v;
  }
  return "";
}

function toSimilarCode(
  id: string,
  meta: Record<string, unknown> | undefined,
  content: string,
  similarity: number,
  type: SimilarCode["type"],
): SimilarCode {
  return {
    id,
    path: metaStr(meta, "path", "filePath"),
    content,
    similarity,
    type,
    startLine: meta?.["startLine"] as number | undefined,
    endLine: meta?.["endLine"] as number | undefined,
    name: meta?.["name"] as string | undefined,
  };
}

export class CodeAnalyzer {
  private readonly vectorStore: VectorStore;
  private readonly embeddingGen: EmbeddingGenerator;
  private readonly cache: SemanticCache;
  private readonly patterns: readonly CodePattern[];

  constructor(vectorStore: VectorStore, embeddingGen: EmbeddingGenerator, cache: SemanticCache) {
    this.vectorStore = vectorStore;
    this.embeddingGen = embeddingGen;
    this.cache = cache;
    this.patterns = BUILTIN_PATTERNS;
  }

  async analyzeCodeSemantics(code: string): Promise<SemanticAnalysis> {
    const cacheKey = `analysis:${code.slice(0, 100)}`;
    const hit = this.cache.get<SemanticAnalysis>(cacheKey);
    if (hit) return hit;

    const metrics = extractCodeMetrics(code);
    const entities = extractEntities(code);
    const semanticType = determineSemanticType(code);
    const concepts = this.extractConcepts(code);
    const mainEntity = entities[0] ?? "code";

    const analysis: SemanticAnalysis = {
      entities,
      concepts,
      complexity: metrics.complexity,
      semanticType,
      summary: `${semanticType} containing ${entities.length} entities (${metrics.lines} lines). Main entity: ${mainEntity}`,
    };
    this.cache.set(cacheKey, analysis, 3_600_000);
    return analysis;
  }

  async findSimilarCode(code: string, threshold = 0.5): Promise<SimilarCode[]> {
    const emb = await this.embeddingGen.generateCodeEmbedding(code);
    const hits = await this.vectorStore.search(emb, 20);
    return hits
      .filter((r) => r.similarity >= threshold)
      .map((r) => toSimilarCode(r.id, r.metadata, r.content, r.similarity, this.simType(r.similarity)));
  }

  async detectClones(minSimilarity = 0.65): Promise<CloneGroup[]> {
    const total = await this.vectorStore.count();
    if (total === 0) return [];

    const cap = Math.min(100, total);
    log.d("ANALYZER", "Analyzing code fragments for clones", { maxSamples: cap, minSimilarity });

    type CachedEntity = {
      content: string;
      metadata?: Record<string, unknown> | undefined;
      vector?: Float32Array | undefined;
    };
    const ecache = new Map<string, CachedEntity>();
    const uf = mkUnionFind();
    const seen = new Set<string>();

    await Promise.all(
      Array.from({ length: Math.min(5, Math.ceil(cap / 20)) }, () =>
        this.vectorStore.search(randVec(384), 20).then((hits) => {
          for (const h of hits) {
            if (seen.size >= cap) break;
            if (!seen.has(h.id)) {
              seen.add(h.id);
              ecache.set(h.id, { content: h.content, metadata: h.metadata });
            }
          }
        }),
      ),
    );

    const pairs = new Set<string>();
    const simMap = new Map<string, number>();
    const nCluster = Math.min(10, Math.ceil(cap / 10));

    for (let i = 0; i < nCluster; i++) {
      const results = await this.vectorStore.search(randVec(384), 30);
      const strong = results.filter((r) => r.similarity >= minSimilarity);

      for (let a = 0; a < strong.length; a++) {
        const r1 = strong[a]!;
        if (!ecache.has(r1.id)) ecache.set(r1.id, { content: r1.content, metadata: r1.metadata });

        for (let b = a + 1; b < strong.length; b++) {
          const r2 = strong[b]!;
          const est = Math.sqrt(r1.similarity * r2.similarity);
          if (est < minSimilarity) continue;
          const pk = r1.id < r2.id ? `${r1.id}|${r2.id}` : `${r2.id}|${r1.id}`;
          if (pairs.has(pk)) continue;
          pairs.add(pk);
          simMap.set(pk, est);
          uf.union(r1.id, r2.id);
          if (!ecache.has(r2.id)) ecache.set(r2.id, { content: r2.content, metadata: r2.metadata });
        }
      }
    }

    let gi = 0;
    const cloneGroups: CloneGroup[] = [];
    for (const mids of uf.groups()) {
      if (mids.length < 2) continue;
      let tSim = 0,
        pc = 0;
      for (let i = 0; i < mids.length; i++)
        for (let j = i + 1; j < mids.length; j++) {
          const a = mids[i]!,
            b = mids[j]!;
          const s = simMap.get(a < b ? `${a}|${b}` : `${b}|${a}`);
          if (s !== undefined) {
            tSim += s;
            pc++;
          }
        }
      const avg = pc > 0 ? tSim / pc : minSimilarity;
      const members = mids.map((id) => {
        const c = ecache.get(id);
        return toSimilarCode(id, c?.metadata, c?.content ?? "", avg, this.simType(avg));
      });
      cloneGroups.push({ id: `clone-${++gi}`, cloneType: this.cloneType(avg), members, avgSimilarity: avg });
    }

    log.d("ANALYZER", "Clone detection complete", {
      cloneGroups: cloneGroups.length,
      entitiesCached: ecache.size,
      pairsProcessed: pairs.size,
    });
    return cloneGroups;
  }

  async crossLanguageSearch(query: string, languages: string[]): Promise<CrossLangResult[]> {
    const emb = await this.embeddingGen.generateEmbedding(query);
    const results = await this.vectorStore.search(emb, 50);
    const langs = new Set(languages);
    return results
      .filter((r) => langs.has(r.metadata?.["language"] as string))
      .map((r) => ({
        id: r.id,
        language: (r.metadata?.["language"] as string) ?? "unknown",
        path: metaStr(r.metadata, "path", "filePath"),
        content: r.content,
        similarity: r.similarity,
        startLine: r.metadata?.["startLine"] as number | undefined,
        endLine: r.metadata?.["endLine"] as number | undefined,
        name: r.metadata?.["name"] as string | undefined,
      }));
  }

  async suggestRefactoring(code: string): Promise<RefactoringSuggestion[]> {
    const out: RefactoringSuggestion[] = [];
    const m = extractCodeMetrics(code);

    if (m.lines > 50)
      out.push({
        type: "extract",
        description: "Function is too long",
        impact: "medium",
        confidence: 0.8,
        code: "// Consider breaking this function into smaller pieces",
      });

    if (m.branches > 10)
      out.push({
        type: "simplify",
        description: "High cyclomatic complexity detected",
        impact: "high",
        confidence: 0.9,
        code: "// Consider using early returns or extracting complex conditions",
      });

    const dupes = await this.findSimilarCode(code, 0.85);
    if (dupes.length > 1)
      out.push({
        type: "combine",
        description: `Found ${dupes.length} similar code fragments`,
        impact: "high",
        confidence: 0.85,
        code: "// Consider extracting common functionality into a shared function",
      });

    for (const e of extractEntities(code).filter((n) => n.length < 3 || n === "tmp" || n === "temp"))
      out.push({ type: "rename", description: `Poor variable name: '${e}'`, impact: "low", confidence: 0.7 });

    for (const p of this.patterns)
      if (this.matchPat(code, p))
        out.push({
          type: p.type === "antipattern" ? "extract" : "simplify",
          description: p.description,
          impact: p.type === "antipattern" ? "high" : "medium",
          confidence: 0.75,
          code: `// ${p.suggestion}`,
        });

    return out;
  }

  async generateCodeEmbedding(code: string): Promise<Float32Array> {
    return this.embeddingGen.generateCodeEmbedding(code);
  }

  getStats(): { patternsLoaded: number; cacheStats: ReturnType<SemanticCache["getStats"]> } {
    return { patternsLoaded: this.patterns.length, cacheStats: this.cache.getStats() };
  }

  private extractConcepts(code: string): string[] {
    const markers: [string | [string, string], string][] = [
      [["async", "await"], "asynchronous"],
      ["Promise", "promises"],
      ["class", "object-oriented"],
      ["=>", "functional"],
      [["test", "expect"], "testing"],
      [["try", "catch"], "error-handling"],
    ];
    return markers
      .filter(([t]) => (Array.isArray(t) ? t.some((s) => code.includes(s)) : code.includes(t)))
      .map(([, l]) => l);
  }

  private simType(s: number): SimilarCode["type"] {
    if (s >= CLONE_THRESHOLDS.type1) return "exact";
    return s >= CLONE_THRESHOLDS.type2 ? "near" : "semantic";
  }

  private cloneType(s: number): CloneGroup["cloneType"] {
    if (s >= CLONE_THRESHOLDS.type1) return "type1";
    if (s >= CLONE_THRESHOLDS.type2) return "type2";
    return s >= CLONE_THRESHOLDS.type3 ? "type3" : "type4";
  }

  private matchPat(code: string, p: CodePattern): boolean {
    const table: Record<string, () => boolean> = {
      nested_loops: () => cnt(code, /for\s*\([^)]*\)\s*{[^}]*for\s*\(/g) > 0,
      long_function: () => code.split("\n").length > 50,
      complex_condition: () => cnt(code, /if\s*\([^)]{50,}\)/g) > 0,
    };
    return table[p.pattern]?.() ?? false;
  }
}

function randVec(dim: number): Float32Array {
  const v = new Float32Array(dim);
  for (let i = 0; i < dim; i++) v[i] = Math.random() - 0.5;
  return v;
}

function mkUnionFind() {
  const par = new Map<string, string>();
  const rnk = new Map<string, number>();

  const find = (x: string): string => {
    if (!par.has(x)) {
      par.set(x, x);
      rnk.set(x, 0);
    }
    let r = x;
    while (par.get(r) !== r) r = par.get(r)!;
    for (let c = x; c !== r; ) {
      const n = par.get(c)!;
      par.set(c, r);
      c = n;
    }
    return r;
  };

  const union = (a: string, b: string): void => {
    const ra = find(a),
      rb = find(b);
    if (ra === rb) return;
    const ka = rnk.get(ra) ?? 0,
      kb = rnk.get(rb) ?? 0;
    if (ka < kb) par.set(ra, rb);
    else if (ka > kb) par.set(rb, ra);
    else {
      par.set(rb, ra);
      rnk.set(ra, ka + 1);
    }
  };

  const groups = (): string[][] => {
    const m = new Map<string, string[]>();
    for (const id of par.keys()) {
      const root = find(id);
      let a = m.get(root);
      if (!a) {
        a = [];
        m.set(root, a);
      }
      a.push(id);
    }
    return [...m.values()];
  };

  return { find, union, groups };
}

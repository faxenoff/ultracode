/**
 * Co-occurrence Operations for LibSQL Graph Adapter
 *
 * Handles all co-occurrence table operations:
 * - Batch update of term pairs from indexed content
 * - Retrieval of related terms for query expansion
 * - PMI (Pointwise Mutual Information) calculation
 * - Term frequency management
 */

import { log } from "../../logging/index.js";
import type { ClientGetter, ContextGetter } from "./types.js";

// =============================================================================
// TYPES
// =============================================================================

export interface RelatedTerm {
  term: string;
  score: number;
  count: number;
}

export interface CooccurrenceStats {
  totalPairs: number;
  totalTerms: number;
  avgPairCount: number;
}

// =============================================================================
// COOCCURRENCE OPERATIONS CLASS
// =============================================================================

export class CooccurrenceOperations {
  constructor(
    private getClient: ClientGetter,
    private getContext: ContextGetter,
  ) {}

  // ===========================================================================
  // BATCH UPDATE
  // ===========================================================================

  /**
   * Batch update co-occurrence counts from extracted term pairs.
   * Uses UPSERT (INSERT OR REPLACE) for atomic updates.
   *
   * @param pairs - Map of "term1|term2" → count (terms must be sorted alphabetically)
   */
  async batchUpdateCooccurrence(pairs: Map<string, number>): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    if (pairs.size === 0) return;

    const { projectHash, branchName } = this.getContext();
    const now = Date.now();

    // Batch size for INSERT statements (avoid too large queries)
    const BATCH_SIZE = 100;
    const entries = Array.from(pairs.entries());

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);

      // Build VALUES clause
      const values: string[] = [];
      const args: (string | number)[] = [];

      for (const [key, count] of batch) {
        const [term1, term2] = key.split("|");
        if (!term1 || !term2) continue;

        values.push("(?, ?, ?, ?, ?, ?)");
        args.push(term1, term2, count, projectHash, branchName, now);
      }

      if (values.length === 0) continue;

      // UPSERT: increment count on conflict
      await client.execute({
        sql: `
          INSERT INTO cooccurrence (term1, term2, count, project_hash, branch_name, updated_at)
          VALUES ${values.join(", ")}
          ON CONFLICT(term1, term2, project_hash, branch_name)
          DO UPDATE SET
            count = cooccurrence.count + excluded.count,
            updated_at = excluded.updated_at
        `,
        args,
      });
    }
  }

  /**
   * Update term frequencies for PMI calculation.
   * Called during indexing alongside co-occurrence updates.
   *
   * @param termCounts - Map of term → count in the document
   * @param isNewDocument - Whether this is a new document (for doc_count increment)
   */
  async updateTermFrequencies(termCounts: Map<string, number>, isNewDocument = true): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    if (termCounts.size === 0) return;

    const { projectHash, branchName } = this.getContext();
    const BATCH_SIZE = 100;
    const entries = Array.from(termCounts.entries());

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);

      const values: string[] = [];
      const args: (string | number)[] = [];

      for (const [term, count] of batch) {
        values.push("(?, ?, ?, ?, ?)");
        args.push(term, isNewDocument ? 1 : 0, count, projectHash, branchName);
      }

      if (values.length === 0) continue;

      await client.execute({
        sql: `
          INSERT INTO term_frequency (term, doc_count, total_count, project_hash, branch_name)
          VALUES ${values.join(", ")}
          ON CONFLICT(term, project_hash, branch_name)
          DO UPDATE SET
            doc_count = term_frequency.doc_count + excluded.doc_count,
            total_count = term_frequency.total_count + excluded.total_count
        `,
        args,
      });
    }
  }

  // ===========================================================================
  // QUERY OPERATIONS
  // ===========================================================================

  /**
   * Get related terms for query expansion.
   * Returns terms that frequently co-occur with the input term,
   * sorted by PMI score (if available) or raw count.
   *
   * @param term - The term to find related terms for
   * @param limit - Maximum number of related terms to return
   */
  async getRelatedTerms(term: string, limit = 5): Promise<RelatedTerm[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const normalizedTerm = term.toLowerCase();

    // Query co-occurrences where term appears as either term1 or term2
    // Prioritize by PMI if available, otherwise by count
    const result = await client.execute({
      sql: `
        SELECT
          CASE WHEN term1 = ? THEN term2 ELSE term1 END as related_term,
          count,
          COALESCE(pmi, 0) as pmi_score
        FROM cooccurrence
        WHERE project_hash = ? AND branch_name = ?
          AND (term1 = ? OR term2 = ?)
        ORDER BY
          CASE WHEN pmi IS NOT NULL THEN pmi ELSE count * 0.01 END DESC
        LIMIT ?
      `,
      args: [normalizedTerm, projectHash, branchName, normalizedTerm, normalizedTerm, limit],
    });

    return result.rows.map((row) => ({
      term: row["related_term"] as string,
      score: (row["pmi_score"] as number) || (row["count"] as number) * 0.01,
      count: row["count"] as number,
    }));
  }

  /**
   * Get multiple related terms for a set of input terms.
   * More efficient than calling getRelatedTerms multiple times.
   *
   * @param terms - Array of terms to find related terms for
   * @param limitPerTerm - Maximum related terms per input term
   */
  async getRelatedTermsBatch(terms: string[], limitPerTerm = 3): Promise<Map<string, RelatedTerm[]>> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    if (terms.length === 0) return new Map();

    const { projectHash, branchName } = this.getContext();
    const normalizedTerms = terms.map((t) => t.toLowerCase());

    // Single query for all terms
    const placeholders = normalizedTerms.map(() => "?").join(", ");
    const result = await client.execute({
      sql: `
        SELECT
          CASE WHEN term1 IN (${placeholders}) THEN term1 ELSE term2 END as source_term,
          CASE WHEN term1 IN (${placeholders}) THEN term2 ELSE term1 END as related_term,
          count,
          COALESCE(pmi, 0) as pmi_score
        FROM cooccurrence
        WHERE project_hash = ? AND branch_name = ?
          AND (term1 IN (${placeholders}) OR term2 IN (${placeholders}))
        ORDER BY
          CASE WHEN pmi IS NOT NULL THEN pmi ELSE count * 0.01 END DESC
      `,
      args: [...normalizedTerms, ...normalizedTerms, projectHash, branchName, ...normalizedTerms, ...normalizedTerms],
    });

    // Group by source term and limit
    const grouped = new Map<string, RelatedTerm[]>();
    for (const term of normalizedTerms) {
      grouped.set(term, []);
    }

    for (const row of result.rows) {
      const sourceTerm = row["source_term"] as string;
      const relatedTerm = row["related_term"] as string;
      const arr = grouped.get(sourceTerm);

      if (arr && arr.length < limitPerTerm) {
        arr.push({
          term: relatedTerm,
          score: (row["pmi_score"] as number) || (row["count"] as number) * 0.01,
          count: row["count"] as number,
        });
      }
    }

    return grouped;
  }

  // ===========================================================================
  // PMI CALCULATION
  // ===========================================================================

  /**
   * Recalculate PMI (Pointwise Mutual Information) for all co-occurrence pairs.
   * PMI = log2(P(x,y) / (P(x) * P(y)))
   *
   * Uses batched approach: preloads term frequencies, calculates PMI in JS,
   * then updates in batches with event loop yields to prevent CPU blocking.
   */
  async recalculatePMI(): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const startTime = Date.now();

    // Step 1: Preload all term frequencies into a Map for O(1) lookups
    const tfResult = await client.execute({
      sql: `SELECT term, total_count, doc_count FROM term_frequency WHERE project_hash = ? AND branch_name = ?`,
      args: [projectHash, branchName],
    });

    const termFreqs = new Map<string, number>();
    let maxDocCount = 1;
    for (const row of tfResult.rows) {
      const term = row["term"] as string;
      const totalCount = row["total_count"] as number;
      const docCount = row["doc_count"] as number;
      termFreqs.set(term, totalCount);
      if (docCount > maxDocCount) maxDocCount = docCount;
    }
    const totalDocs = maxDocCount;

    // Step 2: Read all co-occurrence pairs
    const coocResult = await client.execute({
      sql: `SELECT term1, term2, count FROM cooccurrence WHERE project_hash = ? AND branch_name = ?`,
      args: [projectHash, branchName],
    });

    const totalPairsResult = await client.execute({
      sql: `SELECT SUM(count) as total FROM cooccurrence WHERE project_hash = ? AND branch_name = ?`,
      args: [projectHash, branchName],
    });
    const totalPairs = (totalPairsResult.rows[0]?.["total"] as number) || 1;

    if (coocResult.rows.length === 0) {
      log.i("COOCOPS", "pmi_skip", { reason: "no_pairs" });
      return;
    }

    log.i("COOCOPS", "pmi_start", { pairs: coocResult.rows.length, terms: termFreqs.size, totalDocs, totalPairs });

    // Step 3: Calculate PMI in JS and batch update
    const BATCH_SIZE = 500;
    let updated = 0;

    for (let i = 0; i < coocResult.rows.length; i += BATCH_SIZE) {
      const batch = coocResult.rows.slice(i, i + BATCH_SIZE);
      const statements = [];

      for (const row of batch) {
        const term1 = row["term1"] as string;
        const term2 = row["term2"] as string;
        const count = row["count"] as number;

        const tf1 = termFreqs.get(term1) || 0;
        const tf2 = termFreqs.get(term2) || 0;

        let pmi = 0;
        if (tf1 > 0 && tf2 > 0) {
          const pXY = count / totalPairs;
          const pX = tf1 / totalDocs;
          const pY = tf2 / totalDocs;
          pmi = Math.log2(pXY / (pX * pY));
        }

        statements.push({
          sql: `UPDATE cooccurrence SET pmi = ? WHERE term1 = ? AND term2 = ? AND project_hash = ? AND branch_name = ?`,
          args: [pmi, term1, term2, projectHash, branchName] as (string | number)[],
        });
      }

      await client.batch(statements, "write");
      updated += batch.length;

      // Yield to event loop every batch to prevent CPU blocking
      if (i + BATCH_SIZE < coocResult.rows.length) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }

    const elapsed = Date.now() - startTime;
    log.i("COOCOPS", "pmi_recalculated", { ms: elapsed, pairs: updated, terms: termFreqs.size, totalDocs });
  }

  // ===========================================================================
  // MAINTENANCE
  // ===========================================================================

  /**
   * Get statistics about the co-occurrence index.
   */
  async getStats(): Promise<CooccurrenceStats> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();

    const [pairsResult, termsResult, avgResult] = await Promise.all([
      client.execute({
        sql: `SELECT COUNT(*) as cnt FROM cooccurrence WHERE project_hash = ? AND branch_name = ?`,
        args: [projectHash, branchName],
      }),
      client.execute({
        sql: `SELECT COUNT(*) as cnt FROM term_frequency WHERE project_hash = ? AND branch_name = ?`,
        args: [projectHash, branchName],
      }),
      client.execute({
        sql: `SELECT AVG(count) as avg FROM cooccurrence WHERE project_hash = ? AND branch_name = ?`,
        args: [projectHash, branchName],
      }),
    ]);

    return {
      totalPairs: (pairsResult.rows[0]?.["cnt"] as number) || 0,
      totalTerms: (termsResult.rows[0]?.["cnt"] as number) || 0,
      avgPairCount: (avgResult.rows[0]?.["avg"] as number) || 0,
    };
  }

  /**
   * Clear all co-occurrence data for current project/branch.
   */
  async clear(): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();

    await client.batch(
      [
        {
          sql: "DELETE FROM cooccurrence WHERE project_hash = ? AND branch_name = ?",
          args: [projectHash, branchName],
        },
        {
          sql: "DELETE FROM term_frequency WHERE project_hash = ? AND branch_name = ?",
          args: [projectHash, branchName],
        },
      ],
      "write",
    );

    log.i("COOCOPS", "cleared", { projectHash, branchName });
  }

  /**
   * Prune low-frequency pairs to reduce index size.
   * Removes pairs with count below threshold.
   *
   * @param minCount - Minimum count to keep (default: 2)
   */
  async pruneRarePairs(minCount = 2): Promise<number> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();

    const result = await client.execute({
      sql: `
        DELETE FROM cooccurrence
        WHERE project_hash = ? AND branch_name = ? AND count < ?
      `,
      args: [projectHash, branchName, minCount],
    });

    const deleted = result.rowsAffected || 0;
    if (deleted > 0) {
      log.i("COOCOPS", "pruned", { deleted, minCount });
    }

    return deleted;
  }
}

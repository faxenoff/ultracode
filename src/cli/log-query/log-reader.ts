/**
 * Log file reader and processor for ulog CLI
 * Reads log files line by line and applies filters
 */

import { createReadStream, existsSync, readdirSync, statSync, watch } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { extractFields, formatLogLineColored, parseLogLine } from "../../logging/log-formatter.js";
import type { LogLevelChar, ParsedLogLine } from "../../logging/log-types.js";
import { LOG_LEVEL_NAMES } from "../../logging/log-types.js";
import { type LogQueryFilter, matchesFilter, type OutputOptions } from "./query-parser.js";

/**
 * Stats accumulator
 */
export interface LogStats {
  total: number;
  matched: number;
  byLevel: Record<LogLevelChar, number>;
  byModule: Record<string, number>;
  byEvent: Record<string, number>;
  firstTimestamp: Date | null;
  lastTimestamp: Date | null;
  avgDuration: number | null;
  totalDuration: number;
  durationCount: number;
}

/**
 * Create empty stats object
 */
export function createStats(): LogStats {
  return {
    total: 0,
    matched: 0,
    byLevel: { E: 0, W: 0, I: 0, D: 0, T: 0 },
    byModule: {},
    byEvent: {},
    firstTimestamp: null,
    lastTimestamp: null,
    avgDuration: null,
    totalDuration: 0,
    durationCount: 0,
  };
}

/**
 * Update stats with entry
 */
export function updateStats(stats: LogStats, entry: ParsedLogLine): void {
  stats.matched++;
  stats.byLevel[entry.level]++;
  stats.byModule[entry.module] = (stats.byModule[entry.module] || 0) + 1;
  stats.byEvent[entry.event] = (stats.byEvent[entry.event] || 0) + 1;

  if (!stats.firstTimestamp || entry.timestamp < stats.firstTimestamp) {
    stats.firstTimestamp = entry.timestamp;
  }
  if (!stats.lastTimestamp || entry.timestamp > stats.lastTimestamp) {
    stats.lastTimestamp = entry.timestamp;
  }

  // Track durations
  const dur = entry.kv["dur"];
  if (typeof dur === "number") {
    stats.totalDuration += dur;
    stats.durationCount++;
    stats.avgDuration = stats.totalDuration / stats.durationCount;
  }
}

/**
 * Format entry for output
 */
export function formatEntry(entry: ParsedLogLine, options: OutputOptions): string {
  if (options.format === "json") {
    return JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      pid: entry.pid,
      hash: entry.buildHash,
      module: entry.module,
      event: entry.event,
      ...entry.kv,
    });
  }

  if (options.format === "csv") {
    const values = [
      entry.timestamp.toISOString(),
      entry.level,
      entry.pid,
      entry.buildHash,
      entry.module,
      entry.event,
      JSON.stringify(entry.kv),
    ];
    return values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  }

  if (options.format === "table") {
    const ts = entry.timestamp.toISOString().slice(11, 23);
    return `${ts} ${entry.level} ${entry.module.padEnd(20)} ${entry.event.padEnd(20)}`;
  }

  // Raw format (with colors unless disabled)
  if (options.noColor) {
    return entry.raw;
  }

  return formatLogLineColored(entry);
}

/**
 * Format fields output
 */
export function formatFields(entry: ParsedLogLine, fields: string[]): string {
  const extracted = extractFields(entry, fields);
  return Object.entries(extracted)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
}

/**
 * Get default log directory
 */
export function getDefaultLogDir(): string {
  // Use LOCALAPPDATA on Windows (not APPDATA/Roaming), XDG_DATA_HOME or HOME/.local/share on Linux
  if (process.platform === "win32") {
    const localAppData = process.env["LOCALAPPDATA"];
    if (localAppData) {
      return join(localAppData, "UltraCode", "logs");
    }
  }
  const xdgData = process.env["XDG_DATA_HOME"];
  if (xdgData) {
    return join(xdgData, "UltraCode", "logs");
  }
  const home = process.env["HOME"];
  if (home) {
    return join(home, ".local", "share", "UltraCode", "logs");
  }
  return join(process.cwd(), "logs");
}

/**
 * Find log files in directory
 * @param dir - Directory to search
 * @param type - 'main' for ultracode logs, 'worker' for worker logs, 'all' for both
 */
export function findLogFiles(dir: string, type: "main" | "worker" | "all" = "main"): string[] {
  if (!existsSync(dir)) return [];

  try {
    const files = readdirSync(dir)
      .filter((f) => {
        if (!f.endsWith(".log")) return false;
        if (type === "main") return f.startsWith("ultracode-");
        if (type === "worker") return f.startsWith("worker-");
        return f.startsWith("ultracode-") || f.startsWith("worker-");
      })
      .map((f) => join(dir, f))
      .sort((a, b) => {
        const statA = statSync(a);
        const statB = statSync(b);
        return statB.mtime.getTime() - statA.mtime.getTime();
      });
    return files;
  } catch {
    return [];
  }
}

/**
 * Process log files with filter
 */
export async function* processLogFiles(files: string[], filter: LogQueryFilter): AsyncGenerator<ParsedLogLine> {
  let count = 0;
  let skipped = 0;

  for (const file of files) {
    if (!existsSync(file)) continue;

    const stream = createReadStream(file, { encoding: "utf-8" });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });
    let lineNumber = 0;

    for await (const line of rl) {
      lineNumber++;

      const entry = parseLogLine(line, lineNumber);
      if (!entry) continue;

      filter.timeRange; // Ensure filter is used (stats tracking)

      if (matchesFilter(entry, filter)) {
        // Handle offset
        if (skipped < filter.offset) {
          skipped++;
          continue;
        }

        yield entry;
        count++;

        // Handle limit
        if (count >= filter.limit) {
          rl.close();
          stream.destroy();
          return;
        }
      }
    }
  }
}

/**
 * Follow log file (tail -f style)
 */
export async function followLogFile(
  file: string,
  filter: LogQueryFilter,
  options: OutputOptions,
  callback: (output: string) => void,
): Promise<void> {
  // Read existing content first
  const files = existsSync(file) ? [file] : findLogFiles(getDefaultLogDir());
  const targetFile = files[0];

  if (!targetFile) {
    callback("No log files found");
    return;
  }

  // Process existing
  for await (const entry of processLogFiles([targetFile], { ...filter, limit: 100 })) {
    callback(formatEntry(entry, options));
  }

  // Watch for changes
  const watcher = watch(targetFile, { persistent: true });
  let lastSize = statSync(targetFile).size;

  watcher.on("change", async () => {
    const newSize = statSync(targetFile).size;
    if (newSize <= lastSize) {
      lastSize = newSize;
      return;
    }

    // Read new content
    const stream = createReadStream(targetFile, {
      start: lastSize,
      encoding: "utf-8",
    });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of rl) {
      const entry = parseLogLine(line, 0);
      if (entry && matchesFilter(entry, filter)) {
        callback(formatEntry(entry, options));
      }
    }

    lastSize = newSize;
  });

  // Keep running
  await new Promise(() => {});
}

/**
 * Embedding session data from emb_summary log entries
 */
export interface EmbeddingSession {
  timestamp: Date;
  total: number;
  durationMs: number;
  speedPerSec: number;
  workers: number;
  batches: number;
  provider?: string | undefined;
}

/**
 * Collect embedding sessions from log entries
 * Looks for EMBEDDING module with emb_summary event, or aggregates from vectors.written events
 */
export function collectEmbeddingSessions(entries: ParsedLogLine[]): EmbeddingSession[] {
  // First try emb_summary events (new format)
  const summaryEntries = entries.filter((e) => e.event === "emb_summary" && e.module === "EMBEDDING");

  if (summaryEntries.length > 0) {
    return summaryEntries
      .map((e) => {
        const durRaw = e.kv["dur"];
        // Log parser already converts "1.9s" to 1900 (ms), so use as-is if number
        const durationMs = typeof durRaw === "number" ? durRaw : parseFloat(String(durRaw).replace("s", "")) * 1000;
        return {
          timestamp: e.timestamp,
          total: Number(e.kv["total"]) || 0,
          durationMs: durationMs || 0,
          speedPerSec: parseInt(String(e.kv["speed"]).replace("/s", ""), 10) || 0,
          workers: Number(e.kv["workers"]) || 0,
          batches: Number(e.kv["batches"]) || 0,
          provider: e.kv["provider"] ? String(e.kv["provider"]) : undefined,
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Fallback: aggregate from vectors.written events (legacy/current format)
  const vectorEvents = entries.filter((e) => e.event === ">>> vectors.written" || e.event === "Worker wrote vectors");

  if (vectorEvents.length === 0) {
    return [];
  }

  // Group by session (events within 60 seconds of each other)
  const sessions: EmbeddingSession[] = [];
  let currentSession: { entries: ParsedLogLine[]; workers: Set<string> } | null = null;

  for (const entry of vectorEvents) {
    if (!currentSession) {
      currentSession = { entries: [entry], workers: new Set() };
      const workerId = String(entry.kv["workerid"] || "");
      if (workerId) currentSession.workers.add(workerId);
    } else {
      const lastEntry = currentSession.entries.at(-1)!;
      const timeDiff = entry.timestamp.getTime() - lastEntry.timestamp.getTime();

      if (timeDiff < 60000) {
        // Same session (within 60s)
        currentSession.entries.push(entry);
        const workerId = String(entry.kv["workerid"] || "");
        if (workerId) currentSession.workers.add(workerId);
      } else {
        // New session - finalize current
        const first = currentSession.entries[0]!;
        const last = currentSession.entries.at(-1)!;
        const durationMs = last.timestamp.getTime() - first.timestamp.getTime() || 1;
        const total = currentSession.entries.reduce((sum, e) => sum + (Number(e.kv["count"]) || 0), 0);

        sessions.push({
          timestamp: first.timestamp,
          total,
          durationMs,
          speedPerSec: Math.round((total / durationMs) * 1000),
          workers: currentSession.workers.size,
          batches: currentSession.entries.length,
        });

        currentSession = { entries: [entry], workers: new Set() };
        const workerId = String(entry.kv["workerid"] || "");
        if (workerId) currentSession.workers.add(workerId);
      }
    }
  }

  // Finalize last session
  if (currentSession && currentSession.entries.length > 0) {
    const first = currentSession.entries[0]!;
    const last = currentSession.entries.at(-1)!;
    const durationMs = last.timestamp.getTime() - first.timestamp.getTime() || 1;
    const total = currentSession.entries.reduce((sum, e) => sum + (Number(e.kv["count"]) || 0), 0);

    sessions.push({
      timestamp: first.timestamp,
      total,
      durationMs,
      speedPerSec: Math.round((total / durationMs) * 1000),
      workers: currentSession.workers.size,
      batches: currentSession.entries.length,
    });
  }

  return sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Format embedding statistics for output
 */
export function formatEmbeddingStats(sessions: EmbeddingSession[], noColor: boolean): string {
  const lines: string[] = [];
  const bold = noColor ? "" : "\x1b[1m";
  const dim = noColor ? "" : "\x1b[2m";
  const cyan = noColor ? "" : "\x1b[36m";
  const reset = noColor ? "" : "\x1b[0m";

  lines.push(`${bold}Embedding Statistics${reset}`);
  lines.push(`${dim}─────────────────────────────────────${reset}`);
  lines.push(`Sessions: ${sessions.length}`);

  if (sessions.length === 0) {
    lines.push("");
    lines.push(`${dim}No embedding sessions found in logs.${reset}`);
    lines.push(`${dim}Run indexing first: mcp index${reset}`);
    return lines.join("\n");
  }

  for (const [i, session] of sessions.entries()) {
    lines.push("");
    const dateStr = session.timestamp.toISOString().slice(0, 19).replace("T", " ");
    lines.push(`${bold}Session ${i + 1}:${reset} ${dateStr}`);
    lines.push(`  Total:     ${cyan}${session.total}${reset} embeddings`);
    lines.push(`  Duration:  ${(session.durationMs / 1000).toFixed(1)}s`);
    lines.push(`  Speed:     ${cyan}${session.speedPerSec}/s${reset}`);
    lines.push(`  Workers:   ${session.workers}`);
    if (session.batches > 0) {
      lines.push(`  Batches:   ${session.batches}`);
    }
    if (session.provider) {
      lines.push(`  Provider:  ${session.provider}`);
    }
  }

  return lines.join("\n");
}

/**
 * Format stats for output
 */
export function formatStats(stats: LogStats, noColor: boolean): string {
  const lines: string[] = [];
  const dim = noColor ? "" : "\x1b[2m";
  const reset = noColor ? "" : "\x1b[0m";
  const bold = noColor ? "" : "\x1b[1m";

  lines.push(`${bold}Log Statistics${reset}`);
  lines.push(`${dim}─────────────────────────────────────${reset}`);
  lines.push(`Total matched: ${stats.matched}`);

  if (stats.firstTimestamp && stats.lastTimestamp) {
    lines.push(`Time range: ${stats.firstTimestamp.toISOString()} - ${stats.lastTimestamp.toISOString()}`);
  }

  lines.push("");
  lines.push(`${bold}By Level:${reset}`);
  for (const [level, count] of Object.entries(stats.byLevel)) {
    if (count > 0) {
      const name = LOG_LEVEL_NAMES[level as LogLevelChar];
      lines.push(`  ${name.padEnd(8)} ${count}`);
    }
  }

  lines.push("");
  lines.push(`${bold}Top Modules:${reset}`);
  const topModules = Object.entries(stats.byModule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [module, count] of topModules) {
    lines.push(`  ${module.padEnd(20)} ${count}`);
  }

  lines.push("");
  lines.push(`${bold}Top Events:${reset}`);
  const topEvents = Object.entries(stats.byEvent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [event, count] of topEvents) {
    lines.push(`  ${event.padEnd(20)} ${count}`);
  }

  if (stats.avgDuration !== null) {
    lines.push("");
    lines.push(`${bold}Duration Stats:${reset}`);
    lines.push(`  Average: ${Math.round(stats.avgDuration)}ms`);
    lines.push(`  Total: ${Math.round(stats.totalDuration)}ms`);
    lines.push(`  Count: ${stats.durationCount}`);
  }

  return lines.join("\n");
}

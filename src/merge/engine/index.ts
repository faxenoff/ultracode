export { MultiVersionIndexer } from "../indexing/multi-version-indexer.js";
export {
  type AIAnalysisResult,
  AIConflictResolver,
  type AIConflictResolverConfig,
} from "./ai-conflict-resolver.js";
export { ConflictResolver, type ConflictResolverConfig } from "./conflict-resolver.js";
export { type Diff3Options, type Diff3Region, type Diff3Result, diff3Merge } from "./diff3.js";
export { ThreeWayMerger, type ThreeWayMergerConfig } from "./three-way-merger.js";

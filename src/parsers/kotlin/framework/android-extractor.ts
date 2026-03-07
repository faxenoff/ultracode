/**
 * Kotlin Android Framework Extractor
 *
 * Extracts Android-specific patterns from Kotlin code.
 * Handles: ViewModel, LiveData, StateFlow, Activity, Fragment,
 *          Compose functions, Android lifecycle, etc.
 *
 * Key features:
 * - Detects Android components (Activity, Fragment, ViewModel)
 * - Extracts LiveData/StateFlow patterns
 * - Identifies Compose functions (@Composable)
 * - Extracts lifecycle-aware patterns
 * - Detects Android resource references
 */

import type { EntityRelationship, ParsedEntity } from "../../../types/parser.js";
import type { AnnotationInfo, LocationInfo, ViewModelInfo } from "../types.js";

// =============================================================================
// ANDROID COMPONENT PATTERNS
// =============================================================================

/**
 * Android component base classes
 */
const ANDROID_COMPONENTS = new Map<string, string>([
  ["Activity", "activity"],
  ["AppCompatActivity", "activity"],
  ["ComponentActivity", "activity"],
  ["Fragment", "fragment"],
  ["DialogFragment", "fragment"],
  ["BottomSheetDialogFragment", "fragment"],
  ["ViewModel", "viewmodel"],
  ["AndroidViewModel", "viewmodel"],
  ["Service", "service"],
  ["IntentService", "service"],
  ["BroadcastReceiver", "receiver"],
  ["ContentProvider", "provider"],
  ["Application", "application"],
  ["Worker", "worker"],
  ["CoroutineWorker", "worker"],
]);

/**
 * Android state holders
 */
export const ANDROID_STATE_HOLDERS = new Set([
  "LiveData",
  "MutableLiveData",
  "MediatorLiveData",
  "StateFlow",
  "MutableStateFlow",
  "SharedFlow",
  "MutableSharedFlow",
  "State",
  "MutableState",
]);

/**
 * Android lifecycle annotations
 */
const ANDROID_LIFECYCLE_ANNOTATIONS = new Set([
  "OnLifecycleEvent",
  "OnCreate",
  "OnStart",
  "OnResume",
  "OnPause",
  "OnStop",
  "OnDestroy",
]);

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Check if code contains Android framework imports
 */
export function detectAndroidFramework(code: string): boolean {
  const androidPatterns = [
    /import\s+android\./,
    /import\s+androidx\./,
    /import\s+com\.android\./,
    /@Composable/,
    /extends\s+(App)?CompatActivity/,
    /:\s*ViewModel\s*\(/,
    /:\s*Fragment\s*\(/,
  ];

  return androidPatterns.some((pattern) => pattern.test(code));
}

/**
 * Detect Android framework confidence level
 */
export function getAndroidConfidence(code: string): number {
  let confidence = 0;

  if (/import\s+android\./.test(code)) confidence += 0.3;
  if (/import\s+androidx\./.test(code)) confidence += 0.3;
  if (/@Composable/.test(code)) confidence += 0.2;
  if (/:\s*ViewModel\s*\(/.test(code)) confidence += 0.1;
  if (/LiveData|StateFlow/.test(code)) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

// =============================================================================
// ANNOTATION EXTRACTION
// =============================================================================

/**
 * Extract Android-specific information from annotations
 */
export function extractAndroidInfo(annotations: AnnotationInfo[]): {
  isComposable: boolean;
  isPreview: boolean;
  lifecycleEvents: string[];
  androidAnnotations: string[];
} {
  const result = {
    isComposable: false,
    isPreview: false,
    lifecycleEvents: [] as string[],
    androidAnnotations: [] as string[],
  };

  for (const annotation of annotations) {
    const annotationName = annotation.name.replace(/^.*\./, "");

    if (annotationName === "Composable") {
      result.isComposable = true;
      result.androidAnnotations.push("Composable");
    }

    if (annotationName === "Preview" || annotationName === "PreviewParameter") {
      result.isPreview = true;
      result.androidAnnotations.push(annotationName);
    }

    if (ANDROID_LIFECYCLE_ANNOTATIONS.has(annotationName)) {
      result.lifecycleEvents.push(annotationName);
      result.androidAnnotations.push(annotationName);
    }

    // Hilt/Dagger annotations
    if (["HiltViewModel", "Inject", "AndroidEntryPoint", "HiltAndroidApp"].includes(annotationName)) {
      result.androidAnnotations.push(annotationName);
    }
  }

  return result;
}

// =============================================================================
// VIEWMODEL EXTRACTION
// =============================================================================

/**
 * Extract ViewModel information from entity
 */
export function extractViewModelInfo(entity: ParsedEntity, children: ParsedEntity[]): ViewModelInfo | undefined {
  // Check if entity extends ViewModel
  if (!entity.inheritance) return undefined;

  const baseClasses = entity.inheritance.baseClasses;
  const baseClass = baseClasses && baseClasses.length > 0 ? baseClasses[0] : undefined;
  const isViewModel = baseClass && (baseClass.includes("ViewModel") || baseClass.includes("AndroidViewModel"));

  if (!isViewModel) return undefined;

  const viewModelInfo: ViewModelInfo = {
    stateFlows: [],
    liveData: [],
  };

  // Extract state holders from properties
  for (const child of children) {
    if (child.type !== "property") continue;

    const propertyType = (child.metadata as any)?.propertyType || "";
    const propertyName = child.name.split(".").pop() || child.name;

    // Check for StateFlow/SharedFlow
    if (propertyType.includes("StateFlow") || propertyType.includes("SharedFlow")) {
      viewModelInfo.stateFlows.push(propertyName);
    }

    // Check for LiveData
    if (propertyType.includes("LiveData")) {
      viewModelInfo.liveData.push(propertyName);
    }
  }

  return viewModelInfo;
}

// =============================================================================
// ENTITY ENRICHMENT
// =============================================================================

/**
 * Enrich parsed entity with Android information
 */
export function enrichEntityWithAndroid(
  entity: ParsedEntity,
  _code: string,
): {
  entity: ParsedEntity;
  relationships: EntityRelationship[];
} {
  const relationships: EntityRelationship[] = [];

  // Check for Android component inheritance
  const baseClasses = entity.inheritance?.baseClasses;
  const baseClass = baseClasses && baseClasses.length > 0 ? baseClasses[0] : undefined;
  if (baseClass) {
    const componentType = ANDROID_COMPONENTS.get(baseClass);
    if (componentType) {
      entity.metadata = {
        ...entity.metadata,
        android: {
          componentType,
          baseClass: baseClass,
        },
      };

      relationships.push({
        from: entity.name,
        to: baseClass,
        type: "inherits",
        metadata: {
          androidComponent: componentType,
        },
      });
    }
  }

  // Check for Composable annotations
  if (entity.decorators) {
    const androidInfo = extractAndroidInfo(entity.decorators);

    if (androidInfo.isComposable) {
      entity.metadata = {
        ...entity.metadata,
        android: {
          ...(entity.metadata as any)?.android,
          isComposable: true,
          isPreview: androidInfo.isPreview,
        },
      };
    }

    if (androidInfo.androidAnnotations.length > 0) {
      entity.metadata = {
        ...entity.metadata,
        android: {
          ...(entity.metadata as any)?.android,
          annotations: androidInfo.androidAnnotations,
        },
      };
    }
  }

  return { entity, relationships };
}

// =============================================================================
// COMPOSE EXTRACTION
// =============================================================================

/**
 * Check if function is a Composable
 */
export function isComposableFunction(entity: ParsedEntity): boolean {
  if (entity.type !== "function") return false;
  if (!entity.decorators) return false;

  return entity.decorators.some((a) => a.name.includes("Composable"));
}

/**
 * Extract Compose state usages from function body
 */
export function extractComposeStateUsages(code: string): Array<{
  type: "remember" | "rememberSaveable" | "derivedStateOf" | "collectAsState";
  location?: LocationInfo;
}> {
  const usages: Array<{
    type: "remember" | "rememberSaveable" | "derivedStateOf" | "collectAsState";
  }> = [];

  const patterns: Array<{
    regex: RegExp;
    type: "remember" | "rememberSaveable" | "derivedStateOf" | "collectAsState";
  }> = [
    { regex: /\bremember\s*\{/g, type: "remember" },
    { regex: /\brememberSaveable\s*\{/g, type: "rememberSaveable" },
    { regex: /\bderivedStateOf\s*\{/g, type: "derivedStateOf" },
    { regex: /\.collectAsState\s*\(/g, type: "collectAsState" },
  ];

  for (const { regex, type } of patterns) {
    while (regex.exec(code)) {
      usages.push({ type });
    }
  }

  return usages;
}

// =============================================================================
// RESOURCE EXTRACTION
// =============================================================================

/**
 * Extract Android resource references from code
 */
export function extractResourceReferences(code: string): Array<{
  type: "string" | "drawable" | "layout" | "id" | "color" | "dimen" | "style" | "other";
  name: string;
}> {
  const resources: Array<{
    type: "string" | "drawable" | "layout" | "id" | "color" | "dimen" | "style" | "other";
    name: string;
  }> = [];

  // R.type.name pattern
  const rPattern = /R\.(\w+)\.(\w+)/g;
  let match: RegExpExecArray | null;

  while ((match = rPattern.exec(code)) !== null) {
    const typeStr = match[1] || "";
    const name = match[2] || "";

    const type = (
      ["string", "drawable", "layout", "id", "color", "dimen", "style"].includes(typeStr) ? typeStr : "other"
    ) as "string" | "drawable" | "layout" | "id" | "color" | "dimen" | "style" | "other";

    resources.push({ type, name });
  }

  return resources;
}

// =============================================================================
// NAVIGATION EXTRACTION
// =============================================================================

/**
 * Extract Navigation Compose destinations
 */
export function extractNavigationDestinations(code: string): Array<{
  route: string;
  arguments?: string[];
}> {
  const destinations: Array<{
    route: string;
    arguments?: string[];
  }> = [];

  // composable("route") pattern
  const composablePattern = /composable\s*\(\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = composablePattern.exec(code)) !== null) {
    const route = match[1] || "";
    const args: string[] = [];

    // Extract arguments from route pattern like "profile/{userId}"
    const argPattern = /\{(\w+)\}/g;
    let argMatch: RegExpExecArray | null;
    while ((argMatch = argPattern.exec(route)) !== null) {
      if (argMatch[1]) args.push(argMatch[1]);
    }

    destinations.push({
      route,
      ...(args.length > 0 ? { arguments: args } : {}),
    });
  }

  return destinations;
}

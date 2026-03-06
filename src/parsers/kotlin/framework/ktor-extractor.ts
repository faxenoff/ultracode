/**
 * Kotlin Ktor Framework Extractor
 *
 * Extracts Ktor-specific patterns from Kotlin code.
 * Handles: routing, HTTP methods, plugins, serialization,
 *          authentication, content negotiation, etc.
 *
 * Key features:
 * - Detects Ktor application and modules
 * - Extracts routing definitions
 * - Identifies HTTP method handlers (get, post, put, delete)
 * - Extracts installed plugins
 * - Detects authentication patterns
 */

import type { EntityRelationship, ParsedEntity } from "../../../types/parser.js";

/** HTTP method type */
type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

/** Route info without location (for regex extraction) */
interface ExtractedRoute {
  method: HttpMethod;
  path: string;
  isAuthenticated?: boolean;
}

// =============================================================================
// KTOR PATTERNS
// =============================================================================

/**
 * Ktor HTTP method handlers
 */
const KTOR_HTTP_METHODS = new Map<string, HttpMethod>([
  ["get", "get"],
  ["post", "post"],
  ["put", "put"],
  ["delete", "delete"],
  ["patch", "patch"],
  ["head", "head"],
  ["options", "options"],
]);

/**
 * Ktor plugins/features
 */
const KTOR_PLUGINS = new Set([
  "ContentNegotiation",
  "CallLogging",
  "CORS",
  "DefaultHeaders",
  "StatusPages",
  "Authentication",
  "Sessions",
  "WebSockets",
  "Compression",
  "CachingHeaders",
  "ConditionalHeaders",
  "ForwardedHeaders",
  "XForwardedHeaders",
  "Routing",
  "Resources",
  "DoubleReceive",
]);

/**
 * Ktor serialization formats
 */
const KTOR_SERIALIZATION = new Set(["json", "xml", "cbor", "protobuf", "gson", "jackson"]);

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Check if code contains Ktor framework imports
 */
export function detectKtorFramework(code: string): boolean {
  const ktorPatterns = [
    /import\s+io\.ktor\./,
    /\bembeddedServer\s*\(/,
    /\bApplication\s*\.\s*module\b/,
    /\brouting\s*\{/,
    /\binstall\s*\(\s*(ContentNegotiation|CallLogging|CORS)/,
  ];

  return ktorPatterns.some((pattern) => pattern.test(code));
}

/**
 * Detect Ktor framework confidence level
 */
export function getKtorConfidence(code: string): number {
  let confidence = 0;

  if (/import\s+io\.ktor\./.test(code)) confidence += 0.4;
  if (/\bembeddedServer\s*\(/.test(code)) confidence += 0.3;
  if (/\brouting\s*\{/.test(code)) confidence += 0.2;
  if (/\binstall\s*\(/.test(code)) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

// =============================================================================
// ROUTING EXTRACTION
// =============================================================================

/**
 * Extract Ktor routes from code
 */
export function extractKtorRoutes(code: string): ExtractedRoute[] {
  const routes: ExtractedRoute[] = [];

  // Extract route blocks with path
  const routePattern = /route\s*\(\s*["']([^"']+)["']\s*\)\s*\{/g;
  let routeMatch: RegExpExecArray | null;

  while ((routeMatch = routePattern.exec(code)) !== null) {
    const basePath = routeMatch[1] || "";
    const startIndex = routeMatch.index + routeMatch[0].length;

    // Find matching closing brace
    let braceCount = 1;
    let endIndex = startIndex;
    while (braceCount > 0 && endIndex < code.length) {
      if (code[endIndex] === "{") braceCount++;
      if (code[endIndex] === "}") braceCount--;
      endIndex++;
    }

    const routeBody = code.substring(startIndex, endIndex - 1);

    // Extract HTTP handlers within this route
    for (const [method, httpMethod] of KTOR_HTTP_METHODS) {
      const handlerPattern = new RegExp(`\\b${method}\\s*(?:\\(\\s*["']([^"']*?)["']\\s*\\))?\\s*\\{`, "g");
      let handlerMatch: RegExpExecArray | null;

      while ((handlerMatch = handlerPattern.exec(routeBody)) !== null) {
        const subPath = handlerMatch[1] || "";
        routes.push({
          path: basePath + subPath,
          method: httpMethod,
          isAuthenticated: routeBody.includes("authenticate"),
        });
      }
    }
  }

  // Extract top-level HTTP handlers
  for (const [method, httpMethod] of KTOR_HTTP_METHODS) {
    const topLevelPattern = new RegExp(`\\b${method}\\s*\\(\\s*["']([^"']+)["']\\s*\\)\\s*\\{`, "g");
    let match: RegExpExecArray | null;

    while ((match = topLevelPattern.exec(code)) !== null) {
      // Check if this is inside a route block (already handled)
      const beforeMatch = code.substring(0, match.index);
      const lastRouteIndex = beforeMatch.lastIndexOf("route(");

      // Skip if inside a route block we already processed
      if (lastRouteIndex !== -1) {
        const betweenText = code.substring(lastRouteIndex, match.index);
        const openBraces = (betweenText.match(/\{/g) || []).length;
        const closeBraces = (betweenText.match(/\}/g) || []).length;
        if (openBraces > closeBraces) continue;
      }

      routes.push({
        path: match[1] || "",
        method: httpMethod,
      });
    }
  }

  return routes;
}

/**
 * Extract route information with handler details
 */
export function extractRouteHandlers(code: string): Array<{
  route: ExtractedRoute;
  hasCallReceive: boolean;
  hasCallRespond: boolean;
  responseType?: string;
}> {
  const handlers: Array<{
    route: ExtractedRoute;
    hasCallReceive: boolean;
    hasCallRespond: boolean;
    responseType?: string;
  }> = [];

  for (const [method, httpMethod] of KTOR_HTTP_METHODS) {
    const handlerPattern = new RegExp(
      `\\b${method}\\s*\\(\\s*["']([^"']+)["']\\s*\\)\\s*\\{([\\s\\S]*?)(?=\\n\\s*\\})`,
      "g",
    );
    let match: RegExpExecArray | null;

    while ((match = handlerPattern.exec(code)) !== null) {
      const path = match[1] || "";
      const body = match[2] || "";

      const hasCallReceive = /call\.receive</.test(body);
      const hasCallRespond = /call\.respond/.test(body);

      // Try to extract response type
      let responseType: string | undefined;
      const respondMatch = body.match(/call\.respond\s*\(\s*(?:HttpStatusCode\.\w+\s*,\s*)?(\w+)/);
      if (respondMatch) {
        responseType = respondMatch[1];
      }

      handlers.push({
        route: { path, method: httpMethod },
        hasCallReceive,
        hasCallRespond,
        ...(responseType != null ? { responseType } : {}),
      });
    }
  }

  return handlers;
}

// =============================================================================
// PLUGIN EXTRACTION
// =============================================================================

/**
 * Extract installed Ktor plugins
 */
export function extractInstalledPlugins(code: string): Array<{
  name: string;
  hasConfiguration: boolean;
}> {
  const plugins: Array<{
    name: string;
    hasConfiguration: boolean;
  }> = [];

  // Pattern for install(Plugin) { config }
  const installPattern = /install\s*\(\s*(\w+)\s*\)\s*(\{)?/g;
  let match: RegExpExecArray | null;

  while ((match = installPattern.exec(code)) !== null) {
    const pluginName = match[1] || "";
    const hasConfiguration = !!match[2];

    if (pluginName && KTOR_PLUGINS.has(pluginName)) {
      plugins.push({
        name: pluginName,
        hasConfiguration,
      });
    }
  }

  return plugins;
}

/**
 * Extract ContentNegotiation serialization config
 */
export function extractSerializationConfig(code: string): Array<{
  format: string;
  hasCustomConfig: boolean;
}> {
  const serializations: Array<{
    format: string;
    hasCustomConfig: boolean;
  }> = [];

  for (const format of KTOR_SERIALIZATION) {
    const pattern = new RegExp(`\\b${format}\\s*\\(([^)]*?)\\)`, "g");
    const match = pattern.exec(code);

    if (match) {
      serializations.push({
        format,
        hasCustomConfig: (match[1] || "").trim().length > 0,
      });
    }
  }

  return serializations;
}

// =============================================================================
// AUTHENTICATION EXTRACTION
// =============================================================================

/**
 * Extract authentication configuration
 */
export function extractAuthenticationConfig(code: string): {
  hasAuthentication: boolean;
  authMethods: string[];
  protectedRoutes: string[];
} {
  const result = {
    hasAuthentication: false,
    authMethods: [] as string[],
    protectedRoutes: [] as string[],
  };

  // Check for authentication installation
  if (/install\s*\(\s*Authentication\s*\)/.test(code)) {
    result.hasAuthentication = true;
  }

  // Extract auth methods
  const authMethods = ["basic", "bearer", "jwt", "oauth", "session", "form"];
  for (const method of authMethods) {
    const pattern = new RegExp(`\\b${method}\\s*\\(`, "g");
    if (pattern.test(code)) {
      result.authMethods.push(method);
    }
  }

  // Extract protected routes
  const authenticatePattern = /authenticate\s*\([^)]*\)\s*\{[\s\S]*?route\s*\(\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = authenticatePattern.exec(code)) !== null) {
    if (match[1]) result.protectedRoutes.push(match[1]);
  }

  return result;
}

// =============================================================================
// ENTITY ENRICHMENT
// =============================================================================

/**
 * Enrich parsed entity with Ktor information
 */
export function enrichEntityWithKtor(
  entity: ParsedEntity,
  code: string,
): {
  entity: ParsedEntity;
  relationships: EntityRelationship[];
} {
  const relationships: EntityRelationship[] = [];

  // Check if this is a Ktor module function
  if (entity.type === "function") {
    const functionName = entity.name.split(".").pop() || entity.name;

    // Check for Application.module pattern
    if (functionName === "module" || /Application\./.test(entity.name)) {
      const routes = extractKtorRoutes(code);
      const plugins = extractInstalledPlugins(code);

      entity.metadata = {
        ...entity.metadata,
        ktor: {
          isModule: true,
          routes,
          plugins: plugins.map((p) => p.name),
        },
      };

      // Add relationships for routes
      for (const route of routes) {
        relationships.push({
          from: entity.name,
          to: `${route.method.toUpperCase()} ${route.path}`,
          type: "contains",
          metadata: {
            routeType: "http",
            httpMethod: route.method,
          },
        });
      }
    }
  }

  return { entity, relationships };
}

// =============================================================================
// CLIENT EXTRACTION
// =============================================================================

/**
 * Extract Ktor HTTP client configuration
 */
export function extractHttpClientConfig(code: string): {
  hasClient: boolean;
  engine?: string | undefined;
  plugins: string[];
} {
  const result: { hasClient: boolean; engine?: string | undefined; plugins: string[] } = {
    hasClient: false,
    plugins: [],
  };

  // Check for HttpClient creation
  const clientPattern = /HttpClient\s*\(\s*(\w+)?\s*\)/;
  const clientMatch = clientPattern.exec(code);

  if (clientMatch) {
    result.hasClient = true;
    if (clientMatch[1]) {
      result.engine = clientMatch[1];
    }
  }

  // Extract client plugins
  const clientPlugins = [
    "ContentNegotiation",
    "Logging",
    "Auth",
    "DefaultRequest",
    "HttpTimeout",
    "HttpCookies",
    "UserAgent",
  ];

  for (const plugin of clientPlugins) {
    if (new RegExp(`install\\s*\\(\\s*${plugin}`).test(code)) {
      result.plugins.push(plugin);
    }
  }

  return result;
}

// =============================================================================
// WEBSOCKET EXTRACTION
// =============================================================================

/**
 * Extract WebSocket routes
 */
export function extractWebSocketRoutes(code: string): Array<{
  path: string;
  hasIncoming: boolean;
  hasOutgoing: boolean;
}> {
  const wsRoutes: Array<{
    path: string;
    hasIncoming: boolean;
    hasOutgoing: boolean;
  }> = [];

  // webSocket("/path") { ... }
  const wsPattern = /webSocket\s*\(\s*["']([^"']+)["']\s*\)\s*\{([\s\S]*?)(?=\n\s*\})/g;
  let match: RegExpExecArray | null;

  while ((match = wsPattern.exec(code)) !== null) {
    const path = match[1] || "";
    const body = match[2] || "";

    wsRoutes.push({
      path,
      hasIncoming: /incoming\.receive/.test(body) || /for\s*\(\s*frame\s+in\s+incoming/.test(body),
      hasOutgoing: /send\s*\(/.test(body) || /outgoing\.send/.test(body),
    });
  }

  return wsRoutes;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if code defines a Ktor application
 */
export function isKtorApplication(code: string): boolean {
  return /embeddedServer\s*\(/.test(code) || /Application\s*\.\s*module/.test(code);
}

/**
 * Get all defined endpoints from code
 */
export function getAllEndpoints(code: string): Array<{
  method: string;
  path: string;
  type: "http" | "websocket";
}> {
  const endpoints: Array<{
    method: string;
    path: string;
    type: "http" | "websocket";
  }> = [];

  // HTTP routes
  const routes = extractKtorRoutes(code);
  for (const route of routes) {
    endpoints.push({
      method: route.method,
      path: route.path,
      type: "http",
    });
  }

  // WebSocket routes
  const wsRoutes = extractWebSocketRoutes(code);
  for (const ws of wsRoutes) {
    endpoints.push({
      method: "WS",
      path: ws.path,
      type: "websocket",
    });
  }

  return endpoints;
}

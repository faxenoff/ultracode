/**
 * Angular Parser Extension
 *
 * Extends TypeScript parser with Angular-specific features:
 * - Detects Angular decorators (@Component, @Directive, @NgModule, etc.)
 * - Parses Angular templates (inline and external)
 * - Extracts template bindings, events, and structural directives
 * - Optional @angular/compiler integration for full template AST
 *
 * Philosophy: Angular components are TypeScript files, so we extend
 * the TypeScript parser rather than creating a separate one.
 */

import ts from "typescript";
import { log } from "../logging/index.js";
import type { ParsedEntity } from "../types/parser.js";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Angular-specific entity information
 */
export interface AngularEntityInfo {
  /** Angular decorator type */
  angularType: "component" | "directive" | "pipe" | "injectable" | "ngmodule" | "guard" | "resolver" | "interceptor";

  /** Component selector */
  selector?: string;

  /** Template (inline) */
  template?: string;

  /** Template URL (external) */
  templateUrl?: string;

  /** Style URLs */
  styleUrls?: string[];

  /** Inline styles */
  styles?: string[];

  /** Change detection strategy */
  changeDetection?: "OnPush" | "Default";

  /** View encapsulation */
  encapsulation?: "Emulated" | "None" | "ShadowDom";

  /** Standalone component flag (Angular 14+) */
  standalone?: boolean;

  /** Imports (for standalone components) */
  imports?: string[];

  /** Providers */
  providers?: string[];

  /** Host bindings */
  hostBindings?: TemplateBinding[];

  /** Host listeners */
  hostListeners?: TemplateEvent[];
}

/**
 * Parsed template information
 */
export interface AngularTemplateInfo {
  /** Template source */
  source: string;

  /** Is inline template */
  isInline: boolean;

  /** Property bindings [property]="value" */
  propertyBindings: TemplateBinding[];

  /** Event bindings (event)="handler" */
  eventBindings: TemplateEvent[];

  /** Two-way bindings [(ngModel)]="property" */
  twoWayBindings: TemplateBinding[];

  /** Structural directives *ngIf, *ngFor, etc. */
  structuralDirectives: StructuralDirective[];

  /** Interpolations {{ expression }} */
  interpolations: TemplateInterpolation[];

  /** Template references #ref */
  templateRefs: string[];

  /** Pipe usages | pipeName */
  pipeUsages: PipeUsage[];
}

export interface TemplateBinding {
  name: string;
  expression: string;
  line?: number | undefined;
}

export interface TemplateEvent {
  name: string;
  handler: string;
  line?: number | undefined;
}

export interface StructuralDirective {
  name: string; // ngIf, ngFor, ngSwitch
  expression: string;
  variables?: string[]; // let item of items
  line?: number | undefined;
}

export interface TemplateInterpolation {
  expression: string;
  line?: number | undefined;
}

export interface PipeUsage {
  name: string;
  args?: string[] | undefined;
  line?: number | undefined;
}

/**
 * Angular compiler module (dynamically loaded)
 */
interface AngularCompilerModule {
  parseTemplate: (
    template: string,
    filePath: string,
    options?: {
      preserveWhitespaces?: boolean;
      preserveLineEndings?: boolean;
    },
  ) => AngularTemplateParseResult;
  [key: string]: unknown;
}

/**
 * Angular template parse result from @angular/compiler
 */
interface AngularTemplateParseResult {
  nodes?: AngularASTNode[];
  errors?: unknown[];
  [key: string]: unknown;
}

/**
 * Angular template AST node
 */
interface AngularASTNode {
  constructor?: { name?: string };
  name?: string;
  value?: { source?: string };
  handler?: { source?: string };
  sourceSpan?: {
    start?: { line?: number };
    end?: { line?: number };
  };
  children?: AngularASTNode[];
  inputs?: AngularASTNode[];
  outputs?: AngularASTNode[];
  references?: AngularASTNode[];
  [key: string]: unknown;
}

/**
 * @angular/compiler parseTemplate result
 */
interface ParseTemplateResult {
  nodes?: AngularASTNode[];
  errors?: Array<{ msg: string }>;
}

/**
 * ParsedEntity with Angular metadata
 */
interface ParsedEntityWithAngular extends ParsedEntity {
  angular?: AngularEntityInfo;
  templateInfo?: AngularTemplateInfo;
}

// =============================================================================
// ANGULAR DECORATOR DETECTION
// =============================================================================

const ANGULAR_DECORATORS = new Map<string, AngularEntityInfo["angularType"]>([
  ["Component", "component"],
  ["Directive", "directive"],
  ["Pipe", "pipe"],
  ["Injectable", "injectable"],
  ["NgModule", "ngmodule"],
  ["CanActivate", "guard"],
  ["CanDeactivate", "guard"],
  ["CanLoad", "guard"],
  ["CanMatch", "guard"],
  ["Resolve", "resolver"],
  ["HttpInterceptor", "interceptor"],
]);

/**
 * Check if a class has Angular decorators
 */
export function isAngularClass(node: ts.ClassDeclaration): boolean {
  if (!ts.canHaveDecorators(node)) return false;

  const decorators = ts.getDecorators(node);
  if (!decorators) return false;

  for (const decorator of decorators) {
    const name = getDecoratorName(decorator);
    if (name && ANGULAR_DECORATORS.has(name)) {
      return true;
    }
  }

  return false;
}

/**
 * Get Angular decorator type from a class
 */
export function getAngularType(node: ts.ClassDeclaration): AngularEntityInfo["angularType"] | null {
  if (!ts.canHaveDecorators(node)) return null;

  const decorators = ts.getDecorators(node);
  if (!decorators) return null;

  for (const decorator of decorators) {
    const name = getDecoratorName(decorator);
    if (name && ANGULAR_DECORATORS.has(name)) {
      return ANGULAR_DECORATORS.get(name)!;
    }
  }

  return null;
}

/**
 * Get decorator name from decorator expression
 */
function getDecoratorName(decorator: ts.Decorator): string | null {
  const expression = decorator.expression;

  if (ts.isIdentifier(expression)) {
    return expression.text;
  }

  if (ts.isCallExpression(expression)) {
    const callExpr = expression.expression;
    if (ts.isIdentifier(callExpr)) {
      return callExpr.text;
    }
  }

  return null;
}

// =============================================================================
// DECORATOR METADATA EXTRACTION
// =============================================================================

/**
 * Extract Angular decorator metadata from a class
 */
export function extractAngularMetadata(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): AngularEntityInfo | null {
  const angularType = getAngularType(node);
  if (!angularType) return null;

  const decorators = ts.getDecorators(node);
  if (!decorators) return null;

  const info: AngularEntityInfo = { angularType };

  for (const decorator of decorators) {
    const name = getDecoratorName(decorator);
    if (!name || !ANGULAR_DECORATORS.has(name)) continue;

    // Extract metadata from decorator call
    if (ts.isCallExpression(decorator.expression)) {
      const args = decorator.expression.arguments;
      const firstArg = args[0];
      if (firstArg && ts.isObjectLiteralExpression(firstArg)) {
        extractObjectLiteralMetadata(firstArg, info, sourceFile);
      }
    }
  }

  return info;
}

/**
 * Extract metadata from object literal in decorator
 */
function extractObjectLiteralMetadata(
  obj: ts.ObjectLiteralExpression,
  info: AngularEntityInfo,
  sourceFile: ts.SourceFile,
): void {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;

    const name = prop.name.getText(sourceFile);
    const value = prop.initializer;

    switch (name) {
      case "selector":
        if (ts.isStringLiteral(value)) {
          info.selector = value.text;
        }
        break;

      case "template":
        if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
          info.template = value.text;
        } else if (ts.isTemplateExpression(value)) {
          info.template = value.getText(sourceFile).slice(1, -1); // Remove backticks
        }
        break;

      case "templateUrl":
        if (ts.isStringLiteral(value)) {
          info.templateUrl = value.text;
        }
        break;

      case "styles":
        if (ts.isArrayLiteralExpression(value)) {
          info.styles = value.elements.filter((e): e is ts.StringLiteral => ts.isStringLiteral(e)).map((e) => e.text);
        }
        break;

      case "styleUrls":
      case "styleUrl":
        if (ts.isArrayLiteralExpression(value)) {
          info.styleUrls = value.elements
            .filter((e): e is ts.StringLiteral => ts.isStringLiteral(e))
            .map((e) => e.text);
        } else if (ts.isStringLiteral(value)) {
          info.styleUrls = [value.text];
        }
        break;

      case "changeDetection": {
        const cdText = value.getText(sourceFile);
        if (cdText.includes("OnPush")) {
          info.changeDetection = "OnPush";
        } else {
          info.changeDetection = "Default";
        }
        break;
      }

      case "encapsulation": {
        const encText = value.getText(sourceFile);
        if (encText.includes("None")) {
          info.encapsulation = "None";
        } else if (encText.includes("ShadowDom")) {
          info.encapsulation = "ShadowDom";
        } else {
          info.encapsulation = "Emulated";
        }
        break;
      }

      case "standalone":
        if (value.kind === ts.SyntaxKind.TrueKeyword) {
          info.standalone = true;
        } else if (value.kind === ts.SyntaxKind.FalseKeyword) {
          info.standalone = false;
        }
        break;

      case "imports":
        if (ts.isArrayLiteralExpression(value)) {
          info.imports = value.elements.map((e) => e.getText(sourceFile));
        }
        break;

      case "providers":
        if (ts.isArrayLiteralExpression(value)) {
          info.providers = value.elements.map((e) => e.getText(sourceFile));
        }
        break;

      case "host":
        if (ts.isObjectLiteralExpression(value)) {
          extractHostMetadata(value, info, sourceFile);
        }
        break;
    }
  }
}

/**
 * Extract host bindings and listeners
 */
function extractHostMetadata(
  obj: ts.ObjectLiteralExpression,
  info: AngularEntityInfo,
  sourceFile: ts.SourceFile,
): void {
  info.hostBindings = [];
  info.hostListeners = [];

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;

    const key = prop.name.getText(sourceFile);
    const value = ts.isStringLiteral(prop.initializer) ? prop.initializer.text : prop.initializer.getText(sourceFile);

    if (key.startsWith("(") && key.endsWith(")")) {
      // Host listener: "(click)": "onClick($event)"
      info.hostListeners.push({
        name: key.slice(1, -1),
        handler: value,
      });
    } else if (key.startsWith("[") && key.endsWith("]")) {
      // Host binding: "[class.active]": "isActive"
      info.hostBindings.push({
        name: key.slice(1, -1),
        expression: value,
      });
    }
  }
}

// =============================================================================
// TEMPLATE PARSING (Regex-based)
// =============================================================================

/**
 * Parse Angular template and extract bindings, events, directives
 * This is a regex-based parser - for full AST use @angular/compiler
 */
export function parseTemplate(template: string): AngularTemplateInfo {
  const info: AngularTemplateInfo = {
    source: template,
    isInline: true,
    propertyBindings: [],
    eventBindings: [],
    twoWayBindings: [],
    structuralDirectives: [],
    interpolations: [],
    templateRefs: [],
    pipeUsages: [],
  };

  const lines = template.split("\n");

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]!; // Safe: iterating within bounds
    const lineNo = lineNum + 1;

    // Property bindings: [property]="expression"
    const propBindingRe = /\[([^\]]+)\]="([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = propBindingRe.exec(line))) {
      info.propertyBindings.push({
        name: match[1] ?? "",
        expression: match[2] ?? "",
        line: lineNo,
      });
    }

    // Event bindings: (event)="handler($event)"
    const eventBindingRe = /\(([^)]+)\)="([^"]+)"/g;
    while ((match = eventBindingRe.exec(line))) {
      info.eventBindings.push({
        name: match[1] ?? "",
        handler: match[2] ?? "",
        line: lineNo,
      });
    }

    // Two-way bindings: [(ngModel)]="property"
    const twoWayRe = /\[\(([^)]+)\)\]="([^"]+)"/g;
    while ((match = twoWayRe.exec(line))) {
      info.twoWayBindings.push({
        name: match[1] ?? "",
        expression: match[2] ?? "",
        line: lineNo,
      });
    }

    // Structural directives: *ngIf="condition", *ngFor="let item of items"
    const structuralRe = /\*(\w+)="([^"]+)"/g;
    while ((match = structuralRe.exec(line))) {
      const directiveName = match[1] ?? "";
      const directiveExpr = match[2] ?? "";
      const directive: StructuralDirective = {
        name: directiveName,
        expression: directiveExpr,
        line: lineNo,
      };

      // Extract variables from ngFor
      if (directiveName === "ngFor") {
        const varMatch = directiveExpr.match(/let\s+(\w+)/g);
        if (varMatch) {
          directive.variables = varMatch.map((v) => v.replace("let ", ""));
        }
      }

      info.structuralDirectives.push(directive);
    }

    // Interpolations: {{ expression }}
    const interpolationRe = /\{\{\s*([^}]+)\s*\}\}/g;
    while ((match = interpolationRe.exec(line))) {
      const interpolationExpr = match[1] ?? "";
      info.interpolations.push({
        expression: interpolationExpr.trim(),
        line: lineNo,
      });

      // Check for pipes in interpolation
      const pipeMatches = interpolationExpr.match(/\|\s*(\w+)(?::([^}|]+))?/g);
      if (pipeMatches) {
        for (const pipeMatch of pipeMatches) {
          const pipeResult = pipeMatch.match(/\|\s*(\w+)(?::(.+))?/);
          if (pipeResult?.[1]) {
            const pipeName = pipeResult[1];
            const pipeArgs = pipeResult[2];
            const parsedArgs = pipeArgs?.split(":").map((a) => a.trim());
            info.pipeUsages.push({
              name: pipeName,
              ...(parsedArgs != null ? { args: parsedArgs } : {}),
              line: lineNo,
            });
          }
        }
      }
    }

    // Template references: #refName
    const templateRefRe = /#(\w+)/g;
    while ((match = templateRefRe.exec(line))) {
      const refName = match[1] ?? "";
      if (refName && !info.templateRefs.includes(refName)) {
        info.templateRefs.push(refName);
      }
    }
  }

  return info;
}

// =============================================================================
// ANGULAR COMPILER INTEGRATION (Optional)
// =============================================================================

// Angular compiler module - loaded dynamically if available
let angularCompilerModule: AngularCompilerModule | null = null;
let compilerLoadAttempted = false;

/**
 * Try to load @angular/compiler if available
 */
export async function loadAngularCompiler(): Promise<boolean> {
  if (compilerLoadAttempted) {
    return angularCompilerModule !== null;
  }

  compilerLoadAttempted = true;

  try {
    // @ts-expect-error - optional dependency, may not be installed
    angularCompilerModule = await import("@angular/compiler");
    log.i("ANGULARPARSER", "compiler_loaded");
    return true;
  } catch {
    log.d("ANGULARPARSER", "no_compiler");
    return false;
  }
}

/**
 * Parse template using @angular/compiler (if available)
 * Provides full AST with accurate binding detection
 */
export async function parseTemplateWithCompiler(template: string, filePath: string): Promise<AngularTemplateInfo> {
  const hasCompiler = await loadAngularCompiler();

  if (!hasCompiler || !angularCompilerModule) {
    return parseTemplate(template);
  }

  // Use @angular/compiler for full template parsing
  try {
    const { parseTemplate: ngParseTemplate } = angularCompilerModule;

    const result = ngParseTemplate(template, filePath, {
      preserveWhitespaces: false,
      preserveLineEndings: false,
    }) as ParseTemplateResult;

    const info: AngularTemplateInfo = {
      source: template,
      isInline: true,
      propertyBindings: [],
      eventBindings: [],
      twoWayBindings: [],
      structuralDirectives: [],
      interpolations: [],
      templateRefs: [],
      pipeUsages: [],
    };

    // Walk the template AST
    function visit(node: AngularASTNode): void {
      if (!node) return;

      // Bound attributes [prop]="expr"
      if (node.constructor?.name === "BoundAttribute") {
        info.propertyBindings.push({
          name: node.name || "",
          expression: node.value?.source || "",
          line: node.sourceSpan?.start?.line,
        });
      }

      // Bound events (event)="handler"
      if (node.constructor?.name === "BoundEvent") {
        info.eventBindings.push({
          name: node.name || "",
          handler: node.handler?.source || "",
          line: node.sourceSpan?.start?.line,
        });
      }

      // Template references #ref
      if (node.constructor?.name === "Reference") {
        info.templateRefs.push(node.name || "");
      }

      // Recurse into children
      if (node.children) {
        for (const child of node.children) {
          visit(child);
        }
      }
      if (node.inputs) {
        for (const input of node.inputs) {
          visit(input);
        }
      }
      if (node.outputs) {
        for (const output of node.outputs) {
          visit(output);
        }
      }
      if (node.references) {
        for (const ref of node.references) {
          visit(ref);
        }
      }
    }

    if (result.nodes) {
      for (const node of result.nodes) {
        visit(node);
      }
    }

    // Parse errors
    if (result.errors && result.errors.length > 0) {
      log.w("ANGULARPARSER", "tpl_errs", { file: filePath, cnt: result.errors.length });
    }

    return info;
  } catch (error) {
    log.w("ANGULARPARSER", "tpl_fail", { err: String(error) });
    return parseTemplate(template);
  }
}

// =============================================================================
// ANGULAR-ENHANCED ENTITY EXTRACTION
// =============================================================================

/**
 * Extract Angular-specific information from TypeScript AST
 * Call this after TypeScript parsing to enhance entities
 */
export function enhanceWithAngularInfo(entities: ParsedEntity[], sourceFile: ts.SourceFile): void {
  function visit(node: ts.Node): void {
    if (ts.isClassDeclaration(node) && node.name) {
      const angularMeta = extractAngularMetadata(node, sourceFile);

      if (angularMeta) {
        // Find corresponding entity
        const entity = entities.find((e) => e.name === node.name!.text && e.type === "class");

        if (entity) {
          // Add Angular-specific metadata
          (entity as ParsedEntityWithAngular).angular = angularMeta;

          // Parse inline template if present
          if (angularMeta.template) {
            const templateInfo = parseTemplate(angularMeta.template);
            (entity as ParsedEntityWithAngular).templateInfo = templateInfo;
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

/**
 * Detect if file is Angular-related based on imports
 */
export function isAngularFile(sourceFile: ts.SourceFile): boolean {
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const moduleSpecifier = statement.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        const moduleName = moduleSpecifier.text;
        if (moduleName.startsWith("@angular/") || moduleName === "angular" || moduleName.includes("/angular/")) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Get all Angular imports from a file
 */
export function getAngularImports(sourceFile: ts.SourceFile): string[] {
  const imports: string[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const moduleSpecifier = statement.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        const moduleName = moduleSpecifier.text;
        if (moduleName.startsWith("@angular/")) {
          imports.push(moduleName);
        }
      }
    }
  }

  return imports;
}

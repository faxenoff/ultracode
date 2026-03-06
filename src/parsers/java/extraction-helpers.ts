/**
 * Java ANTLR Parser Extraction Helpers
 *
 * Helper functions for extracting modifiers, annotations, inheritance,
 * and parameters from Java AST nodes.
 * Extracted from java-antlr-parser.ts for better modularity.
 */

import type {
  ClassModifierContext,
  FieldModifierContext,
  InterfaceMethodModifierContext,
  InterfaceModifierContext,
  MethodModifierContext,
  NormalClassDeclarationContext,
  NormalInterfaceDeclarationContext,
} from "../../generated/java/Java20Parser.js";
import type { AnnotationInfo, InheritanceInfo, LocationInfo, ParameterInfo } from "./types.js";

// =============================================================================
// ANTLR CONTEXT TYPES
// =============================================================================

/**
 * ANTLR Token interface
 */
interface AntlrToken {
  line?: number;
  column?: number;
  start?: number;
  stop?: number;
  text?: string;
}

/**
 * Generic ANTLR context with location info
 */
interface AntlrContext {
  start?: AntlrToken;
  stop?: AntlrToken;
  _start?: AntlrToken;
  _stop?: AntlrToken;
  getText?: () => string;
}

/**
 * ANTLR context with children
 */
interface AntlrContextWithChildren extends AntlrContext {
  children?: AntlrContext[];
}

/**
 * Modifiers context (class/interface/method/field modifiers)
 */
interface ModifiersContext extends AntlrContext {
  classModifier?: () => AntlrContext[];
  interfaceModifier?: () => AntlrContext[];
  methodModifier?: () => AntlrContext[];
  interfaceMethodModifier?: () => AntlrContext[];
  fieldModifier?: () => AntlrContext[];
  constantModifier?: () => AntlrContext[];
  constructorModifier?: () => AntlrContext[];
  annotation?: () => AnnotationContext[];
}

/**
 * Annotation context
 */
interface AnnotationContext extends AntlrContext {
  typeName?: () => AntlrContext;
  elementValuePairList?: () => AntlrContext;
  elementValue?: () => AntlrContext;
}

/**
 * Method declarator context
 */
interface MethodDeclaratorContext extends AntlrContext {
  formalParameterList?: () => FormalParameterListContext;
}

/**
 * Constructor declarator context
 */
interface ConstructorDeclaratorContext extends AntlrContext {
  formalParameterList?: () => FormalParameterListContext;
}

/**
 * Formal parameter list context
 */
interface FormalParameterListContext extends AntlrContext {
  formalParameter?: () => FormalParameterContext[];
  lastFormalParameter?: () => FormalParameterContext;
}

/**
 * Formal parameter context
 */
interface FormalParameterContext extends AntlrContext {
  unannType?: () => AntlrContext;
  variableDeclaratorId?: () => AntlrContext;
  variableModifier?: () => AntlrContext[];
}

// =============================================================================
// LOCATION EXTRACTION
// =============================================================================

/**
 * Extract location information from an AST context
 */
export function getLocation(ctx: unknown): LocationInfo {
  // Type-safe extraction of location from ANTLR context
  const contextObj = ctx as AntlrContext;
  const start = contextObj.start || contextObj._start || { line: 1, column: 0, start: 0 };
  const stop = contextObj.stop || contextObj._stop || start;

  return {
    start: {
      line: start.line || 1,
      column: start.column || 0,
      index: start.start || 0,
    },
    end: {
      line: stop.line || start.line || 1,
      column: (stop.column || 0) + (stop.text?.length || 0),
      index: (stop.stop || start.start || 0) + 1,
    },
  };
}

// =============================================================================
// MODIFIER EXTRACTION
// =============================================================================

/**
 * Generic modifier extraction - filters out annotations
 */
function extractModifiersGeneric(modifiersCtx: ModifiersContext[]): string[] {
  const modifiers: string[] = [];
  if (!modifiersCtx) return modifiers;

  for (const mod of modifiersCtx) {
    const text = mod.getText?.();
    if (text && !text.startsWith("@")) {
      modifiers.push(text);
    }
  }

  return modifiers;
}

/**
 * Extract modifiers from class declaration
 * Accepts ClassModifierContext[] from generated parser
 */
export function extractClassModifiers(modifiersCtx: ClassModifierContext[] | unknown[]): string[] {
  return extractModifiersGeneric(modifiersCtx as ModifiersContext[]);
}

/**
 * Extract modifiers from interface declaration
 * Accepts InterfaceModifierContext[] from generated parser
 */
export function extractInterfaceModifiers(modifiersCtx: InterfaceModifierContext[] | unknown[]): string[] {
  return extractModifiersGeneric(modifiersCtx as ModifiersContext[]);
}

/**
 * Extract modifiers from method declaration
 * Accepts MethodModifierContext[] from generated parser
 */
export function extractMethodModifiers(modifiersCtx: MethodModifierContext[] | unknown[]): string[] {
  return extractModifiersGeneric(modifiersCtx as ModifiersContext[]);
}

/**
 * Extract modifiers from interface method declaration
 * Accepts InterfaceMethodModifierContext[] from generated parser
 */
export function extractInterfaceMethodModifiers(modifiersCtx: InterfaceMethodModifierContext[] | unknown[]): string[] {
  return extractModifiersGeneric(modifiersCtx as ModifiersContext[]);
}

/**
 * Extract modifiers from field declaration
 */
export function extractFieldModifiers(modifiersCtx: unknown[]): string[] {
  return extractModifiersGeneric(modifiersCtx as ModifiersContext[]);
}

/**
 * Extract modifiers from constructor declaration
 */
export function extractConstructorModifiers(modifiersCtx: unknown[]): string[] {
  return extractModifiersGeneric(modifiersCtx as ModifiersContext[]);
}

/**
 * Extract modifiers from constant declaration
 */
export function extractConstantModifiers(modifiersCtx: unknown[]): string[] {
  return extractModifiersGeneric(modifiersCtx as ModifiersContext[]);
}

// =============================================================================
// ANNOTATION EXTRACTION
// =============================================================================

/**
 * Extract annotations from class/enum/record modifiers
 * Accepts ClassModifierContext[] or other modifier contexts from generated parser
 */
export function extractAnnotations(modifiersCtx: ClassModifierContext[] | unknown[]): AnnotationInfo[] {
  const annotations: AnnotationInfo[] = [];
  if (!modifiersCtx) return annotations;

  for (const modItem of modifiersCtx) {
    const mod = modItem as ModifiersContext;
    const annotationList = mod.annotation?.();
    if (annotationList && Array.isArray(annotationList)) {
      for (const annotation of annotationList) {
        const normalAnnotation = (annotation as unknown as { normalAnnotation?: () => unknown }).normalAnnotation?.();
        const markerAnnotation = (annotation as unknown as { markerAnnotation?: () => unknown }).markerAnnotation?.();
        const singleElementAnnotation = (
          annotation as unknown as { singleElementAnnotation?: () => unknown }
        ).singleElementAnnotation?.();

        let name = "";
        let args: string[] | undefined;

        if (normalAnnotation) {
          const typeName = (
            normalAnnotation as unknown as { typeName?: () => { getText?: () => string } }
          ).typeName?.();
          name = typeName?.getText?.() || "";
          const elementValuePairList = (
            normalAnnotation as unknown as { elementValuePairList?: () => { getText?: () => string } }
          ).elementValuePairList?.();
          const elementValuePairs = elementValuePairList?.getText?.();
          if (elementValuePairs) {
            args = [elementValuePairs];
          }
        } else if (markerAnnotation) {
          const typeName = (
            markerAnnotation as unknown as { typeName?: () => { getText?: () => string } }
          ).typeName?.();
          name = typeName?.getText?.() || "";
        } else if (singleElementAnnotation) {
          const typeName = (
            singleElementAnnotation as unknown as { typeName?: () => { getText?: () => string } }
          ).typeName?.();
          name = typeName?.getText?.() || "";
          const elementValue = (
            singleElementAnnotation as unknown as { elementValue?: () => { getText?: () => string } }
          ).elementValue?.();
          const elementValueText = elementValue?.getText?.();
          if (elementValueText) {
            args = [elementValueText];
          }
        }

        if (name) {
          annotations.push({ name, ...(args != null ? { arguments: args } : {}) });
        }
      }
    }
  }

  return annotations;
}

/**
 * Extract annotations from interface modifiers
 */
export function extractAnnotationsFromInterfaceModifiers(
  modifiersCtx: InterfaceModifierContext[] | unknown[],
): AnnotationInfo[] {
  return extractAnnotations(modifiersCtx as ModifiersContext[]);
}

/**
 * Extract annotations from method modifiers
 */
export function extractAnnotationsFromMethodModifiers(
  modifiersCtx: MethodModifierContext[] | unknown[],
): AnnotationInfo[] {
  return extractAnnotations(modifiersCtx as ModifiersContext[]);
}

/**
 * Extract annotations from field modifiers
 */
export function extractAnnotationsFromFieldModifiers(
  modifiersCtx: FieldModifierContext[] | unknown[],
): AnnotationInfo[] {
  return extractAnnotations(modifiersCtx as ModifiersContext[]);
}

// =============================================================================
// INHERITANCE EXTRACTION
// =============================================================================

/**
 * Extract inheritance (extends/implements) from class declaration
 */
export function extractClassInheritance(classDecl: NormalClassDeclarationContext): InheritanceInfo {
  const result: InheritanceInfo = { baseClasses: [], interfaces: [] };

  // Extract extends
  const classExtends = classDecl.classExtends();
  if (classExtends) {
    const classType = classExtends.classType();
    if (classType) {
      result.baseClasses.push(classType.getText());
    }
  }

  // Extract implements
  const classImplements = classDecl.classImplements();
  if (classImplements) {
    const interfaceList = classImplements.interfaceTypeList();
    if (interfaceList) {
      for (const interfaceType of interfaceList.interfaceType()) {
        result.interfaces.push(interfaceType.getText());
      }
    }
  }

  return result;
}

/**
 * Extract inheritance (extends) from interface declaration
 */
export function extractInterfaceInheritance(interfaceDecl: NormalInterfaceDeclarationContext): {
  interfaces: string[];
} {
  const result = { interfaces: [] as string[] };

  const interfaceExtends = interfaceDecl.interfaceExtends();
  if (interfaceExtends) {
    const interfaceList = interfaceExtends.interfaceTypeList();
    if (interfaceList) {
      for (const interfaceType of interfaceList.interfaceType()) {
        result.interfaces.push(interfaceType.getText());
      }
    }
  }

  return result;
}

// =============================================================================
// PARAMETER EXTRACTION
// =============================================================================

/**
 * Extract parameters from method declarator
 */
export function extractMethodParameters(methodDeclarator: unknown): ParameterInfo[] {
  const params: ParameterInfo[] = [];
  const declarator = methodDeclarator as MethodDeclaratorContext;

  const formalParameterList = declarator.formalParameterList?.();
  if (!formalParameterList) return params;

  // Regular parameters
  const formalParams = formalParameterList.formalParameter?.() || [];
  for (const param of formalParams) {
    const varDeclId = param.variableDeclaratorId?.();
    const unannType = param.unannType?.();

    if (varDeclId) {
      const identifier = (varDeclId as unknown as { identifier?: () => { getText?: () => string } }).identifier?.();
      if (identifier) {
        params.push({
          name: identifier.getText?.() || "",
          type: unannType?.getText?.() || undefined,
        });
      }
    }
  }

  // Varargs parameter
  const varArgsParam = (
    formalParameterList as unknown as { variableArityParameter?: () => unknown }
  ).variableArityParameter?.();
  if (varArgsParam) {
    const identifier = (varArgsParam as unknown as { identifier?: () => { getText?: () => string } }).identifier?.();
    const unannType = (varArgsParam as unknown as { unannType?: () => { getText?: () => string } }).unannType?.();

    if (identifier) {
      params.push({
        name: identifier.getText?.() || "",
        type: unannType ? (unannType.getText?.() || "") + "..." : undefined,
      });
    }
  }

  return params;
}

/**
 * Extract parameters from constructor declarator
 */
export function extractConstructorParameters(declaratorInput: unknown): ParameterInfo[] {
  const params: ParameterInfo[] = [];
  const declarator = declaratorInput as ConstructorDeclaratorContext;

  const formalParameterList = declarator.formalParameterList?.();
  if (!formalParameterList) return params;

  // Regular parameters
  const formalParams = formalParameterList.formalParameter?.() || [];
  for (const param of formalParams) {
    const varDeclId = param.variableDeclaratorId?.();
    const unannType = param.unannType?.();

    if (varDeclId) {
      const identifier = (varDeclId as unknown as { identifier?: () => { getText?: () => string } }).identifier?.();
      if (identifier) {
        params.push({
          name: identifier.getText?.() || "",
          type: unannType?.getText?.() || undefined,
        });
      }
    }
  }

  return params;
}

// =============================================================================
// CALL EXTRACTION
// =============================================================================

/**
 * Java keywords to exclude from call extraction
 */
const JAVA_KEYWORDS = new Set([
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "return",
  "throw",
  "try",
  "catch",
  "finally",
  "new",
  "instanceof",
  "synchronized",
  "assert",
]);

/**
 * Extract method calls from method body
 */
export function extractCalls(bodyCtx: unknown): string[] {
  if (!bodyCtx) return [];

  const body = bodyCtx as AntlrContextWithChildren;
  const calls: string[] = [];
  const text = body.getText?.() || "";

  // Simple regex extraction
  const callRe = /(\w+)\s*\(/g;
  let match: RegExpExecArray | null;

  while ((match = callRe.exec(text))) {
    const callName = match[1];
    if (callName && !JAVA_KEYWORDS.has(callName)) {
      calls.push(callName);
    }
  }

  return Array.from(new Set(calls));
}

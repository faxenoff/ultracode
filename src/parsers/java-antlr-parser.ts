/**
 * Java ANTLR Parser
 *
 * Extracts ParsedEntity and EntityRelationship from Java source code
 * using the official Java20 grammar via ANTLR4.
 *
 * This provides accurate AST-based parsing instead of regex-based parsing.
 *
 * Enhanced with modular extractors:
 * - AST-aware call extraction (vs regex)
 * - JavaDoc documentation extraction
 * - Control flow analysis
 * - Complexity metrics
 * - Framework patterns (Spring, JPA, Lombok)
 */

import { CharStream, CommonTokenStream, PredictionMode } from "antlr4ng";
import { Java20Lexer } from "../generated/java/Java20Lexer.js";
import {
  type AnnotationInterfaceDeclarationContext,
  type ClassMemberDeclarationContext,
  type ConstantDeclarationContext,
  type ConstructorDeclarationContext,
  type EnumConstantContext,
  type EnumDeclarationContext,
  type FieldDeclarationContext,
  type ImportDeclarationContext,
  type InterfaceMemberDeclarationContext,
  type InterfaceMethodDeclarationContext,
  Java20Parser,
  type MethodDeclarationContext,
  type NormalClassDeclarationContext,
  type NormalInterfaceDeclarationContext,
  type OrdinaryCompilationUnitContext,
  type RecordComponentContext,
  type RecordDeclarationContext,
  type Start_Context,
} from "../generated/java/Java20Parser.js";
import { log } from "../logging/index.js";
import type { EntityRelationship, ParsedEntity } from "../types/parser.js";

// Import legacy extraction helpers (for backward compatibility)
import {
  extractAnnotations,
  extractAnnotationsFromFieldModifiers,
  extractAnnotationsFromInterfaceModifiers,
  extractAnnotationsFromMethodModifiers,
  extractClassInheritance,
  extractClassModifiers,
  extractConstantModifiers,
  extractConstructorModifiers,
  extractConstructorParameters,
  extractFieldModifiers,
  extractInterfaceInheritance,
  extractInterfaceMethodModifiers,
  extractInterfaceModifiers,
  extractMethodModifiers,
  extractMethodParameters,
  getLocation,
} from "./java/extraction-helpers.js";
// Import new modular extractors
// Use unified extractor for single-pass extraction (40-50% faster)
import { extractUnified } from "./java/extractors/unified-extractor.js";
import type { ParserContext } from "./java/types.js";

// Re-export types for backward compatibility
export type { AnnotationInfo, InheritanceInfo, LocationInfo, ParameterInfo, ParserContext } from "./java/types.js";

// =============================================================================
// MAIN PARSER CLASS
// =============================================================================

export class JavaAntlrParser {
  /**
   * Parse Java source code and extract entities/relationships
   */
  static parse(filePath: string, content: string): { entities: ParsedEntity[]; relationships: EntityRelationship[] } {
    const ctx: ParserContext = {
      filePath,
      packageName: "",
      entities: [],
      relationships: [],
      currentClass: null,
      imports: new Map(),
    };

    try {
      const inputStream = CharStream.fromString(content);
      const lexer = new Java20Lexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new Java20Parser(tokenStream);

      // Disable error output for cleaner processing
      parser.removeErrorListeners();

      // OPTIMIZATION: Use SLL mode first (15-20% faster), fallback to ALL(*) on ambiguity
      // SLL works for ~95% of valid Java code
      let tree: Start_Context;
      const interpreter = parser.interpreter;
      if (interpreter) {
        try {
          interpreter.predictionMode = PredictionMode.SLL;
          tree = parser.start_();
        } catch (_sllError) {
          // SLL failed, reset and use ALL(*)
          tokenStream.seek(0);
          parser.reset();
          interpreter.predictionMode = PredictionMode.LL;
          tree = parser.start_();
        }
      } else {
        tree = parser.start_();
      }

      const compilationUnit = tree.compilationUnit();

      if (compilationUnit) {
        const ordinary = compilationUnit.ordinaryCompilationUnit();
        if (ordinary) {
          processOrdinaryCompilationUnit(ordinary, ctx);
        }
      }
    } catch (error) {
      log.e("JAVAANTLR", "parse_err", { file: filePath, err: String(error) });
    }

    // Log relationship stats for debugging
    const callsCount = ctx.relationships.filter((r) => r.type === "calls").length;
    const totalRels = ctx.relationships.length;
    if (totalRels > 0) {
      log.d("JAVAANTLR", "parse_done", {
        file: filePath.split(/[/\\]/).pop(),
        entities: ctx.entities.length,
        rels: totalRels,
        calls: callsCount,
      });
    }

    return {
      entities: ctx.entities,
      relationships: ctx.relationships,
    };
  }
}

// =============================================================================
// AST PROCESSING FUNCTIONS
// =============================================================================

function processOrdinaryCompilationUnit(tree: OrdinaryCompilationUnitContext, ctx: ParserContext): void {
  // Process package declaration first to get package name
  const packageDecl = tree.packageDeclaration();
  if (packageDecl) {
    // Package name is composed of identifiers separated by dots
    const identifiers = packageDecl.identifier();
    if (identifiers.length > 0) {
      ctx.packageName = identifiers.map((id) => id.getText()).join(".");
    }
  }

  // Create module entity with package name (if present) or filename
  ctx.entities.push({
    name: ctx.packageName || ctx.filePath.split(/[/\\]/).pop() || "module",
    type: "module",
    filePath: ctx.filePath,
    location: getLocation(tree),
  });

  // Process imports
  const imports = tree.importDeclaration();
  for (const imp of imports) {
    processImport(imp, ctx);
  }

  // Process top-level declarations
  const topLevelDecls = tree.topLevelClassOrInterfaceDeclaration();
  for (const topLevel of topLevelDecls) {
    const classDecl = topLevel.classDeclaration();
    if (classDecl) {
      const normalClass = classDecl.normalClassDeclaration();
      if (normalClass) {
        processNormalClassDeclaration(normalClass, ctx);
        continue;
      }

      const enumDecl = classDecl.enumDeclaration();
      if (enumDecl) {
        processEnumDeclaration(enumDecl, ctx);
        continue;
      }

      const recordDecl = classDecl.recordDeclaration();
      if (recordDecl) {
        processRecordDeclaration(recordDecl, ctx);
        continue;
      }
    }

    const interfaceDecl = topLevel.interfaceDeclaration();
    if (interfaceDecl) {
      const normalInterface = interfaceDecl.normalInterfaceDeclaration();
      if (normalInterface) {
        processNormalInterfaceDeclaration(normalInterface, ctx);
        continue;
      }

      const annotationInterface = interfaceDecl.annotationInterfaceDeclaration();
      if (annotationInterface) {
        processAnnotationInterfaceDeclaration(annotationInterface, ctx);
      }
    }
  }
}

function processImport(importDecl: ImportDeclarationContext, ctx: ParserContext): void {
  const singleType = importDecl.singleTypeImportDeclaration();
  const typeOnDemand = importDecl.typeImportOnDemandDeclaration();
  const singleStatic = importDecl.singleStaticImportDeclaration();
  const staticOnDemand = importDecl.staticImportOnDemandDeclaration();

  let importPath = "";
  let isStatic = false;
  let isWildcard = false;

  if (singleType) {
    const typeName = singleType.typeName();
    if (typeName) {
      importPath = typeName.getText();
    }
  } else if (typeOnDemand) {
    const packageOrType = typeOnDemand.packageOrTypeName();
    if (packageOrType) {
      importPath = packageOrType.getText() + ".*";
      isWildcard = true;
    }
  } else if (singleStatic) {
    const typeName = singleStatic.typeName();
    const identifier = singleStatic.identifier();
    if (typeName && identifier) {
      importPath = typeName.getText() + "." + identifier.getText();
      isStatic = true;
    }
  } else if (staticOnDemand) {
    const typeName = staticOnDemand.typeName();
    if (typeName) {
      importPath = typeName.getText() + ".*";
      isStatic = true;
      isWildcard = true;
    }
  }

  if (!importPath) return;

  // Store import mapping
  const parts = importPath.replace(".*", "").split(".");
  const simpleName = parts[parts.length - 1];
  if (!isWildcard && simpleName) {
    ctx.imports.set(simpleName, importPath);
  }

  // Create import entity
  ctx.entities.push({
    name: importPath,
    type: "import",
    filePath: ctx.filePath,
    location: getLocation(importDecl),
    metadata: {
      importData: {
        source: importPath,
        specifiers: [],
        isDefault: false,
        isNamespace: isWildcard,
      },
    },
    modifiers: isStatic ? ["static"] : undefined,
  });

  // Create imports relationship
  ctx.relationships.push({
    from: ctx.filePath,
    to: importPath,
    type: "imports",
    metadata: { isStatic, isWildcard },
  });
}

// =============================================================================
// CLASS PROCESSING
// =============================================================================

function processNormalClassDeclaration(classDecl: NormalClassDeclarationContext, ctx: ParserContext): void {
  const typeIdentifier = classDecl.typeIdentifier();
  if (!typeIdentifier) return;

  const className = typeIdentifier.getText();
  const location = getLocation(classDecl);
  const modifiers = extractClassModifiers(classDecl.classModifier());
  const annotations = extractAnnotations(classDecl.classModifier());

  // Extract inheritance
  const inheritance = extractClassInheritance(classDecl);

  // Create entity
  const entity: ParsedEntity = {
    name: className,
    type: "class",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers: modifiers }),
    inheritance: inheritance.baseClasses.length > 0 || inheritance.interfaces.length > 0 ? inheritance : undefined,
    ...(annotations.length > 0 && { decorators: annotations }),
    children: [],
  };

  ctx.entities.push(entity);

  // Create inheritance relationships
  for (const base of inheritance.baseClasses) {
    ctx.relationships.push({
      from: className,
      to: base,
      type: "inherits",
      metadata: { line: location.start.line },
    });
  }

  for (const iface of inheritance.interfaces) {
    ctx.relationships.push({
      from: className,
      to: iface,
      type: "implements",
      metadata: { line: location.start.line },
    });
  }

  // Create decorates relationships
  for (const ann of annotations) {
    ctx.relationships.push({
      from: ann.name,
      to: className,
      type: "decorates",
      metadata: { line: location.start.line, arguments: ann.arguments },
    });
  }

  // Process class body
  const prevClass = ctx.currentClass;
  ctx.currentClass = className;

  const classBody = classDecl.classBody();
  if (classBody) {
    const bodyDecls = classBody.classBodyDeclaration();
    for (const bodyDecl of bodyDecls) {
      const memberDecl = bodyDecl.classMemberDeclaration();
      if (memberDecl) {
        processClassMemberDeclaration(memberDecl, ctx);
      }

      const constructorDecl = bodyDecl.constructorDeclaration();
      if (constructorDecl) {
        processConstructorDeclaration(constructorDecl, ctx);
      }
    }
  }

  ctx.currentClass = prevClass;
}

function processClassMemberDeclaration(memberDecl: ClassMemberDeclarationContext, ctx: ParserContext): void {
  const fieldDecl = memberDecl.fieldDeclaration?.();
  if (fieldDecl) {
    processFieldDeclaration(fieldDecl, ctx);
    return;
  }

  const methodDecl = memberDecl.methodDeclaration?.();
  if (methodDecl) {
    processMethodDeclaration(methodDecl, ctx);
    return;
  }

  const classDecl = memberDecl.classDeclaration?.();
  if (classDecl) {
    const normalClass = classDecl.normalClassDeclaration?.();
    if (normalClass) {
      processNormalClassDeclaration(normalClass, ctx);
      return;
    }

    const enumDecl = classDecl.enumDeclaration?.();
    if (enumDecl) {
      processEnumDeclaration(enumDecl, ctx);
      return;
    }

    const recordDecl = classDecl.recordDeclaration?.();
    if (recordDecl) {
      processRecordDeclaration(recordDecl, ctx);
      return;
    }
  }

  const interfaceDecl = memberDecl.interfaceDeclaration?.();
  if (interfaceDecl) {
    const normalInterface = interfaceDecl.normalInterfaceDeclaration?.();
    if (normalInterface) {
      processNormalInterfaceDeclaration(normalInterface, ctx);
      return;
    }
  }
}

// =============================================================================
// INTERFACE PROCESSING
// =============================================================================

function processNormalInterfaceDeclaration(interfaceDecl: NormalInterfaceDeclarationContext, ctx: ParserContext): void {
  const typeIdentifier = interfaceDecl.typeIdentifier();
  if (!typeIdentifier) return;

  const interfaceName = typeIdentifier.getText();
  const location = getLocation(interfaceDecl);
  const modifiers = extractInterfaceModifiers(interfaceDecl.interfaceModifier());
  const annotations = extractAnnotationsFromInterfaceModifiers(interfaceDecl.interfaceModifier());

  // Extract inheritance (extends)
  const inheritance = extractInterfaceInheritance(interfaceDecl);

  // Create entity
  const entity: ParsedEntity = {
    name: interfaceName,
    type: "interface",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers: modifiers }),
    inheritance:
      inheritance.interfaces.length > 0 ? { baseClasses: [], interfaces: inheritance.interfaces } : undefined,
    ...(annotations.length > 0 && { decorators: annotations }),
    children: [],
  };

  ctx.entities.push(entity);

  // Create extends relationships
  for (const iface of inheritance.interfaces) {
    ctx.relationships.push({
      from: interfaceName,
      to: iface,
      type: "inherits",
      metadata: { line: location.start.line },
    });
  }

  // Process interface body
  const prevClass = ctx.currentClass;
  ctx.currentClass = interfaceName;

  const interfaceBody = interfaceDecl.interfaceBody();
  if (interfaceBody) {
    const memberDecls = interfaceBody.interfaceMemberDeclaration();
    for (const memberDecl of memberDecls) {
      processInterfaceMemberDeclaration(memberDecl, ctx);
    }
  }

  ctx.currentClass = prevClass;
}

function processInterfaceMemberDeclaration(memberDecl: InterfaceMemberDeclarationContext, ctx: ParserContext): void {
  const constantDecl = memberDecl.constantDeclaration?.();
  if (constantDecl) {
    processConstantDeclaration(constantDecl, ctx);
    return;
  }

  const methodDecl = memberDecl.interfaceMethodDeclaration?.();
  if (methodDecl) {
    processInterfaceMethodDeclaration(methodDecl, ctx);
    return;
  }

  const classDecl = memberDecl.classDeclaration?.();
  if (classDecl) {
    const normalClass = classDecl.normalClassDeclaration?.();
    if (normalClass) {
      processNormalClassDeclaration(normalClass, ctx);
    }
  }

  const interfaceDecl = memberDecl.interfaceDeclaration?.();
  if (interfaceDecl) {
    const normalInterface = interfaceDecl.normalInterfaceDeclaration?.();
    if (normalInterface) {
      processNormalInterfaceDeclaration(normalInterface, ctx);
    }
  }
}

function processAnnotationInterfaceDeclaration(
  annotationDecl: AnnotationInterfaceDeclarationContext,
  ctx: ParserContext,
): void {
  const typeIdentifier = annotationDecl.typeIdentifier();
  if (!typeIdentifier) return;

  const annotationName = typeIdentifier.getText();
  const location = getLocation(annotationDecl);
  const modifiers = extractInterfaceModifiers(annotationDecl.interfaceModifier());

  ctx.entities.push({
    name: annotationName,
    type: "interface",
    filePath: ctx.filePath,
    location,
    modifiers: [...modifiers, "annotation"],
  });
}

// =============================================================================
// ENUM PROCESSING
// =============================================================================

function processEnumDeclaration(enumDecl: EnumDeclarationContext, ctx: ParserContext): void {
  const typeIdentifier = enumDecl.typeIdentifier();
  if (!typeIdentifier) return;

  const enumName = typeIdentifier.getText();
  const location = getLocation(enumDecl);
  const modifiers = extractClassModifiers(enumDecl.classModifier());
  const annotations = extractAnnotations(enumDecl.classModifier());

  // Extract implements
  const interfaces: string[] = [];
  const classImplements = enumDecl.classImplements();
  if (classImplements) {
    const interfaceList = classImplements.interfaceTypeList();
    if (interfaceList) {
      for (const interfaceType of interfaceList.interfaceType()) {
        interfaces.push(interfaceType.getText());
      }
    }
  }

  ctx.entities.push({
    name: enumName,
    type: "enum",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers: modifiers }),
    inheritance: interfaces.length > 0 ? { baseClasses: [], interfaces } : undefined,
    ...(annotations.length > 0 && { decorators: annotations }),
  });

  // Create implements relationships
  for (const iface of interfaces) {
    ctx.relationships.push({
      from: enumName,
      to: iface,
      type: "implements",
      metadata: { line: location.start.line },
    });
  }

  // Process enum body
  const prevClass = ctx.currentClass;
  ctx.currentClass = enumName;

  const enumBody = enumDecl.enumBody();
  if (enumBody) {
    // Process enum constants
    const enumConstantList = enumBody.enumConstantList();
    if (enumConstantList) {
      for (const enumConstant of enumConstantList.enumConstant()) {
        processEnumConstant(enumConstant, ctx);
      }
    }

    // Process enum body declarations (methods, fields)
    const enumBodyDecls = enumBody.enumBodyDeclarations();
    if (enumBodyDecls) {
      const classBodyDecls = enumBodyDecls.classBodyDeclaration();
      for (const bodyDecl of classBodyDecls) {
        const memberDecl = bodyDecl.classMemberDeclaration?.();
        if (memberDecl) {
          processClassMemberDeclaration(memberDecl, ctx);
        }

        const constructorDecl = bodyDecl.constructorDeclaration?.();
        if (constructorDecl) {
          processConstructorDeclaration(constructorDecl, ctx);
        }
      }
    }
  }

  ctx.currentClass = prevClass;
}

function processEnumConstant(enumConstant: EnumConstantContext, ctx: ParserContext): void {
  const identifier = enumConstant.identifier();
  if (!identifier) return;

  const constantName = identifier.getText();

  ctx.entities.push({
    name: constantName,
    type: "enum_variant",
    filePath: ctx.filePath,
    location: getLocation(enumConstant),
  });

  if (ctx.currentClass) {
    ctx.relationships.push({
      from: ctx.currentClass,
      to: constantName,
      type: "contains",
      metadata: {},
    });
  }
}

// =============================================================================
// RECORD PROCESSING
// =============================================================================

function processRecordDeclaration(recordDecl: RecordDeclarationContext, ctx: ParserContext): void {
  const typeIdentifier = recordDecl.typeIdentifier();
  if (!typeIdentifier) return;

  const recordName = typeIdentifier.getText();
  const location = getLocation(recordDecl);
  const modifiers = extractClassModifiers(recordDecl.classModifier());
  const annotations = extractAnnotations(recordDecl.classModifier());

  // Extract implements
  const interfaces: string[] = [];
  const classImplements = recordDecl.classImplements();
  if (classImplements) {
    const interfaceList = classImplements.interfaceTypeList();
    if (interfaceList) {
      for (const interfaceType of interfaceList.interfaceType()) {
        interfaces.push(interfaceType.getText());
      }
    }
  }

  // Extract record components (parameters)
  const params: Array<{ name: string; type?: string }> = [];
  const recordHeader = recordDecl.recordHeader();
  if (recordHeader) {
    const componentList = recordHeader.recordComponentList();
    if (componentList) {
      for (const component of componentList.recordComponent()) {
        processRecordComponent(component, params);
      }
    }
  }

  ctx.entities.push({
    name: recordName,
    type: "class",
    filePath: ctx.filePath,
    location,
    modifiers: [...modifiers, "record"],
    ...(params.length > 0 && { parameters: params }),
    inheritance: interfaces.length > 0 ? { baseClasses: [], interfaces } : undefined,
    ...(annotations.length > 0 && { decorators: annotations }),
  });

  // Process record body
  const prevClass = ctx.currentClass;
  ctx.currentClass = recordName;

  const recordBody = recordDecl.recordBody();
  if (recordBody) {
    const bodyDecls = recordBody.recordBodyDeclaration();
    for (const bodyDecl of bodyDecls) {
      const memberDecl = bodyDecl.classBodyDeclaration?.();
      if (memberDecl) {
        const classMember = memberDecl.classMemberDeclaration?.();
        if (classMember) {
          processClassMemberDeclaration(classMember, ctx);
        }
      }
    }
  }

  ctx.currentClass = prevClass;
}

function processRecordComponent(
  component: RecordComponentContext,
  params: Array<{ name: string; type?: string }>,
): void {
  const identifier = component.identifier();
  const unannType = component.unannType();

  if (identifier) {
    const typeText = unannType?.getText();
    params.push({
      name: identifier.getText(),
      ...(typeText ? { type: typeText } : {}),
    });
  }
}

// =============================================================================
// METHOD PROCESSING
// =============================================================================

function processMethodDeclaration(methodDecl: MethodDeclarationContext, ctx: ParserContext): void {
  const methodHeader = methodDecl.methodHeader();
  if (!methodHeader) return;

  const methodDeclarator = methodHeader.methodDeclarator();
  if (!methodDeclarator) return;

  const identifier = methodDeclarator.identifier();
  if (!identifier) return;

  const methodName = identifier.getText();
  const location = getLocation(methodDecl);
  const modifiers = extractMethodModifiers(methodDecl.methodModifier());
  const annotations = extractAnnotationsFromMethodModifiers(methodDecl.methodModifier());

  // Extract return type
  const result = methodHeader.result();
  const returnType = result?.getText();

  // Extract parameters
  const params = extractMethodParameters(methodDeclarator);

  // Extract throws
  const throwsClause = methodHeader.throwsT?.();
  const throwsTypes: string[] = [];
  if (throwsClause) {
    const exceptionList = throwsClause.exceptionTypeList?.();
    if (exceptionList) {
      for (const exc of exceptionList.exceptionType?.() || []) {
        throwsTypes.push(exc.getText());
      }
    }
  }

  const fullName = ctx.currentClass ? `${ctx.currentClass}.${methodName}` : methodName;

  // Extract method body for analysis
  const methodBody = methodDecl.methodBody();
  const block = methodBody?.block?.();

  // OPTIMIZATION: Single-pass unified extraction (40-50% faster than 3 separate passes)
  // Extracts calls, control flow, and complexity in ONE AST traversal
  const unified = block ? extractUnified(block) : null;
  const controlFlow = unified?.controlFlow;
  const complexity = unified?.complexity;

  // Build metadata object
  const metadata: Record<string, unknown> = {};
  if (throwsTypes.length > 0) {
    metadata["throws"] = throwsTypes;
  }
  if (
    controlFlow &&
    (controlFlow.branches.length > 0 || controlFlow.loops.length > 0 || controlFlow.exceptions.length > 0)
  ) {
    metadata["controlFlow"] = controlFlow;
  }
  if (complexity) {
    metadata["complexity"] = complexity;
  }

  const entity: ParsedEntity = {
    name: fullName,
    type: "method",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers: modifiers }),
    ...(params.length > 0 && { parameters: params }),
    returnType: returnType !== "void" ? returnType : undefined,
    ...(annotations.length > 0 && { decorators: annotations }),
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };

  // Set parameter count for complexity
  if (complexity) {
    complexity.parameterCount = params.length;
  }

  ctx.entities.push(entity);

  // Create relationships
  if (ctx.currentClass) {
    ctx.relationships.push({
      from: ctx.currentClass,
      to: fullName,
      type: "contains",
      metadata: {},
    });
  }

  for (const ann of annotations) {
    ctx.relationships.push({
      from: ann.name,
      to: fullName,
      type: "decorates",
      metadata: { line: location.start.line, arguments: ann.arguments },
    });
  }

  // Check for Override annotation
  if (annotations.some((a) => a.name === "Override")) {
    ctx.relationships.push({
      from: fullName,
      to: `*.${methodName}`,
      type: "overrides",
      metadata: { line: location.start.line },
    });
  }

  // Use calls from unified extraction (already computed, no extra traversal)
  if (unified) {
    for (const call of unified.calls) {
      const callTarget = call.target ? `${call.target}.${call.name}` : call.name;
      ctx.relationships.push({
        from: fullName,
        to: callTarget,
        type: "calls",
        metadata: {
          argumentCount: call.argumentCount,
          isNew: call.isNew,
          ...(call.typeArguments && call.typeArguments.length > 0 && { typeArguments: call.typeArguments }),
        },
      });
    }
  }
}

function processInterfaceMethodDeclaration(methodDecl: InterfaceMethodDeclarationContext, ctx: ParserContext): void {
  const methodHeader = methodDecl.methodHeader();
  if (!methodHeader) return;

  const methodDeclarator = methodHeader.methodDeclarator();
  if (!methodDeclarator) return;

  const identifier = methodDeclarator.identifier();
  if (!identifier) return;

  const methodName = identifier.getText();
  const location = getLocation(methodDecl);
  const modifiers = extractInterfaceMethodModifiers(methodDecl.interfaceMethodModifier());

  // Extract return type
  const result = methodHeader.result();
  const returnType = result?.getText();

  // Extract parameters
  const params = extractMethodParameters(methodDeclarator);

  const fullName = ctx.currentClass ? `${ctx.currentClass}.${methodName}` : methodName;

  ctx.entities.push({
    name: fullName,
    type: "method",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers: modifiers }),
    ...(params.length > 0 && { parameters: params }),
    returnType: returnType !== "void" ? returnType : undefined,
  });

  if (ctx.currentClass) {
    ctx.relationships.push({
      from: ctx.currentClass,
      to: fullName,
      type: "contains",
      metadata: {},
    });
  }
}

function processConstructorDeclaration(constructorDecl: ConstructorDeclarationContext, ctx: ParserContext): void {
  const declarator = constructorDecl.constructorDeclarator();
  if (!declarator) return;

  const location = getLocation(constructorDecl);
  const modifiers = extractConstructorModifiers(constructorDecl.constructorModifier());

  // Extract parameters
  const params = extractConstructorParameters(declarator);

  const fullName = ctx.currentClass ? `${ctx.currentClass}.${ctx.currentClass}` : "constructor";

  ctx.entities.push({
    name: fullName,
    type: "method",
    filePath: ctx.filePath,
    location,
    modifiers: [...modifiers, "constructor"],
    ...(params.length > 0 && { parameters: params }),
  });

  if (ctx.currentClass) {
    ctx.relationships.push({
      from: ctx.currentClass,
      to: fullName,
      type: "contains",
      metadata: {},
    });
  }
}

// =============================================================================
// FIELD PROCESSING
// =============================================================================

function processFieldDeclaration(fieldDecl: FieldDeclarationContext, ctx: ParserContext): void {
  const modifiers = extractFieldModifiers(fieldDecl.fieldModifier());
  const annotations = extractAnnotationsFromFieldModifiers(fieldDecl.fieldModifier());

  // Extract type
  const unannType = fieldDecl.unannType();
  const fieldType = unannType?.getText();

  // Extract variable declarators
  const variableDeclaratorList = fieldDecl.variableDeclaratorList();
  if (!variableDeclaratorList) return;

  for (const varDecl of variableDeclaratorList.variableDeclarator()) {
    const varDeclId = varDecl.variableDeclaratorId();
    if (!varDeclId) continue;

    const identifier = varDeclId.identifier();
    if (!identifier) continue;

    const fieldName = identifier.getText();
    const isConstant = modifiers.includes("final") && modifiers.includes("static");

    const fullName = ctx.currentClass ? `${ctx.currentClass}.${fieldName}` : fieldName;

    ctx.entities.push({
      name: fullName,
      type: isConstant ? "constant" : "property",
      filePath: ctx.filePath,
      location: getLocation(varDecl),
      ...(modifiers.length > 0 && { modifiers: modifiers }),
      metadata: fieldType ? { propertyType: fieldType } : undefined,
      ...(annotations.length > 0 && { decorators: annotations }),
    });

    if (ctx.currentClass) {
      ctx.relationships.push({
        from: ctx.currentClass,
        to: fullName,
        type: "contains",
        metadata: {},
      });
    }

    if (fieldType) {
      const baseType = fieldType.replace(/<.*>/, "").replace(/\[\]/, "");
      ctx.relationships.push({
        from: fullName,
        to: baseType,
        type: "references",
        metadata: { referenceKind: "field" },
      });
    }
  }
}

function processConstantDeclaration(constantDecl: ConstantDeclarationContext, ctx: ParserContext): void {
  const modifiers = extractConstantModifiers(constantDecl.constantModifier?.());

  // Extract type
  const unannType = constantDecl.unannType?.();
  const fieldType = unannType?.getText();

  // Extract variable declarators
  const variableDeclaratorList = constantDecl.variableDeclaratorList?.();
  if (!variableDeclaratorList) return;

  for (const varDecl of variableDeclaratorList.variableDeclarator?.() || []) {
    const varDeclId = varDecl.variableDeclaratorId?.();
    if (!varDeclId) continue;

    const identifier = varDeclId.identifier?.();
    if (!identifier) continue;

    const constantName = identifier.getText();

    const fullName = ctx.currentClass ? `${ctx.currentClass}.${constantName}` : constantName;

    ctx.entities.push({
      name: fullName,
      type: "constant",
      filePath: ctx.filePath,
      location: getLocation(varDecl),
      ...(modifiers.length > 0 && { modifiers: modifiers }),
      metadata: fieldType ? { propertyType: fieldType } : undefined,
    });

    if (ctx.currentClass) {
      ctx.relationships.push({
        from: ctx.currentClass,
        to: fullName,
        type: "contains",
        metadata: {},
      });
    }
  }
}

/**
 * Java Chevrotain Parser
 *
 * High-performance Java parser using Chevrotain-based java-parser library.
 * Provides 5-10x faster parsing than ANTLR with comparable accuracy.
 *
 * CST to Entity mapping:
 * - normalClassDeclaration → ParsedEntity { type: "class" }
 * - enumDeclaration → ParsedEntity { type: "enum" }
 * - recordDeclaration → ParsedEntity { type: "class" } + modifiers: ["record"]
 * - normalInterfaceDeclaration → ParsedEntity { type: "interface" }
 * - methodDeclaration → ParsedEntity { type: "method" }
 * - constructorDeclaration → ParsedEntity { type: "method", name: "constructor" }
 * - fieldDeclaration → ParsedEntity { type: "field" }
 * - packageDeclaration → ParsedEntity { type: "module" }
 * - importDeclaration → ParsedEntity { type: "import" } + EntityRelationship { type: "imports" }
 */

import type { CstNode, IToken } from "java-parser";
import { parse } from "java-parser";
import { log } from "../logging/index.js";
import type { EntityRelationship, ParsedEntity } from "../types/parser.js";

// =============================================================================
// TYPE HELPERS
// =============================================================================

interface CstChildren {
  [key: string]: (CstNode | IToken)[] | undefined;
}

// Use type alias instead of interface extends to avoid TypeScript strict mode issues
type TypedCstNode = Omit<CstNode, "children"> & {
  children: CstChildren;
};

function isToken(node: unknown): node is IToken {
  return node !== null && typeof node === "object" && "image" in node;
}

function isCstNode(node: unknown): node is TypedCstNode {
  return node !== null && typeof node === "object" && "children" in node && !("image" in node);
}

function getTokens(children: CstChildren, key: string): IToken[] {
  const items = children[key];
  if (!items) return [];
  return items.filter(isToken);
}

function getNodes(children: CstChildren, key: string): TypedCstNode[] {
  const items = children[key];
  if (!items) return [];
  return items.filter(isCstNode) as TypedCstNode[];
}

function getFirstToken(children: CstChildren, key: string): IToken | undefined {
  const tokens = getTokens(children, key);
  return tokens[0];
}

function getFirstNode(children: CstChildren, key: string): TypedCstNode | undefined {
  const nodes = getNodes(children, key);
  return nodes[0];
}

// =============================================================================
// LOCATION HELPERS
// =============================================================================

interface LocationInfo {
  start: { line: number; column: number; index: number };
  end: { line: number; column: number; index: number };
}

function getLocation(node: TypedCstNode | IToken | undefined): LocationInfo {
  if (!node) {
    return { start: { line: 1, column: 0, index: 0 }, end: { line: 1, column: 0, index: 0 } };
  }

  // Check if it's a token (has 'image' property)
  if ("image" in node) {
    const token = node as IToken;
    return {
      start: {
        line: token.startLine ?? 1,
        column: (token.startColumn ?? 1) - 1,
        index: token.startOffset ?? 0,
      },
      end: {
        line: token.endLine ?? token.startLine ?? 1,
        column: (token.endColumn ?? token.startColumn ?? 1) - 1,
        index: (token.endOffset ?? token.startOffset ?? 0) + 1,
      },
    };
  }

  // CstNode
  const cstNode = node as TypedCstNode;
  if (cstNode.location) {
    return {
      start: {
        line: cstNode.location.startLine ?? 1,
        column: (cstNode.location.startColumn ?? 1) - 1,
        index: cstNode.location.startOffset ?? 0,
      },
      end: {
        line: cstNode.location.endLine ?? cstNode.location.startLine ?? 1,
        column: (cstNode.location.endColumn ?? cstNode.location.startColumn ?? 1) - 1,
        index: (cstNode.location.endOffset ?? cstNode.location.startOffset ?? 0) + 1,
      },
    };
  }

  return { start: { line: 1, column: 0, index: 0 }, end: { line: 1, column: 0, index: 0 } };
}

// =============================================================================
// PARSER CONTEXT
// =============================================================================

interface ParserContext {
  filePath: string;
  packageName: string;
  entities: ParsedEntity[];
  relationships: EntityRelationship[];
  currentClass: string | null;
  imports: Map<string, string>;
}

// =============================================================================
// EXTRACTION HELPERS
// =============================================================================

function extractModifiers(modifierNodes: TypedCstNode[]): string[] {
  const modifiers: string[] = [];
  const keywords = [
    "Public",
    "Private",
    "Protected",
    "Static",
    "Final",
    "Abstract",
    "Synchronized",
    "Native",
    "Transient",
    "Volatile",
    "Strictfp",
    "Default",
    "Sealed",
    "NonSealed",
  ];

  for (const modNode of modifierNodes) {
    for (const keyword of keywords) {
      if (getFirstToken(modNode.children, keyword)) {
        modifiers.push(keyword.toLowerCase().replace("nonsealed", "non-sealed"));
      }
    }
  }

  return modifiers;
}

function extractAnnotations(
  modifierNodes: TypedCstNode[],
): Array<{ name: string; arguments?: string[]; isBuiltin?: boolean }> {
  const annotations: Array<{ name: string; arguments?: string[]; isBuiltin?: boolean }> = [];
  const builtins = new Set(["Override", "Deprecated", "SuppressWarnings", "FunctionalInterface", "SafeVarargs"]);

  for (const modNode of modifierNodes) {
    const annNodes = getNodes(modNode.children, "annotation");
    for (const annNode of annNodes) {
      const typeName = getFirstNode(annNode.children, "typeName");
      if (!typeName) continue;

      const identifiers = getTokens(typeName.children, "Identifier");
      if (identifiers.length === 0) continue;

      const name = identifiers.map((t) => t.image).join(".");
      annotations.push({ name, isBuiltin: builtins.has(name) });
    }
  }

  return annotations;
}

function extractTypeIdentifier(node: TypedCstNode | undefined): string {
  if (!node) return "";
  const identifier = getFirstToken(node.children, "Identifier");
  return identifier?.image || "";
}

function extractTypeText(typeNode: TypedCstNode): string {
  // Try unannPrimitiveTypeWithOptionalDimsSuffix or unannPrimitiveType
  const primitiveType =
    getFirstNode(typeNode.children, "unannPrimitiveTypeWithOptionalDimsSuffix") ||
    getFirstNode(typeNode.children, "unannPrimitiveType");
  if (primitiveType) {
    const numericType = getFirstNode(primitiveType.children, "numericType");
    if (numericType) {
      const integralType = getFirstNode(numericType.children, "integralType");
      if (integralType) {
        for (const key of ["Byte", "Short", "Int", "Long", "Char"]) {
          if (getFirstToken(integralType.children, key)) {
            return key.toLowerCase();
          }
        }
      }
      const floatType = getFirstNode(numericType.children, "floatingPointType");
      if (floatType) {
        for (const key of ["Float", "Double"]) {
          if (getFirstToken(floatType.children, key)) {
            return key.toLowerCase();
          }
        }
      }
    }
    if (getFirstToken(primitiveType.children, "Boolean")) {
      return "boolean";
    }
  }

  // Try unannReferenceType
  const refType = getFirstNode(typeNode.children, "unannReferenceType");
  if (refType) {
    const classOrInterfaceType = getFirstNode(refType.children, "unannClassOrInterfaceType");
    if (classOrInterfaceType) {
      const classType = getFirstNode(classOrInterfaceType.children, "unannClassType");
      if (classType) {
        const identifiers = getTokens(classType.children, "Identifier");
        if (identifiers.length > 0) {
          return identifiers.map((t) => t.image).join(".");
        }
      }
    }
  }

  return "Object";
}

function extractParameters(
  formalParamList: TypedCstNode | undefined,
): Array<{ name: string; type?: string | undefined; optional?: boolean | undefined }> {
  if (!formalParamList) return [];

  const params: Array<{ name: string; type?: string | undefined; optional?: boolean | undefined }> = [];
  const formalParams = getNodes(formalParamList.children, "formalParameter");

  for (const paramNode of formalParams) {
    const varDeclId = getFirstNode(paramNode.children, "variableDeclaratorId");
    if (!varDeclId) continue;

    const identifier = getFirstToken(varDeclId.children, "Identifier");
    if (!identifier) continue;

    const unannType = getFirstNode(paramNode.children, "unannType");
    const type = unannType ? extractTypeText(unannType) : undefined;

    params.push({ name: identifier.image, ...(type != null ? { type } : {}) });
  }

  // Check for variableArityParameter (varargs)
  const varArgsParam = getFirstNode(formalParamList.children, "variableArityParameter");
  if (varArgsParam) {
    const varDeclId = getFirstNode(varArgsParam.children, "variableDeclaratorId");
    if (varDeclId) {
      const identifier = getFirstToken(varDeclId.children, "Identifier");
      if (identifier) {
        const unannType = getFirstNode(varArgsParam.children, "unannType");
        const type = unannType ? extractTypeText(unannType) + "..." : undefined;
        params.push({ name: identifier.image, ...(type != null ? { type } : {}) });
      }
    }
  }

  return params;
}

// =============================================================================
// CST PROCESSING
// =============================================================================

function processCompilationUnit(cst: TypedCstNode, ctx: ParserContext): void {
  const ordinaryUnit = getFirstNode(cst.children, "ordinaryCompilationUnit");
  if (!ordinaryUnit) return;

  // Process package declaration
  const pkgDecl = getFirstNode(ordinaryUnit.children, "packageDeclaration");
  if (pkgDecl) {
    processPackageDeclaration(pkgDecl, ctx);
  }

  // Process import declarations
  const importDecls = getNodes(ordinaryUnit.children, "importDeclaration");
  for (const importDecl of importDecls) {
    processImportDeclaration(importDecl, ctx);
  }

  // Process type declarations (classes, interfaces, enums, records)
  const typeDecls = getNodes(ordinaryUnit.children, "typeDeclaration");
  for (const typeDecl of typeDecls) {
    processTypeDeclaration(typeDecl, ctx);
  }

  // If no module entity was created, create one from filename
  if (!ctx.entities.some((e) => e.type === "module")) {
    ctx.entities.unshift({
      name: ctx.filePath.split(/[/\\]/).pop() || "module",
      type: "module",
      filePath: ctx.filePath,
      location: { start: { line: 1, column: 0, index: 0 }, end: { line: 1, column: 0, index: 0 } },
    });
  }
}

function processPackageDeclaration(pkgDecl: TypedCstNode, ctx: ParserContext): void {
  const identifiers = getTokens(pkgDecl.children, "Identifier");
  if (identifiers.length > 0) {
    ctx.packageName = identifiers.map((t) => t.image).join(".");
    ctx.entities.push({
      name: ctx.packageName,
      type: "module",
      filePath: ctx.filePath,
      location: getLocation(pkgDecl),
    });
  }
}

function processImportDeclaration(importDecl: TypedCstNode, ctx: ParserContext): void {
  const isStatic = !!getFirstToken(importDecl.children, "Static");
  const isWildcard = !!getFirstToken(importDecl.children, "Star");

  // Get the package or type name
  const pkgOrTypeName = getFirstNode(importDecl.children, "packageOrTypeName");
  if (!pkgOrTypeName) return;

  const identifiers = getTokens(pkgOrTypeName.children, "Identifier");
  if (identifiers.length === 0) return;

  let importPath = identifiers.map((t) => t.image).join(".");
  if (isWildcard) {
    importPath += ".*";
  }

  // Store import mapping
  if (!isWildcard) {
    const simpleName = identifiers[identifiers.length - 1]?.image;
    if (simpleName) {
      ctx.imports.set(simpleName, importPath);
    }
  }

  ctx.entities.push({
    name: importPath,
    type: "import",
    filePath: ctx.filePath,
    location: getLocation(importDecl),
    modifiers: isStatic ? ["static"] : undefined,
    importData: {
      source: importPath,
      specifiers: [],
      isDefault: false,
      isNamespace: isWildcard,
    },
  });

  ctx.relationships.push({
    from: ctx.filePath,
    to: importPath,
    type: "imports",
    metadata: { isStatic, isWildcard },
  });
}

function processTypeDeclaration(typeDecl: TypedCstNode, ctx: ParserContext): void {
  // Check for class declaration
  const classDecl = getFirstNode(typeDecl.children, "classDeclaration");
  if (classDecl) {
    processClassDeclaration(classDecl, ctx);
    return;
  }

  // Check for interface declaration
  const interfaceDecl = getFirstNode(typeDecl.children, "interfaceDeclaration");
  if (interfaceDecl) {
    processInterfaceDeclaration(interfaceDecl, ctx);
  }
}

function processClassDeclaration(classDecl: TypedCstNode, ctx: ParserContext): void {
  // Normal class
  const normalClassDecl = getFirstNode(classDecl.children, "normalClassDeclaration");
  if (normalClassDecl) {
    processNormalClassDeclaration(normalClassDecl, classDecl, ctx);
    return;
  }

  // Enum
  const enumDecl = getFirstNode(classDecl.children, "enumDeclaration");
  if (enumDecl) {
    processEnumDeclaration(enumDecl, classDecl, ctx);
    return;
  }

  // Record
  const recordDecl = getFirstNode(classDecl.children, "recordDeclaration");
  if (recordDecl) {
    processRecordDeclaration(recordDecl, classDecl, ctx);
  }
}

function processNormalClassDeclaration(
  normalClassDecl: TypedCstNode,
  classDecl: TypedCstNode,
  ctx: ParserContext,
): void {
  const typeId = getFirstNode(normalClassDecl.children, "typeIdentifier");
  const className = extractTypeIdentifier(typeId);
  if (!className) return;

  const location = getLocation(normalClassDecl);
  const modifierNodes = getNodes(classDecl.children, "classModifier");
  const modifiers = extractModifiers(modifierNodes);
  const annotations = extractAnnotations(modifierNodes);

  // Extract inheritance
  const baseClasses: string[] = [];
  const interfaces: string[] = [];

  const superclass = getFirstNode(normalClassDecl.children, "superclass");
  if (superclass) {
    const classType = getFirstNode(superclass.children, "classType");
    if (classType) {
      const identifiers = getTokens(classType.children, "Identifier");
      if (identifiers.length > 0) {
        baseClasses.push(identifiers.map((t) => t.image).join("."));
      }
    }
  }

  const superinterfaces = getFirstNode(normalClassDecl.children, "superinterfaces");
  if (superinterfaces) {
    const interfaceTypeList = getFirstNode(superinterfaces.children, "interfaceTypeList");
    if (interfaceTypeList) {
      const interfaceTypes = getNodes(interfaceTypeList.children, "interfaceType");
      for (const ifaceType of interfaceTypes) {
        const classType = getFirstNode(ifaceType.children, "classType");
        if (classType) {
          const identifiers = getTokens(classType.children, "Identifier");
          if (identifiers.length > 0) {
            interfaces.push(identifiers.map((t) => t.image).join("."));
          }
        }
      }
    }
  }

  const entity: ParsedEntity = {
    name: className,
    type: "class",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers }),
    inheritance:
      baseClasses.length > 0 || interfaces.length > 0
        ? {
            baseClasses,
            interfaces: interfaces.length > 0 ? interfaces : undefined,
            isAbstract: modifiers.includes("abstract"),
          }
        : undefined,
    ...(annotations.length > 0 && { decorators: annotations }),
    children: [],
  };

  ctx.entities.push(entity);

  // Create inheritance relationships
  for (const base of baseClasses) {
    ctx.relationships.push({ from: className, to: base, type: "inherits", metadata: { line: location.start.line } });
  }
  for (const iface of interfaces) {
    ctx.relationships.push({ from: className, to: iface, type: "implements", metadata: { line: location.start.line } });
  }

  // Process class body
  const prevClass = ctx.currentClass;
  ctx.currentClass = className;

  const classBody = getFirstNode(normalClassDecl.children, "classBody");
  if (classBody) {
    processClassBody(classBody, ctx);
  }

  ctx.currentClass = prevClass;
}

function processClassBody(classBody: TypedCstNode, ctx: ParserContext): void {
  const bodyDecls = getNodes(classBody.children, "classBodyDeclaration");
  for (const bodyDecl of bodyDecls) {
    // Class member declaration
    const classMemberDecl = getFirstNode(bodyDecl.children, "classMemberDeclaration");
    if (classMemberDecl) {
      processClassMemberDeclaration(classMemberDecl, ctx);
      continue;
    }

    // Constructor declaration
    const constructorDecl = getFirstNode(bodyDecl.children, "constructorDeclaration");
    if (constructorDecl) {
      processConstructorDeclaration(constructorDecl, ctx);
    }
  }
}

function processClassMemberDeclaration(memberDecl: TypedCstNode, ctx: ParserContext): void {
  // Field declaration
  const fieldDecl = getFirstNode(memberDecl.children, "fieldDeclaration");
  if (fieldDecl) {
    processFieldDeclaration(fieldDecl, ctx);
    return;
  }

  // Method declaration
  const methodDecl = getFirstNode(memberDecl.children, "methodDeclaration");
  if (methodDecl) {
    processMethodDeclaration(methodDecl, ctx);
    return;
  }

  // Nested class
  const classDecl = getFirstNode(memberDecl.children, "classDeclaration");
  if (classDecl) {
    processClassDeclaration(classDecl, ctx);
    return;
  }

  // Nested interface
  const interfaceDecl = getFirstNode(memberDecl.children, "interfaceDeclaration");
  if (interfaceDecl) {
    processInterfaceDeclaration(interfaceDecl, ctx);
  }
}

function processMethodDeclaration(methodDecl: TypedCstNode, ctx: ParserContext): void {
  const methodHeader = getFirstNode(methodDecl.children, "methodHeader");
  if (!methodHeader) return;

  const methodDeclarator = getFirstNode(methodHeader.children, "methodDeclarator");
  if (!methodDeclarator) return;

  const identifier = getFirstToken(methodDeclarator.children, "Identifier");
  if (!identifier) return;

  const methodName = identifier.image;
  const location = getLocation(methodDecl);

  const modifierNodes = getNodes(methodDecl.children, "methodModifier");
  const modifiers = extractModifiers(modifierNodes);
  const annotations = extractAnnotations(modifierNodes);

  // Extract return type
  const result = getFirstNode(methodHeader.children, "result");
  let returnType: string | undefined;
  if (result) {
    const unannType = getFirstNode(result.children, "unannType");
    if (unannType) {
      returnType = extractTypeText(unannType);
    }
  }

  // Extract parameters
  const formalParamList = getFirstNode(methodDeclarator.children, "formalParameterList");
  const params = extractParameters(formalParamList);

  const fullName = ctx.currentClass ? `${ctx.currentClass}.${methodName}` : methodName;

  ctx.entities.push({
    name: fullName,
    type: "method",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers }),
    ...(params.length > 0 && { parameters: params }),
    returnType,
    ...(annotations.length > 0 && { decorators: annotations }),
  });

  if (ctx.currentClass) {
    ctx.relationships.push({ from: ctx.currentClass, to: fullName, type: "contains", metadata: {} });
  }

  // Check for @Override
  if (annotations.some((a) => a.name === "Override")) {
    ctx.relationships.push({
      from: fullName,
      to: `*.${methodName}`,
      type: "overrides",
      metadata: { line: location.start.line },
    });
  }
}

function processConstructorDeclaration(constructorDecl: TypedCstNode, ctx: ParserContext): void {
  const declarator = getFirstNode(constructorDecl.children, "constructorDeclarator");
  if (!declarator) return;

  const location = getLocation(constructorDecl);

  const modifierNodes = getNodes(constructorDecl.children, "constructorModifier");
  const modifiers = extractModifiers(modifierNodes);

  const formalParamList = getFirstNode(declarator.children, "formalParameterList");
  const params = extractParameters(formalParamList);

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
    ctx.relationships.push({ from: ctx.currentClass, to: fullName, type: "contains", metadata: {} });
  }
}

function processFieldDeclaration(fieldDecl: TypedCstNode, ctx: ParserContext): void {
  const modifierNodes = getNodes(fieldDecl.children, "fieldModifier");
  const modifiers = extractModifiers(modifierNodes);
  const annotations = extractAnnotations(modifierNodes);

  const unannType = getFirstNode(fieldDecl.children, "unannType");
  const fieldType = unannType ? extractTypeText(unannType) : undefined;

  const varDeclList = getFirstNode(fieldDecl.children, "variableDeclaratorList");
  if (!varDeclList) return;

  const varDeclarators = getNodes(varDeclList.children, "variableDeclarator");
  for (const varDecl of varDeclarators) {
    const varDeclId = getFirstNode(varDecl.children, "variableDeclaratorId");
    if (!varDeclId) continue;

    const identifier = getFirstToken(varDeclId.children, "Identifier");
    if (!identifier) continue;

    const fieldName = identifier.image;
    const isConstant = modifiers.includes("final") && modifiers.includes("static");
    const fullName = ctx.currentClass ? `${ctx.currentClass}.${fieldName}` : fieldName;

    ctx.entities.push({
      name: fullName,
      type: isConstant ? "constant" : "property",
      filePath: ctx.filePath,
      location: getLocation(varDecl),
      ...(modifiers.length > 0 && { modifiers }),
      metadata: fieldType ? { propertyType: fieldType } : undefined,
      ...(annotations.length > 0 && { decorators: annotations }),
    });

    if (ctx.currentClass) {
      ctx.relationships.push({ from: ctx.currentClass, to: fullName, type: "contains", metadata: {} });
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

function processEnumDeclaration(enumDecl: TypedCstNode, classDecl: TypedCstNode, ctx: ParserContext): void {
  const typeId = getFirstNode(enumDecl.children, "typeIdentifier");
  const enumName = extractTypeIdentifier(typeId);
  if (!enumName) return;

  const location = getLocation(enumDecl);
  const modifierNodes = getNodes(classDecl.children, "classModifier");
  const modifiers = extractModifiers(modifierNodes);
  const annotations = extractAnnotations(modifierNodes);

  // Extract implements
  const interfaces: string[] = [];
  const superinterfaces = getFirstNode(enumDecl.children, "superinterfaces");
  if (superinterfaces) {
    const interfaceTypeList = getFirstNode(superinterfaces.children, "interfaceTypeList");
    if (interfaceTypeList) {
      const interfaceTypes = getNodes(interfaceTypeList.children, "interfaceType");
      for (const ifaceType of interfaceTypes) {
        const classType = getFirstNode(ifaceType.children, "classType");
        if (classType) {
          const identifiers = getTokens(classType.children, "Identifier");
          if (identifiers.length > 0) {
            interfaces.push(identifiers.map((t) => t.image).join("."));
          }
        }
      }
    }
  }

  ctx.entities.push({
    name: enumName,
    type: "enum",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers }),
    inheritance: interfaces.length > 0 ? { baseClasses: [], interfaces } : undefined,
    ...(annotations.length > 0 && { decorators: annotations }),
    children: [],
  });

  for (const iface of interfaces) {
    ctx.relationships.push({ from: enumName, to: iface, type: "implements", metadata: { line: location.start.line } });
  }

  // Process enum body
  const prevClass = ctx.currentClass;
  ctx.currentClass = enumName;

  const enumBody = getFirstNode(enumDecl.children, "enumBody");
  if (enumBody) {
    // Process enum constants
    const enumConstantList = getFirstNode(enumBody.children, "enumConstantList");
    if (enumConstantList) {
      const enumConstants = getNodes(enumConstantList.children, "enumConstant");
      for (const enumConstant of enumConstants) {
        const constId = getFirstToken(enumConstant.children, "Identifier");
        if (constId) {
          ctx.entities.push({
            name: constId.image,
            type: "enum_variant",
            filePath: ctx.filePath,
            location: getLocation(enumConstant),
          });
          ctx.relationships.push({ from: enumName, to: constId.image, type: "contains", metadata: {} });
        }
      }
    }

    // Process enum body declarations
    const enumBodyDecls = getFirstNode(enumBody.children, "enumBodyDeclarations");
    if (enumBodyDecls) {
      const classBodyDecls = getNodes(enumBodyDecls.children, "classBodyDeclaration");
      for (const bodyDecl of classBodyDecls) {
        const classMemberDecl = getFirstNode(bodyDecl.children, "classMemberDeclaration");
        if (classMemberDecl) {
          processClassMemberDeclaration(classMemberDecl, ctx);
        }
        const constructorDecl = getFirstNode(bodyDecl.children, "constructorDeclaration");
        if (constructorDecl) {
          processConstructorDeclaration(constructorDecl, ctx);
        }
      }
    }
  }

  ctx.currentClass = prevClass;
}

function processRecordDeclaration(recordDecl: TypedCstNode, classDecl: TypedCstNode, ctx: ParserContext): void {
  const typeId = getFirstNode(recordDecl.children, "typeIdentifier");
  const recordName = extractTypeIdentifier(typeId);
  if (!recordName) return;

  const location = getLocation(recordDecl);
  const modifierNodes = getNodes(classDecl.children, "classModifier");
  const modifiers = extractModifiers(modifierNodes);
  const annotations = extractAnnotations(modifierNodes);

  // Extract record components
  const params: Array<{ name: string; type?: string | undefined }> = [];
  const recordHeader = getFirstNode(recordDecl.children, "recordHeader");
  if (recordHeader) {
    const recordComponentList = getFirstNode(recordHeader.children, "recordComponentList");
    if (recordComponentList) {
      const recordComponents = getNodes(recordComponentList.children, "recordComponent");
      for (const component of recordComponents) {
        const identifier = getFirstToken(component.children, "Identifier");
        if (identifier) {
          const unannType = getFirstNode(component.children, "unannType");
          params.push({
            name: identifier.image,
            type: unannType ? extractTypeText(unannType) : undefined,
          });
        }
      }
    }
  }

  // Extract implements
  const interfaces: string[] = [];
  const superinterfaces = getFirstNode(recordDecl.children, "superinterfaces");
  if (superinterfaces) {
    const interfaceTypeList = getFirstNode(superinterfaces.children, "interfaceTypeList");
    if (interfaceTypeList) {
      const interfaceTypes = getNodes(interfaceTypeList.children, "interfaceType");
      for (const ifaceType of interfaceTypes) {
        const classType = getFirstNode(ifaceType.children, "classType");
        if (classType) {
          const identifiers = getTokens(classType.children, "Identifier");
          if (identifiers.length > 0) {
            interfaces.push(identifiers.map((t) => t.image).join("."));
          }
        }
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
    children: [],
  });

  // Process record body
  const prevClass = ctx.currentClass;
  ctx.currentClass = recordName;

  const recordBody = getFirstNode(recordDecl.children, "recordBody");
  if (recordBody) {
    const recordBodyDecls = getNodes(recordBody.children, "recordBodyDeclaration");
    for (const bodyDecl of recordBodyDecls) {
      const classBodyDecl = getFirstNode(bodyDecl.children, "classBodyDeclaration");
      if (classBodyDecl) {
        const classMemberDecl = getFirstNode(classBodyDecl.children, "classMemberDeclaration");
        if (classMemberDecl) {
          processClassMemberDeclaration(classMemberDecl, ctx);
        }
      }
    }
  }

  ctx.currentClass = prevClass;
}

function processInterfaceDeclaration(interfaceDecl: TypedCstNode, ctx: ParserContext): void {
  const normalInterfaceDecl = getFirstNode(interfaceDecl.children, "normalInterfaceDeclaration");
  if (normalInterfaceDecl) {
    processNormalInterfaceDeclaration(normalInterfaceDecl, interfaceDecl, ctx);
    return;
  }

  const annotationInterfaceDecl = getFirstNode(interfaceDecl.children, "annotationInterfaceDeclaration");
  if (annotationInterfaceDecl) {
    processAnnotationInterfaceDeclaration(annotationInterfaceDecl, interfaceDecl, ctx);
  }
}

function processNormalInterfaceDeclaration(
  normalInterfaceDecl: TypedCstNode,
  interfaceDecl: TypedCstNode,
  ctx: ParserContext,
): void {
  const typeId = getFirstNode(normalInterfaceDecl.children, "typeIdentifier");
  const interfaceName = extractTypeIdentifier(typeId);
  if (!interfaceName) return;

  const location = getLocation(normalInterfaceDecl);
  const modifierNodes = getNodes(interfaceDecl.children, "interfaceModifier");
  const modifiers = extractModifiers(modifierNodes);
  const annotations = extractAnnotations(modifierNodes);

  // Extract extends
  const interfaces: string[] = [];
  const extendsInterfaces = getFirstNode(normalInterfaceDecl.children, "extendsInterfaces");
  if (extendsInterfaces) {
    const interfaceTypeList = getFirstNode(extendsInterfaces.children, "interfaceTypeList");
    if (interfaceTypeList) {
      const interfaceTypes = getNodes(interfaceTypeList.children, "interfaceType");
      for (const ifaceType of interfaceTypes) {
        const classType = getFirstNode(ifaceType.children, "classType");
        if (classType) {
          const identifiers = getTokens(classType.children, "Identifier");
          if (identifiers.length > 0) {
            interfaces.push(identifiers.map((t) => t.image).join("."));
          }
        }
      }
    }
  }

  ctx.entities.push({
    name: interfaceName,
    type: "interface",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers }),
    inheritance: interfaces.length > 0 ? { baseClasses: [], interfaces } : undefined,
    ...(annotations.length > 0 && { decorators: annotations }),
    children: [],
  });

  for (const iface of interfaces) {
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

  const interfaceBody = getFirstNode(normalInterfaceDecl.children, "interfaceBody");
  if (interfaceBody) {
    processInterfaceBody(interfaceBody, ctx);
  }

  ctx.currentClass = prevClass;
}

function processInterfaceBody(interfaceBody: TypedCstNode, ctx: ParserContext): void {
  const memberDecls = getNodes(interfaceBody.children, "interfaceMemberDeclaration");
  for (const memberDecl of memberDecls) {
    // Constant declaration
    const constantDecl = getFirstNode(memberDecl.children, "constantDeclaration");
    if (constantDecl) {
      processConstantDeclaration(constantDecl, ctx);
      continue;
    }

    // Interface method
    const methodDecl = getFirstNode(memberDecl.children, "interfaceMethodDeclaration");
    if (methodDecl) {
      processInterfaceMethodDeclaration(methodDecl, ctx);
      continue;
    }

    // Nested class
    const classDecl = getFirstNode(memberDecl.children, "classDeclaration");
    if (classDecl) {
      processClassDeclaration(classDecl, ctx);
      continue;
    }

    // Nested interface
    const interfaceDecl = getFirstNode(memberDecl.children, "interfaceDeclaration");
    if (interfaceDecl) {
      processInterfaceDeclaration(interfaceDecl, ctx);
    }
  }
}

function processInterfaceMethodDeclaration(methodDecl: TypedCstNode, ctx: ParserContext): void {
  const methodHeader = getFirstNode(methodDecl.children, "methodHeader");
  if (!methodHeader) return;

  const methodDeclarator = getFirstNode(methodHeader.children, "methodDeclarator");
  if (!methodDeclarator) return;

  const identifier = getFirstToken(methodDeclarator.children, "Identifier");
  if (!identifier) return;

  const methodName = identifier.image;
  const location = getLocation(methodDecl);

  const modifierNodes = getNodes(methodDecl.children, "interfaceMethodModifier");
  const modifiers = extractModifiers(modifierNodes);

  // Extract return type
  const result = getFirstNode(methodHeader.children, "result");
  let returnType: string | undefined;
  if (result) {
    const unannType = getFirstNode(result.children, "unannType");
    if (unannType) {
      returnType = extractTypeText(unannType);
    }
  }

  // Extract parameters
  const formalParamList = getFirstNode(methodDeclarator.children, "formalParameterList");
  const params = extractParameters(formalParamList);

  const fullName = ctx.currentClass ? `${ctx.currentClass}.${methodName}` : methodName;

  ctx.entities.push({
    name: fullName,
    type: "method",
    filePath: ctx.filePath,
    location,
    ...(modifiers.length > 0 && { modifiers }),
    ...(params.length > 0 && { parameters: params }),
    returnType,
  });

  if (ctx.currentClass) {
    ctx.relationships.push({ from: ctx.currentClass, to: fullName, type: "contains", metadata: {} });
  }
}

function processConstantDeclaration(constantDecl: TypedCstNode, ctx: ParserContext): void {
  const modifierNodes = getNodes(constantDecl.children, "constantModifier");
  const modifiers = extractModifiers(modifierNodes);

  const unannType = getFirstNode(constantDecl.children, "unannType");
  const fieldType = unannType ? extractTypeText(unannType) : undefined;

  const varDeclList = getFirstNode(constantDecl.children, "variableDeclaratorList");
  if (!varDeclList) return;

  const varDeclarators = getNodes(varDeclList.children, "variableDeclarator");
  for (const varDecl of varDeclarators) {
    const varDeclId = getFirstNode(varDecl.children, "variableDeclaratorId");
    if (!varDeclId) continue;

    const identifier = getFirstToken(varDeclId.children, "Identifier");
    if (!identifier) continue;

    const constantName = identifier.image;
    const fullName = ctx.currentClass ? `${ctx.currentClass}.${constantName}` : constantName;

    ctx.entities.push({
      name: fullName,
      type: "constant",
      filePath: ctx.filePath,
      location: getLocation(varDecl),
      ...(modifiers.length > 0 && { modifiers }),
      metadata: fieldType ? { propertyType: fieldType } : undefined,
    });

    if (ctx.currentClass) {
      ctx.relationships.push({ from: ctx.currentClass, to: fullName, type: "contains", metadata: {} });
    }
  }
}

function processAnnotationInterfaceDeclaration(
  annotationDecl: TypedCstNode,
  interfaceDecl: TypedCstNode,
  ctx: ParserContext,
): void {
  const typeId = getFirstNode(annotationDecl.children, "typeIdentifier");
  const annotationName = extractTypeIdentifier(typeId);
  if (!annotationName) return;

  const location = getLocation(annotationDecl);
  const modifierNodes = getNodes(interfaceDecl.children, "interfaceModifier");
  const modifiers = extractModifiers(modifierNodes);

  ctx.entities.push({
    name: annotationName,
    type: "interface",
    filePath: ctx.filePath,
    location,
    modifiers: [...modifiers, "annotation"],
  });
}

// =============================================================================
// MAIN PARSER CLASS
// =============================================================================

export class JavaChevrotainParser {
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
      const cst = parse(content) as TypedCstNode;
      processCompilationUnit(cst, ctx);
    } catch (error) {
      log.e("JAVACHEV", "parse_err", { file: filePath, err: String(error) });
    }

    // Log stats
    const totalRels = ctx.relationships.length;
    if (totalRels > 0 || ctx.entities.length > 0) {
      log.d("JAVACHEV", "parse_done", {
        file: filePath.split(/[/\\]/).pop(),
        entities: ctx.entities.length,
        rels: totalRels,
      });
    }

    return {
      entities: ctx.entities,
      relationships: ctx.relationships,
    };
  }
}

/**
 * TypeScript JavaScript Patterns Extractor
 *
 * Extracts JavaScript-specific patterns:
 * - Prototype method assignments
 * - CommonJS exports (module.exports, exports.X)
 * - Object literals with methods
 * - IIFE (Immediately Invoked Function Expressions)
 * - CommonJS require()
 * - Constructor functions
 */

import ts from "typescript";
import type { EntityRelationship, ParsedEntity } from "../types/parser.js";
import { getLocation, getModifiers, getParameters, getReturnType } from "./ts-ast-helpers.js";
import { type CallInfo, extractCalls } from "./ts-call-extractor.js";
import { extractComplexity } from "./ts-complexity-analyzer.js";
import { extractControlFlow } from "./ts-control-flow-extractor.js";
import { extractDocumentation } from "./ts-doc-extractor.js";

export interface JSPatternsExtractorContext {
  sourceFile: ts.SourceFile;
  filePath: string;
  entities: ParsedEntity[];
  relationships: EntityRelationship[];
}

/**
 * Add calls relationships
 */
function addCallsRelationships(
  fromName: string,
  calls: CallInfo[],
  filePath: string,
  relationships: EntityRelationship[],
): void {
  for (const call of calls) {
    const calledTarget = call.target ? `${call.target}.${call.name}` : call.name;
    relationships.push({
      from: fromName,
      to: calledTarget,
      type: "calls",
      sourceFile: filePath,
      metadata: {
        line: call.location.start.line,
        isAwait: call.isAwait,
        isNew: call.isNew,
        argumentCount: call.argumentCount,
      },
    });
  }
}

/**
 * Extract prototype method assignments: MyClass.prototype.method = function() {}
 */
export function extractPrototypeMethod(node: ts.ExpressionStatement, ctx: JSPatternsExtractorContext): boolean {
  if (!ts.isBinaryExpression(node.expression)) return false;

  const expr = node.expression;
  if (expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return false;

  const { sourceFile, filePath, entities, relationships } = ctx;
  const left = expr.left;
  const right = expr.right;

  if (!ts.isPropertyAccessExpression(left)) return false;

  const leftText = left.getText(sourceFile);
  const prototypeMatch = leftText.match(/^(\w+)\.prototype\.(\w+)$/);

  if (!prototypeMatch || (!ts.isFunctionExpression(right) && !ts.isArrowFunction(right))) {
    return false;
  }

  const [, className, methodName] = prototypeMatch;
  const modifiers: string[] = [];
  const isAsync =
    ts.canHaveModifiers(right) && ts.getModifiers(right)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);

  if (isAsync) modifiers.push("async");
  modifiers.push("prototype");

  const calls = extractCalls(right, sourceFile);
  const controlFlow = extractControlFlow(right, sourceFile);
  const documentation = extractDocumentation(node, sourceFile);
  const complexity = extractComplexity(right, sourceFile);

  entities.push({
    name: `${className}.prototype.${methodName}`,
    type: isAsync ? "async_function" : "method",
    filePath,
    location: getLocation(sourceFile, node),
    modifiers,
    parameters: getParameters(right, sourceFile),
    returnType: getReturnType(right, sourceFile),
    ...(calls.length > 0 && { calls }),
    controlFlow,
    documentation,
    complexity,
    metadata: {
      jsPattern: "prototype_method",
      parentClass: className,
    },
  });

  if (calls.length > 0) {
    addCallsRelationships(`${className}.prototype.${methodName}`, calls, filePath, relationships);
  }

  // Add contains relationship to class
  relationships.push({
    from: className!,
    to: `${className}.prototype.${methodName}`,
    type: "contains",
    sourceFile: filePath,
    metadata: {
      line: getLocation(sourceFile, node).start.line,
      memberType: "prototype_method",
    },
  });

  return true;
}

/**
 * Extract CommonJS exports: module.exports = ... or exports.X = ...
 */
export function extractCommonJSExport(node: ts.ExpressionStatement, ctx: JSPatternsExtractorContext): boolean {
  if (!ts.isBinaryExpression(node.expression)) return false;

  const expr = node.expression;
  if (expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return false;

  const { sourceFile, filePath, entities, relationships } = ctx;
  const left = expr.left;
  const right = expr.right;

  if (!ts.isPropertyAccessExpression(left)) return false;

  const leftText = left.getText(sourceFile);

  // module.exports = X
  if (leftText === "module.exports") {
    const exportLocation = getLocation(sourceFile, node);

    if (ts.isObjectLiteralExpression(right)) {
      // module.exports = { method1, method2 }
      for (const prop of right.properties) {
        if (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) {
          const propName = ts.isPropertyAssignment(prop) ? prop.name.getText(sourceFile) : prop.name.text;

          entities.push({
            name: propName,
            type: "export",
            filePath,
            location: getLocation(sourceFile, prop),
            metadata: {
              jsPattern: "commonjs_export",
              exportStyle: "module.exports",
            },
          });
        }
      }
      return true;
    } else if (ts.isIdentifier(right) || ts.isFunctionExpression(right) || ts.isClassExpression(right)) {
      // module.exports = SomeClass or module.exports = function() {}
      const exportName = ts.isIdentifier(right) ? right.text : "default";
      entities.push({
        name: exportName,
        type: "export",
        filePath,
        location: exportLocation,
        metadata: {
          jsPattern: "commonjs_export",
          exportStyle: "module.exports",
          isDefault: true,
        },
      });
      return true;
    }
  }

  // exports.X = ...
  const exportsMatch = leftText.match(/^exports\.(\w+)$/);
  if (exportsMatch) {
    const [, exportName] = exportsMatch;
    const exportLocation = getLocation(sourceFile, node);

    if (ts.isFunctionExpression(right) || ts.isArrowFunction(right)) {
      const isAsync =
        ts.canHaveModifiers(right) && ts.getModifiers(right)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);

      const calls = extractCalls(right, sourceFile);
      const controlFlow = extractControlFlow(right, sourceFile);
      const documentation = extractDocumentation(node, sourceFile);
      const complexity = extractComplexity(right, sourceFile);

      entities.push({
        name: exportName!,
        type: isAsync ? "async_function" : "function",
        filePath,
        location: exportLocation,
        modifiers: ["export", ...(isAsync ? ["async"] : [])],
        parameters: getParameters(right, sourceFile),
        returnType: getReturnType(right, sourceFile),
        ...(calls.length > 0 && { calls }),
        controlFlow,
        documentation,
        complexity,
        metadata: {
          jsPattern: "commonjs_export",
          exportStyle: "exports.X",
        },
      });

      if (calls.length > 0) {
        addCallsRelationships(exportName!, calls, filePath, relationships);
      }
    } else {
      entities.push({
        name: exportName!,
        type: "export",
        filePath,
        location: exportLocation,
        metadata: {
          jsPattern: "commonjs_export",
          exportStyle: "exports.X",
        },
      });
    }
    return true;
  }

  return false;
}

/**
 * Extract object literals with methods: const obj = { method() {}, prop: function() {} }
 */
export function extractObjectLiteralWithMethods(node: ts.VariableStatement, ctx: JSPatternsExtractorContext): boolean {
  const { sourceFile, filePath, entities, relationships } = ctx;
  let extracted = false;

  for (const decl of node.declarationList.declarations) {
    if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer) || !ts.isIdentifier(decl.name)) {
      continue;
    }

    const objectName = decl.name.text;
    const isConst = (node.declarationList.flags & ts.NodeFlags.Const) !== 0;
    const objectLocation = getLocation(sourceFile, decl);
    const objectDoc = extractDocumentation(node, sourceFile);

    let methodCount = 0;
    let propCount = 0;
    const children: ParsedEntity[] = [];

    for (const prop of decl.initializer.properties) {
      // Method shorthand: { method() {} }
      if (ts.isMethodDeclaration(prop) && prop.name) {
        methodCount++;
        const methodName = prop.name.getText(sourceFile);
        const methodModifiers = getModifiers(prop);
        const isAsync = methodModifiers.includes("async");
        const methodCalls = extractCalls(prop, sourceFile);
        const methodControlFlow = extractControlFlow(prop, sourceFile);
        const methodDoc = extractDocumentation(prop, sourceFile);
        const methodComplexity = extractComplexity(prop, sourceFile);
        const methodLocation = getLocation(sourceFile, prop);

        children.push({
          name: methodName,
          type: isAsync ? "async_function" : "method",
          filePath,
          location: methodLocation,
          modifiers: methodModifiers,
          parameters: getParameters(prop, sourceFile),
          returnType: getReturnType(prop, sourceFile),
          ...(methodCalls.length > 0 && { calls: methodCalls }),
          controlFlow: methodControlFlow,
          documentation: methodDoc,
          complexity: methodComplexity,
        });

        if (methodCalls.length > 0) {
          addCallsRelationships(`${objectName}.${methodName}`, methodCalls, filePath, relationships);
        }

        relationships.push({
          from: objectName,
          to: `${objectName}.${methodName}`,
          type: "contains",
          sourceFile: filePath,
          metadata: { line: methodLocation.start.line, memberType: "method" },
        });
      }

      // Property with function value: { prop: function() {} } or { prop: () => {} }
      if (ts.isPropertyAssignment(prop) && prop.name) {
        const propName = prop.name.getText(sourceFile);
        const propValue = prop.initializer;

        if (ts.isFunctionExpression(propValue) || ts.isArrowFunction(propValue)) {
          methodCount++;
          const isAsync =
            ts.canHaveModifiers(propValue) &&
            ts.getModifiers(propValue)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);

          const methodCalls = extractCalls(propValue, sourceFile);
          const methodControlFlow = extractControlFlow(propValue, sourceFile);
          const methodDoc = extractDocumentation(prop, sourceFile);
          const methodComplexity = extractComplexity(propValue, sourceFile);
          const methodLocation = getLocation(sourceFile, prop);

          children.push({
            name: propName,
            type: isAsync ? "async_function" : "method",
            filePath,
            location: methodLocation,
            modifiers: isAsync ? ["async"] : [],
            parameters: getParameters(propValue, sourceFile),
            returnType: getReturnType(propValue, sourceFile),
            ...(methodCalls.length > 0 && { calls: methodCalls }),
            controlFlow: methodControlFlow,
            documentation: methodDoc,
            complexity: methodComplexity,
          });

          if (methodCalls.length > 0) {
            addCallsRelationships(`${objectName}.${propName}`, methodCalls, filePath, relationships);
          }

          relationships.push({
            from: objectName,
            to: `${objectName}.${propName}`,
            type: "contains",
            sourceFile: filePath,
            metadata: { line: methodLocation.start.line, memberType: "method" },
          });
        } else {
          propCount++;
          children.push({
            name: propName,
            type: "property",
            filePath,
            location: getLocation(sourceFile, prop),
          });
        }
      }

      // Shorthand property: { existingVar }
      if (ts.isShorthandPropertyAssignment(prop)) {
        propCount++;
        children.push({
          name: prop.name.text,
          type: "property",
          filePath,
          location: getLocation(sourceFile, prop),
        });
      }
    }

    // Only create entity if object has methods or significant structure
    if (methodCount > 0 || children.length >= 3) {
      entities.push({
        name: objectName,
        type: methodCount > 0 ? "module" : isConst ? "constant" : "variable",
        filePath,
        location: objectLocation,
        modifiers: isConst ? ["const"] : [],
        documentation: objectDoc,
        ...(children.length > 0 && { children }),
        metadata: {
          jsPattern: "object_literal",
          methodCount,
          propertyCount: propCount,
        },
      });
      extracted = true;
    }
  }

  return extracted;
}

/**
 * Extract IIFE: (function() {})() or (() => {})()
 */
export function extractIIFE(node: ts.ExpressionStatement, ctx: JSPatternsExtractorContext): boolean {
  if (!ts.isCallExpression(node.expression)) return false;

  const { sourceFile, filePath, entities, relationships } = ctx;
  const callExpr = node.expression;
  let funcExpr: ts.FunctionExpression | ts.ArrowFunction | undefined;

  // (function() {})()
  if (ts.isParenthesizedExpression(callExpr.expression)) {
    const inner = callExpr.expression.expression;
    if (ts.isFunctionExpression(inner) || ts.isArrowFunction(inner)) {
      funcExpr = inner;
    }
  }
  // (function() {}).call() / .apply() / .bind()
  else if (ts.isPropertyAccessExpression(callExpr.expression)) {
    const propAccess = callExpr.expression;
    if (ts.isParenthesizedExpression(propAccess.expression)) {
      const inner = propAccess.expression.expression;
      if (ts.isFunctionExpression(inner) || ts.isArrowFunction(inner)) {
        const methodName = propAccess.name.text;
        if (methodName === "call" || methodName === "apply" || methodName === "bind") {
          funcExpr = inner;
        }
      }
    }
  }

  if (!funcExpr) return false;

  const iifeName =
    ts.isFunctionExpression(funcExpr) && funcExpr.name
      ? funcExpr.name.text
      : `IIFE_${getLocation(sourceFile, node).start.line}`;

  const isAsync =
    ts.canHaveModifiers(funcExpr) && ts.getModifiers(funcExpr)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);

  const calls = extractCalls(funcExpr, sourceFile);
  const controlFlow = extractControlFlow(funcExpr, sourceFile);
  const documentation = extractDocumentation(node, sourceFile);
  const complexity = extractComplexity(funcExpr, sourceFile);

  entities.push({
    name: iifeName,
    type: isAsync ? "async_function" : "function",
    filePath,
    location: getLocation(sourceFile, node),
    modifiers: ["iife", ...(isAsync ? ["async"] : [])],
    parameters: getParameters(funcExpr, sourceFile),
    ...(calls.length > 0 && { calls }),
    controlFlow,
    documentation,
    complexity,
    metadata: {
      jsPattern: "iife",
      isAnonymous: !ts.isFunctionExpression(funcExpr) || !funcExpr.name,
    },
  });

  if (calls.length > 0) {
    addCallsRelationships(iifeName, calls, filePath, relationships);
  }

  return true;
}

/**
 * Extract CommonJS require(): const x = require('module')
 */
export function extractCommonJSRequire(node: ts.VariableStatement, ctx: JSPatternsExtractorContext): boolean {
  const { sourceFile, filePath, entities, relationships } = ctx;
  let extracted = false;

  for (const decl of node.declarationList.declarations) {
    if (
      !decl.initializer ||
      !ts.isCallExpression(decl.initializer) ||
      !ts.isIdentifier(decl.initializer.expression) ||
      decl.initializer.expression.text !== "require" ||
      decl.initializer.arguments.length === 0
    ) {
      continue;
    }

    const arg = decl.initializer.arguments[0];
    if (!arg || !ts.isStringLiteral(arg)) continue;

    const source = arg.text;
    const location = getLocation(sourceFile, node);

    if (ts.isIdentifier(decl.name)) {
      // const foo = require('foo')
      entities.push({
        name: source,
        type: "import",
        filePath,
        location,
        importData: {
          source,
          specifiers: [{ local: decl.name.text }],
          isDefault: true,
          isNamespace: false,
        },
        metadata: { jsPattern: "commonjs_require" },
      });

      relationships.push({
        from: source,
        to: decl.name.text,
        type: "imports",
        sourceFile: filePath,
        targetFile: source,
        metadata: { line: location.start.line, isDefault: true, requireStyle: "commonjs" },
      });
      extracted = true;
    } else if (ts.isObjectBindingPattern(decl.name)) {
      // const { a, b } = require('foo')
      const specifiers: Array<{ local: string; imported?: string; alias?: string }> = [];

      for (const element of decl.name.elements) {
        if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
          const local = element.name.text;
          const imported =
            element.propertyName && ts.isIdentifier(element.propertyName) ? element.propertyName.text : undefined;

          specifiers.push({
            local,
            ...(imported != null ? { imported } : {}),
            ...(imported ? { alias: local } : {}),
          });

          relationships.push({
            from: source,
            to: imported || local,
            type: "imports",
            sourceFile: filePath,
            targetFile: source,
            metadata: {
              line: location.start.line,
              alias: imported ? local : undefined,
              requireStyle: "commonjs_destructured",
            },
          });
        }
      }

      entities.push({
        name: source,
        type: "import",
        filePath,
        location,
        importData: {
          source,
          specifiers,
          isDefault: false,
          isNamespace: false,
        },
        metadata: { jsPattern: "commonjs_require_destructured" },
      });
      extracted = true;
    }
  }

  return extracted;
}

/**
 * Mark constructor functions (pre-ES6 classes): function MyClass() { this.x = ... }
 */
export function markConstructorFunction(node: ts.FunctionDeclaration, entities: ParsedEntity[]): void {
  if (!node.name || !node.body) return;

  const funcName = node.name.text;
  // Check if function name starts with uppercase (convention for constructors)
  if (funcName[0] !== funcName[0]?.toUpperCase() || funcName[0] === funcName[0]?.toLowerCase()) {
    return;
  }

  // Check if body contains 'this.' assignments
  let hasThisAssignments = false;
  const thisProperties: string[] = [];

  const checkThisUsage = (n: ts.Node): void => {
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      if (ts.isPropertyAccessExpression(n.left) && n.left.expression.kind === ts.SyntaxKind.ThisKeyword) {
        hasThisAssignments = true;
        thisProperties.push(n.left.name.text);
      }
    }
    ts.forEachChild(n, checkThisUsage);
  };
  checkThisUsage(node.body);

  if (hasThisAssignments) {
    // This is likely a constructor function - mark it specially
    const existingEntity = entities.find((e) => e.name === funcName && e.type === "function");
    if (existingEntity) {
      existingEntity.type = "class";
      existingEntity.modifiers = [...(existingEntity.modifiers || []), "constructor_function"];
      existingEntity.metadata = {
        ...existingEntity.metadata,
        jsPattern: "constructor_function",
        thisProperties,
      };
    }
  }
}

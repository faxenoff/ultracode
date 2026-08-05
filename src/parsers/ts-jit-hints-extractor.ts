/**
 * TypeScript JIT Hints Extractor
 *
 * Collects JIT-relevant data from AST nodes — patterns that cause V8/JSC deoptimization:
 * delete expressions, arguments object usage, with statements, spread in calls, dynamic property access.
 */

import ts from "typescript";

export interface JitHints {
  deleteCount: number;
  argumentsRefCount: number;
  hasWithStatement: boolean;
  spreadInCallCount: number;
  dynamicPropAccessCount: number;
  /** `new Array(n)` — creates HOLEY elements that never become PACKED again */
  holeyArrayCount: number;
  /** direct `eval(...)` calls — deoptimizes the enclosing scope */
  evalCount: number;
  /** whether the body contains a loop; rules use it to separate hot from cold */
  hasLoops: boolean;
  /**
   * Number of distinct key-order signatures among object literals created in
   * this function. 2+ means one call site downstream sees several hidden
   * classes, which is how a monomorphic read turns polymorphic and then
   * megamorphic.
   */
  objectShapeVariants: number;
  /** `obj.field = …` inside a branch — grows a second shape of the same object */
  conditionalFieldAddCount: number;
}

/**
 * Extract JIT deoptimization hints from a function/method body.
 * Returns undefined if no JIT-relevant patterns found (zero-cost for clean code).
 */
export function extractJitHints(node: ts.Node, _sourceFile: ts.SourceFile): JitHints | undefined {
  let deleteCount = 0;
  let argumentsRefCount = 0;
  let hasWithStatement = false;
  let spreadInCallCount = 0;
  let dynamicPropAccessCount = 0;
  let holeyArrayCount = 0;
  let evalCount = 0;
  let hasLoops = false;
  let conditionalFieldAddCount = 0;
  const objectShapes = new Set<string>();

  // Collect parameter names to distinguish `arguments` identifier from user-defined params
  const paramNames = new Set<string>();
  if (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node)
  ) {
    for (const param of node.parameters) {
      if (ts.isIdentifier(param.name)) {
        paramNames.add(param.name.text);
      }
    }
  }

  function visit(n: ts.Node): void {
    // Skip nested function scopes — their `arguments` is their own
    if (n !== node && (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isMethodDeclaration(n))) {
      return;
    }

    // delete expression
    if (ts.isDeleteExpression(n)) {
      deleteCount++;
    }

    // `arguments` built-in object reference (not a parameter named "arguments")
    if (
      ts.isIdentifier(n) &&
      n.text === "arguments" &&
      !paramNames.has("arguments") &&
      // Arrow functions don't have their own `arguments`
      !ts.isArrowFunction(node) &&
      // Exclude cases where `arguments` is used as a property/key name, not the built-in
      !isPropertyName(n)
    ) {
      argumentsRefCount++;
    }

    // with statement
    if (ts.isWithStatement(n)) {
      hasWithStatement = true;
    }

    // Spread element in call arguments
    if (ts.isSpreadElement(n)) {
      spreadInCallCount++;
    }

    // Dynamic property access: obj[expr] where expr names a property that varies
    if (ts.isElementAccessExpression(n)) {
      const arg = n.argumentExpression;
      if (arg && namesAVaryingProperty(arg)) {
        dynamicPropAccessCount++;
      }
    }

    // new Array(n) — one argument means "length", which yields HOLEY elements.
    // new Array() and new Array(a, b) build packed arrays and are fine.
    if (ts.isNewExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "Array") {
      if (n.arguments?.length === 1) holeyArrayCount++;
    }

    // Direct eval() — indirect (window.eval) does not deoptimize the scope
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "eval") {
      evalCount++;
    }

    // Loops — both statements and the array methods that act as loops
    if (
      ts.isForStatement(n) ||
      ts.isForOfStatement(n) ||
      ts.isForInStatement(n) ||
      ts.isWhileStatement(n) ||
      ts.isDoStatement(n)
    ) {
      hasLoops = true;
    }
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
      if (LOOP_METHODS.has(n.expression.name.text)) hasLoops = true;
    }

    // Object literal shapes: the key order IS the hidden class
    if (ts.isObjectLiteralExpression(n) && n.properties.length >= 2) {
      const keys: string[] = [];
      let dynamic = false;
      for (const p of n.properties) {
        if (ts.isSpreadAssignment(p)) {
          dynamic = true; // spread merges an unknown key set — shape depends on data
          keys.push("...");
        } else if (p.name && !ts.isComputedPropertyName(p.name)) {
          keys.push(p.name.getText());
        } else {
          dynamic = true;
        }
      }
      objectShapes.add((dynamic ? "~" : "") + keys.join(","));
    }

    // Conditional field addition: `x.f = …` guarded by a branch
    if (
      ts.isBinaryExpression(n) &&
      n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(n.left) &&
      ts.isIdentifier(n.left.expression) &&
      isInsideBranch(n, node)
    ) {
      conditionalFieldAddCount++;
    }

    ts.forEachChild(n, visit);
  }

  // Walk only the body, not the signature
  const body = getBody(node);
  if (body) {
    ts.forEachChild(body, visit);
  } else {
    ts.forEachChild(node, visit);
  }

  // Return undefined if nothing found (common case — avoids metadata bloat).
  // hasLoops alone is not a finding, it only qualifies the other counts.
  const objectShapeVariants = objectShapes.size;
  if (
    deleteCount === 0 &&
    argumentsRefCount === 0 &&
    !hasWithStatement &&
    spreadInCallCount === 0 &&
    dynamicPropAccessCount === 0 &&
    holeyArrayCount === 0 &&
    evalCount === 0 &&
    objectShapeVariants < 2 &&
    conditionalFieldAddCount === 0
  ) {
    return undefined;
  }

  return {
    deleteCount,
    argumentsRefCount,
    hasWithStatement,
    spreadInCallCount,
    dynamicPropAccessCount,
    holeyArrayCount,
    evalCount,
    hasLoops,
    objectShapeVariants,
    conditionalFieldAddCount,
  };
}

/**
 * Identifier names that read as an offset rather than a property name.
 * Kept in sync with COUNTER_NAMES in the Zig scanner
 * (ultracode.zig/src/parsers/extractors/jit_hints.zig) so both engines count
 * the same thing.
 */
const COUNTER_NAMES = new Set([
  "idx",
  "index",
  "pos",
  "offset",
  "ofs",
  "cursor",
  "slot",
  "start",
  "end",
  "len",
  "size",
  "count",
  "first",
  "last",
  "mid",
  "lo",
  "hi",
  "head",
  "tail",
  "qHead",
  "qTail",
  "depth",
  "level",
  // Positions inside heaps, trees and linked structures — still offsets
  "left",
  "right",
  "smallest",
  "largest",
  "parent",
  "child",
  "root",
  "next",
  "prev",
  "top",
  "row",
  "col",
  "column",
  "step",
  "iter",
]);

/**
 * Whether `obj[arg]` looks up a property whose NAME varies — the case that goes
 * megamorphic. Numeric indexing (`a[i]`, `a[i + 1]`, `a[len - 1]`) computes an
 * offset arithmetically and has no inline cache to spoil; counting it made the
 * rule fire on hand-optimized typed-array loops, which is precisely the code it
 * should leave alone.
 */
function namesAVaryingProperty(arg: ts.Expression): boolean {
  if (ts.isStringLiteral(arg) || ts.isNumericLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
    return false; // fixed key or literal offset
  }
  // `o["pre" + id]` builds a property name; `a[i + 1]` computes an offset
  if (ts.isBinaryExpression(arg)) return containsStringLiteral(arg);
  if (ts.isPrefixUnaryExpression(arg) || ts.isPostfixUnaryExpression(arg)) return false; // a[i++], a[-1]
  if (ts.isPropertyAccessExpression(arg) && arg.name.text === "length") return false;
  if (ts.isParenthesizedExpression(arg)) return namesAVaryingProperty(arg.expression);
  if (ts.isIdentifier(arg)) {
    // Single- and double-letter names are loop variables everywhere
    return arg.text.length > 2 && !COUNTER_NAMES.has(arg.text);
  }
  return true;
}

function containsStringLiteral(n: ts.Node): boolean {
  if (ts.isStringLiteral(n) || ts.isTemplateExpression(n) || ts.isNoSubstitutionTemplateLiteral(n)) return true;
  return ts.forEachChild(n, containsStringLiteral) ?? false;
}

/** Array methods that iterate — treated as loops for hot-path rules */
const LOOP_METHODS = new Set([
  "forEach",
  "map",
  "filter",
  "reduce",
  "reduceRight",
  "flatMap",
  "some",
  "every",
  "find",
  "findIndex",
  "sort",
]);

/**
 * Whether `n` sits inside an if/ternary/logical-and that is still within the
 * function being analyzed (`root`).
 */
function isInsideBranch(n: ts.Node, root: ts.Node): boolean {
  let p: ts.Node | undefined = n.parent;
  while (p && p !== root) {
    if (ts.isIfStatement(p) || ts.isConditionalExpression(p) || ts.isCaseClause(p)) return true;
    if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return true;
    p = p.parent;
  }
  return false;
}

/**
 * Check if an identifier is used as a property/key name rather than a standalone expression.
 * Covers: foo.arguments, { arguments: v }, { arguments }, arguments?: T, etc.
 */
function isPropertyName(n: ts.Identifier): boolean {
  const parent = n.parent;
  if (!parent) return false;
  if (ts.isPropertyAccessExpression(parent) && parent.name === n) return true;
  if (ts.isPropertyAssignment(parent) && parent.name === n) return true;
  if (ts.isShorthandPropertyAssignment(parent) && parent.name === n) return true;
  if (ts.isBindingElement(parent) && parent.propertyName === n) return true;
  if (ts.isPropertySignature(parent) && parent.name === n) return true;
  if (ts.isPropertyDeclaration(parent) && parent.name === n) return true;
  if (ts.isMethodDeclaration(parent) && parent.name === n) return true;
  if (ts.isMethodSignature(parent) && parent.name === n) return true;
  return false;
}

function getBody(node: ts.Node): ts.Node | undefined {
  if (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node)
  ) {
    return node.body;
  }
  if (ts.isArrowFunction(node)) {
    return node.body;
  }
  return undefined;
}

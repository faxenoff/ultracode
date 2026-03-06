import { describe, expect, it } from "bun:test";
import { diff3Merge } from "../engine/diff3.js";

describe("diff3Merge", () => {
  it("should return no conflicts for identical versions", () => {
    const content = "line1\nline2\nline3";
    const result = diff3Merge(content, content, content);

    expect(result.hasConflicts).toBe(false);
    expect(result.conflictCount).toBe(0);
    expect(result.mergedContent).toBe(content);
  });

  it("should auto-merge when only branchA changed", () => {
    const base = "line1\nline2\nline3";
    const branchA = "line1\nmodified\nline3";
    const branchB = "line1\nline2\nline3";

    const result = diff3Merge(base, branchA, branchB);

    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toBe("line1\nmodified\nline3");
  });

  it("should auto-merge when only branchB changed", () => {
    const base = "line1\nline2\nline3";
    const branchA = "line1\nline2\nline3";
    const branchB = "line1\nline2\nmodified";

    const result = diff3Merge(base, branchA, branchB);

    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toBe("line1\nline2\nmodified");
  });

  it("should auto-merge when both branches change different regions", () => {
    const base = "line1\nline2\nline3\nline4\nline5";
    const branchA = "CHANGED1\nline2\nline3\nline4\nline5";
    const branchB = "line1\nline2\nline3\nline4\nCHANGED5";

    const result = diff3Merge(base, branchA, branchB);

    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toBe("CHANGED1\nline2\nline3\nline4\nCHANGED5");
  });

  it("should auto-merge when both branches make the same change", () => {
    const base = "line1\nline2\nline3";
    const branchA = "line1\nsame-change\nline3";
    const branchB = "line1\nsame-change\nline3";

    const result = diff3Merge(base, branchA, branchB);

    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toBe("line1\nsame-change\nline3");
  });

  it("should detect conflict when both branches change same region differently", () => {
    const base = "line1\nline2\nline3";
    const branchA = "line1\nchangeA\nline3";
    const branchB = "line1\nchangeB\nline3";

    const result = diff3Merge(base, branchA, branchB);

    expect(result.hasConflicts).toBe(true);
    expect(result.conflictCount).toBe(1);
    expect(result.mergedContent).toContain("<<<<<<< branchA");
    expect(result.mergedContent).toContain("changeA");
    expect(result.mergedContent).toContain("=======");
    expect(result.mergedContent).toContain("changeB");
    expect(result.mergedContent).toContain(">>>>>>> branchB");
  });

  it("should include base section in conflict markers when showBase is true", () => {
    const base = "line1\noriginal\nline3";
    const branchA = "line1\nchangeA\nline3";
    const branchB = "line1\nchangeB\nline3";

    const result = diff3Merge(base, branchA, branchB, { showBase: true });

    expect(result.mergedContent).toContain("||||||| base");
    expect(result.mergedContent).toContain("original");
  });

  it("should omit base section when showBase is false", () => {
    const base = "line1\noriginal\nline3";
    const branchA = "line1\nchangeA\nline3";
    const branchB = "line1\nchangeB\nline3";

    const result = diff3Merge(base, branchA, branchB, { showBase: false });

    expect(result.mergedContent).not.toContain("|||||||");
  });

  it("should use custom labels", () => {
    const base = "line1\noriginal\nline3";
    const branchA = "line1\nchangeA\nline3";
    const branchB = "line1\nchangeB\nline3";

    const result = diff3Merge(base, branchA, branchB, {
      labelA: "feature/auth",
      labelB: "feature/api",
      labelBase: "main",
    });

    expect(result.mergedContent).toContain("<<<<<<< feature/auth");
    expect(result.mergedContent).toContain("||||||| main");
    expect(result.mergedContent).toContain(">>>>>>> feature/api");
  });

  it("should handle empty base with identical branches", () => {
    const result = diff3Merge("", "same content", "same content");

    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toBe("same content");
  });

  it("should handle empty base with different branches as conflict", () => {
    const result = diff3Merge("", "contentA", "contentB");

    expect(result.hasConflicts).toBe(true);
    expect(result.conflictCount).toBe(1);
  });

  it("should handle all three empty", () => {
    const result = diff3Merge("", "", "");

    expect(result.hasConflicts).toBe(false);
    expect(result.conflictCount).toBe(0);
    expect(result.mergedContent).toBe("");
  });

  it("should handle large common prefix and suffix efficiently", () => {
    const prefix = Array.from({ length: 100 }, (_, i) => `prefix-line-${i}`).join("\n");
    const suffix = Array.from({ length: 100 }, (_, i) => `suffix-line-${i}`).join("\n");
    const base = `${prefix}\nmiddle\n${suffix}`;
    const branchA = `${prefix}\nchangedA\n${suffix}`;
    const branchB = `${prefix}\nchangedB\n${suffix}`;

    const result = diff3Merge(base, branchA, branchB);

    expect(result.hasConflicts).toBe(true);
    expect(result.conflictCount).toBe(1);
    // Prefix and suffix should be preserved
    expect(result.mergedContent).toContain("prefix-line-0");
    expect(result.mergedContent).toContain("suffix-line-99");
  });

  it("should auto-merge additions at different positions", () => {
    const base = "line1\nline2\nline3";
    const branchA = "newA\nline1\nline2\nline3";
    const branchB = "line1\nline2\nline3\nnewB";

    const result = diff3Merge(base, branchA, branchB);

    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toContain("newA");
    expect(result.mergedContent).toContain("newB");
  });

  it("should handle deletions in one branch", () => {
    const base = "line1\nline2\nline3\nline4";
    const branchA = "line1\nline4"; // deleted lines 2-3
    const branchB = "line1\nline2\nline3\nline4"; // unchanged

    const result = diff3Merge(base, branchA, branchB);

    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toBe("line1\nline4");
  });

  it("should return correct region types", () => {
    const base = "unchanged\nbase\nunchanged2";
    const branchA = "unchanged\nchangedA\nunchanged2";
    const branchB = "unchanged\nbase\nunchanged2";

    const result = diff3Merge(base, branchA, branchB);

    const types = result.regions.map((r) => r.type);
    expect(types).toContain("unchanged");
    expect(types).toContain("branchA");
    expect(types).not.toContain("conflict");
  });

  it("should handle multiple non-overlapping changes from both branches", () => {
    const base = "a\nb\nc\nd\ne";
    const branchA = "A\nb\nc\nd\ne"; // changed first line
    const branchB = "a\nb\nc\nd\nE"; // changed last line

    const result = diff3Merge(base, branchA, branchB);

    expect(result.hasConflicts).toBe(false);
    expect(result.mergedContent).toBe("A\nb\nc\nd\nE");
  });
});

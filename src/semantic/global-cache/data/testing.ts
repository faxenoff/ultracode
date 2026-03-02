/**
 * Testing Framework Patterns (Jest, Vitest, Mocha, Chai, Playwright, Cypress)
 *
 * Testing functions are real entities parsed from user code and have
 * predictable embeddingText signatures — perfect for global cache hits.
 */

import type { GlobalCacheEntry } from "../types.js";

/**
 * Jest / Vitest / Jasmine shared testing primitives
 */
export const TESTING_PATTERNS: GlobalCacheEntry[] = [
  // Test suites — these are parsed as function entities
  {
    text: "describe",
    embeddingText: "describe function\ndescription: defines a test suite grouping related tests",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "describe.each",
    embeddingText: "describe.each function\ndescription: parameterized test suite run for each dataset",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "describe.only",
    embeddingText: "describe.only function\ndescription: focused test suite runs only this block",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "describe.skip",
    embeddingText: "describe.skip function\ndescription: skipped test suite",
    category: "pattern",
    language: "javascript",
  },

  // Individual tests
  {
    text: "it",
    embeddingText: "it function\ndescription: defines a single test case assertion",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "test",
    embeddingText: "test function\ndescription: defines a single test case assertion",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "it.each",
    embeddingText: "it.each function\ndescription: parameterized test case run for each dataset",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "test.each",
    embeddingText: "test.each function\ndescription: parameterized test case run for each dataset",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "it.only",
    embeddingText: "it.only function\ndescription: focused test runs only this case",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "test.only",
    embeddingText: "test.only function\ndescription: focused test runs only this case",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "it.skip",
    embeddingText: "it.skip function\ndescription: skipped test case",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "test.skip",
    embeddingText: "test.skip function\ndescription: skipped test case",
    category: "pattern",
    language: "javascript",
  },

  // Lifecycle hooks
  {
    text: "beforeEach",
    embeddingText: "beforeEach function\ndescription: runs setup before each test case in the suite",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "afterEach",
    embeddingText: "afterEach function\ndescription: runs cleanup after each test case in the suite",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "beforeAll",
    embeddingText: "beforeAll function\ndescription: runs once before all tests in the suite",
    category: "pattern",
    language: "javascript",
  },
  {
    text: "afterAll",
    embeddingText: "afterAll function\ndescription: runs once after all tests in the suite",
    category: "pattern",
    language: "javascript",
  },

  // Assertions
  { text: "expect", category: "pattern", language: "javascript" },
  { text: "expect().toBe", category: "pattern", language: "javascript" },
  { text: "expect().toEqual", category: "pattern", language: "javascript" },
  { text: "expect().toBeTruthy", category: "pattern", language: "javascript" },
  { text: "expect().toBeFalsy", category: "pattern", language: "javascript" },
  { text: "expect().toBeNull", category: "pattern", language: "javascript" },
  { text: "expect().toBeUndefined", category: "pattern", language: "javascript" },
  { text: "expect().toBeDefined", category: "pattern", language: "javascript" },
  { text: "expect().toContain", category: "pattern", language: "javascript" },
  { text: "expect().toHaveLength", category: "pattern", language: "javascript" },
  { text: "expect().toThrow", category: "pattern", language: "javascript" },
  { text: "expect().toHaveBeenCalled", category: "pattern", language: "javascript" },
  { text: "expect().toHaveBeenCalledWith", category: "pattern", language: "javascript" },
  { text: "expect().resolves", category: "pattern", language: "javascript" },
  { text: "expect().rejects", category: "pattern", language: "javascript" },
  { text: "expect().toMatchSnapshot", category: "pattern", language: "javascript" },
  { text: "expect().toMatchInlineSnapshot", category: "pattern", language: "javascript" },

  // Mocking (Jest)
  { text: "jest.fn", category: "framework", language: "javascript" },
  { text: "jest.mock", category: "framework", language: "javascript" },
  { text: "jest.spyOn", category: "framework", language: "javascript" },
  { text: "jest.clearAllMocks", category: "framework", language: "javascript" },
  { text: "jest.resetAllMocks", category: "framework", language: "javascript" },
  { text: "jest.restoreAllMocks", category: "framework", language: "javascript" },
  { text: "jest.useFakeTimers", category: "framework", language: "javascript" },
  { text: "jest.useRealTimers", category: "framework", language: "javascript" },
  { text: "jest.runAllTimers", category: "framework", language: "javascript" },
  { text: "jest.advanceTimersByTime", category: "framework", language: "javascript" },

  // Mocking (Vitest)
  { text: "vi.fn", category: "framework", language: "javascript" },
  { text: "vi.mock", category: "framework", language: "javascript" },
  { text: "vi.spyOn", category: "framework", language: "javascript" },
  { text: "vi.clearAllMocks", category: "framework", language: "javascript" },
  { text: "vi.useFakeTimers", category: "framework", language: "javascript" },
  { text: "vi.advanceTimersByTime", category: "framework", language: "javascript" },

  // Mocha / Chai
  { text: "assert.equal", category: "pattern", language: "javascript" },
  { text: "assert.deepEqual", category: "pattern", language: "javascript" },
  { text: "assert.throws", category: "pattern", language: "javascript" },
  { text: "chai.expect", category: "framework", language: "javascript" },
  { text: "should.equal", category: "framework", language: "javascript" },

  // Playwright
  { text: "test.describe", category: "framework", language: "typescript", framework: "playwright" },
  { text: "page.goto", category: "framework", language: "typescript", framework: "playwright" },
  { text: "page.click", category: "framework", language: "typescript", framework: "playwright" },
  { text: "page.fill", category: "framework", language: "typescript", framework: "playwright" },
  { text: "expect(page).toHaveURL", category: "framework", language: "typescript", framework: "playwright" },
  { text: "expect(page).toHaveTitle", category: "framework", language: "typescript", framework: "playwright" },

  // Common test imports
  { text: "import { describe, it, expect } from 'vitest'", category: "pattern", language: "javascript" },
  { text: "import { describe, expect, test } from '@jest/globals'", category: "pattern", language: "javascript" },
];

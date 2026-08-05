# src/utils/__tests__

## 🤖 Overview

The `src/utils/__tests__` module contains test cases for the `BloomFilter` class, focusing on its basic operations and typical use cases. Developers and QA engineers use this module to verify the correctness and performance of the Bloom Filter implementation.

## 🤖 Architecture

```
BloomFilter
├── add() — adds an item to the filter
├── mightContain() — checks if an item might be in the filter
└── constructor() — initializes the Bloom Filter with a specified size
```

## 🤖 Flow

```
BloomFilter
├── add() → adds an item to the filter
│   └── updates the filter's internal hash tables
├── mightContain() → checks if an item might be in the filter
│   └── hashes the item and checks the filter's hash tables
└── constructor() → initializes the filter with a specified size
```

## 🤖 Entity Listing

### Function
- **baseResults** — Creates an array of base results with unique IDs and names `optimizations-benchmark.ts:187-190`
- **benchmark** — Measures the average time taken to execute a function multiple times, with a warmup phase `optimizations-benchmark.ts:145-159`
- **deduplicateNew** — O(n) deduplication function `optimizations-benchmark.ts:27-44`
- **deduplicateOld** — O(n²) deduplication function `optimizations-benchmark.ts:16-25`
- **formatSpeedup** — Formats the speedup or slowdown ratio between two times as a string `optimizations-benchmark.ts:161-168`
- **getHistoryNew** — Efficiently filters snapshots using binary search to find the first snapshot with a timestamp greater than or equal to the cutoff `optimizations-benchmark.ts:85-99`
- **getHistoryOld** — Filters snapshots to include only those with timestamps greater than or equal to the cutoff `optimizations-benchmark.ts:81-83`
- **index** — Finds the index of a subscription in an array of subscriptions by subscription ID `optimizations-benchmark.ts:112-112`, `optimizations-benchmark.ts:131-131`
- **items** — Represents a set of items that can be added to a Bloom filter `bloom-filter.test.ts:82-82`, `bloom-filter.test.ts:104-104`, `bloom-filter.test.ts:126-126`
- **matchTopicNew** — O(log n) match topic function `optimizations-benchmark.ts:60-70`
- **matchTopicOld** — O(n) match topic function `optimizations-benchmark.ts:50-57`
- **newTime** — Benchmarks the time taken to deduplicate new results `optimizations-benchmark.ts:204-204`
- **newTime** — Measures the time taken for the new deduplication function `optimizations-benchmark.ts:239-245`, `optimizations-benchmark.ts:275-275`, `optimizations-benchmark.ts:332-336`
- **oldTime** — Benchmarks the time taken to deduplicate old results `optimizations-benchmark.ts:203-203`
- **oldTime** — Measures the time taken for the old deduplication function `optimizations-benchmark.ts:227-233`, `optimizations-benchmark.ts:274-274`, `optimizations-benchmark.ts:322-326`
- **snapshots** — Represents a collection of timestamped values `optimizations-benchmark.ts:265-268`
- **subsNew** — Represents the new subscription data `optimizations-benchmark.ts:317-317`
- **subsOld** — Represents the old subscription data `optimizations-benchmark.ts:316-316`
- **topics** — Creates an array of topics in the format "agent.x.status" `optimizations-benchmark.ts:219-219`
- **unsubscribeNew** — Removes a subscription from a map of subscriptions and updates a map of subscription IDs to topics `optimizations-benchmark.ts:121-139`
- **unsubscribeOld** — Removes a subscription from a map of subscriptions by subscription ID `optimizations-benchmark.ts:110-119`

### Interface
- **Entity** — Represents an entity with an ID and a name `optimizations-benchmark.ts:11-14`
- **Snapshot** — Represents a snapshot with a timestamp and a value `optimizations-benchmark.ts:76-79`
- **Subscription** — Represents a subscription with an ID and a topic `optimizations-benchmark.ts:105-108`

### Import_decl
- **../bloom-filter.js** — Imports `../bloom-filter.js` from `../bloom-filter.js`. `bloom-filter.test.ts:2-2`
- **bun:test** — Imports `bun:test` from `bun:test`. `bloom-filter.test.ts:1-1`

### Property
- **id** — Unique identifier for an entity `optimizations-benchmark.ts:12-12`, `optimizations-benchmark.ts:106-106`
- **name** — Name of an entity `optimizations-benchmark.ts:13-13`
- **timestamp** — Timestamp of a snapshot `optimizations-benchmark.ts:77-77`
- **topic** — Topic of a subscription `optimizations-benchmark.ts:107-107`
- **value** — Value of a snapshot `optimizations-benchmark.ts:78-78`

## Bloom Filter Test Suite

- **describe** — `bloom-filter.test.ts:4-200` — Root test suite for Bloom filter functionality validating creation, insertion, membership queries, false positive rates, collision behavior, and string input handling across diverse test scenarios.

### Creation and Insertion Tests

- **it** — `bloom-filter.test.ts:5-45` — Test group for basic creation and insertion operations, validating filter initialization and correct element storage.
- **bloom** — `bloom-filter.test.ts:6-11` — Verifies basic Bloom filter creation and single-element insertion.
- **bloom** — `bloom-filter.test.ts:13-17` — Validates sequential insertion of multiple elements and presence verification for all added items.
- **bloom** — `bloom-filter.test.ts:19-29` — Confirms that added elements are retrievable while non-added elements are correctly reported as absent.
- **bloom** — `bloom-filter.test.ts:31-44` — Tests numeric ID input storage and retrieval to validate non-string element handling.

### Membership Query Tests

- **it** — `bloom-filter.test.ts:47-65` — Test group for membership query operations, verifying has() method accuracy for single elements, batches, and negative queries.
- **bloom** — `bloom-filter.test.ts:48-51` — Tests single-element membership query accuracy.
- **bloom** — `bloom-filter.test.ts:53-57` — Validates batch membership verification for multiple elements.
- **bloom** — `bloom-filter.test.ts:59-64` — Confirms negative queries correctly identify non-member elements.

### False Positive Rate Tests

- **it** — `bloom-filter.test.ts:67-77` — Test group for false positive rate measurement with standard dataset and random non-member queries.
- **bloom** — `bloom-filter.test.ts:68-76` — Creates a 1000-element filter and measures false positive frequency against random queries.

### Filter Size and Scaling Tests

- **it** — `bloom-filter.test.ts:79-137` — Test group comparing false positive rates and scaling behavior across different filter capacities.
- **bloom** — `bloom-filter.test.ts:80-98` — Measures false positive count for a standard-capacity filter against generated test items.
- **_** — `bloom-filter.test.ts:82-82` — Collection of generated test items for false positive measurement.
- **smallBloom** — `bloom-filter.test.ts:100-122` — Creates a reduced-capacity Bloom filter for comparative false positive analysis.
- **_** — `bloom-filter.test.ts:104-104` — Test items generated for small filter comparison.
- **bloom** — `bloom-filter.test.ts:124-136` — Analyzes false positive rate scaling across different filter sizes.
- **_** — `bloom-filter.test.ts:126-126` — Test data for filter size comparison analysis.

### Collision and Overlap Tests

- **it** — `bloom-filter.test.ts:139-158` — Test group for collision and overlap behavior verification between independent filters.
- **bloom** — `bloom-filter.test.ts:140-144` — Creates two filters with overlapping elements and detects intersection.
- **bloom** — `bloom-filter.test.ts:146-151` — Creates two filters with completely unique elements to verify no false overlap detection.
- **bloom** — `bloom-filter.test.ts:153-157` — Verifies no false overlaps occur when querying random non-member elements.

### String Input and Similarity Tests

- **it** — `bloom-filter.test.ts:160-199` — Test group for string input handling and similarity detection with diverse character sets and lengths.
- **bloom** — `bloom-filter.test.ts:161-165` — Validates text-based insertion and query operations with string elements.
- **bloom** — `bloom-filter.test.ts:167-176` — Tests encoding robustness with varied string inputs including special characters.
- **bloom** — `bloom-filter.test.ts:178-183` — Validates performance with extended string lengths.
- **bloom** — `bloom-filter.test.ts:185-198` — Detects similar string matches to test substring and variation handling.

## Optimization Benchmark Suite

### Benchmark Execution Framework

- **benchmark** — `optimizations-benchmark.ts:145-159` — Executes timing comparison between two implementations over multiple iterations, calculating speedup ratio and reporting aggregate results.

### Deduplication Optimization

- **deduplicateOld** — `optimizations-benchmark.ts:16-25` — Legacy deduplication implementation using nested loop comparison with O(n²) time complexity.
- **<anonymous>** — `optimizations-benchmark.ts:16-16` — Anonymous wrapper function for legacy deduplication baseline.
- **e** — `optimizations-benchmark.ts:20-20` — Loop variable referencing array elements during deduplication comparison.
- **deduplicateNew** — `optimizations-benchmark.ts:27-44` — Optimized deduplication using Set-based lookup achieving O(n) time complexity.
- **<anonymous>** — `optimizations-benchmark.ts:27-27` — Anonymous wrapper function for optimized deduplication implementation.

### Topic Matching Optimization

- **matchTopicOld** — `optimizations-benchmark.ts:50-57` — Legacy topic matching using regex object creation on every invocation, causing recompilation overhead.
- **<anonymous>** — `optimizations-benchmark.ts:50-50` — Anonymous wrapper function for legacy topic matching baseline.

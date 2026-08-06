# tests/fixtures

## Overview

This module provides a comprehensive collection of intentional Python antipatterns for testing code detection and analysis tools. Each function and class demonstrates a specific code smell, security vulnerability, performance issue, or design flaw across error handling, type safety, security, data science libraries (pandas, NumPy, scikit-learn, matplotlib), concurrency, and resource management. The fixtures serve as ground truth test cases for validating antipattern detection capabilities.

## Entity listing

### Error handling antipatterns

- **swallowed_exception** — `python-antipatterns.py:13-20` — Demonstrates bare exception handler that silently catches and ignores all exceptions.
- **generic_raise** — `python-antipatterns.py:20-25` — Demonstrates raising generic Exception instead of specific exception types.
- **wide_try_block** — `python-antipatterns.py:25-42` — Demonstrates overly broad try/except block covering multiple unrelated operations.

### Type safety antipatterns

- **type_ignore_abuse** — `python-antipatterns.py:44-50` — Demonstrates excessive use of `# type: ignore` comments to suppress type checking.
- **any_abuse** — `python-antipatterns.py:52-56` — Demonstrates overuse of `typing.Any` type hint that defeats static type checking.

### Security antipatterns

- **eval_usage** — `python-antipatterns.py:58-64` — Demonstrates dangerous use of eval() and exec() with untrusted input.
- **subprocess_shell** — `python-antipatterns.py:64-68` — Demonstrates unsafe subprocess execution with shell=True parameter.
- **sql_injection** — `python-antipatterns.py:68-73` — Demonstrates SQL injection vulnerability from string concatenation in queries.
- **pickle_load_untrusted** — `python-antipatterns.py:73-78` — Demonstrates unsafe deserialization of untrusted pickle data.
- **yaml_load_unsafe** — `python-antipatterns.py:78-82` — Demonstrates unsafe YAML loading using unsafe loader with untrusted data.

### Pandas antipatterns

- **pd_iterrows_usage** — `python-antipatterns.py:84-89` — Demonstrates inefficient row-by-row iteration over DataFrames.
- **pd_append_loop** — `python-antipatterns.py:89-95` — Demonstrates inefficient DataFrame construction through repeated append operations.
- **pd_chained_indexing** — `python-antipatterns.py:95-99` — Demonstrates chained indexing which may produce unpredictable results or SettingWithCopyWarning.
- **pd_inplace** — `python-antipatterns.py:99-103` — Demonstrates problematic use of inplace=True parameter.
- **pd_nan_compare** — `python-antipatterns.py:103-108` — Demonstrates incorrect comparison logic using == on NaN values.
- **pd_read_csv_no_dtype** — `python-antipatterns.py:108-113` — Demonstrates CSV reading without dtype specification causing type inference issues.

### NumPy antipatterns

- **np_loop_access** — `python-antipatterns.py:115-121` — Demonstrates inefficient element-by-element array access in loops instead of vectorized operations.
- **np_float_cmp** — `python-antipatterns.py:121-128` — Demonstrates direct floating-point equality comparison without tolerance.
- **np_append_loop** — `python-antipatterns.py:128-135` — Demonstrates inefficient array construction through repeated append operations.

### Scikit-learn antipatterns

- **sk_data_leakage** — `python-antipatterns.py:137-144` — Demonstrates data leakage in machine learning pipeline by fitting scaler on entire dataset before train/test split.
- **sk_no_random_state** — `python-antipatterns.py:144-150` — Demonstrates missing random_state parameter causing non-reproducible results.

### Matplotlib antipatterns

- **plt_no_close_loop** — `python-antipatterns.py:152-161` — Demonstrates unclosed matplotlib figures in loops leading to memory leaks.
- **plt_mixed_api** — `python-antipatterns.py:161-168` — Demonstrates mixing stateful pyplot API with object-oriented API.

### Concurrency antipatterns

- **async_no_await** — `python-antipatterns.py:170-175` — Demonstrates calling async function without await operator.
- **asyncio_run_in_async** — `python-antipatterns.py:175-180` — Demonstrates calling asyncio.run() inside already-async context.
- **threadpool_no_max** — `python-antipatterns.py:180-185` — Demonstrates ThreadPoolExecutor without max_workers limit causing unbounded thread creation.
- **gil_thread_cpu** — `python-antipatterns.py:185-191` — Demonstrates using threads for CPU-bound work which is serialized by GIL.

### API design antipatterns

- **many_positional_args** — `python-antipatterns.py:193-197` — Demonstrates function with excessive number of positional arguments.
- **bool_trap** — `python-antipatterns.py:197-201` — Demonstrates boolean parameter making function calls ambiguous without documentation.

### Resource management antipatterns

- **open_no_encoding** — `python-antipatterns.py:201-208` — Demonstrates file operations without explicit encoding specification.
- **ResourceHolder** — `python-antipatterns.py:210-215` — Demonstrates a class with resource management anti-patterns.
- **__del__** — `python-antipatterns.py:211-215` — Demonstrates unreliable resource cleanup using destructor.

### Randomization and validation antipatterns

- **no_random_seed** — `python-antipatterns.py:217-223` — Demonstrates random operations without seeding causing non-reproducible results.
- **test_float_equality** — `python-antipatterns.py:225-230` — Demonstrates direct floating-point equality assertion in tests.

### Performance antipatterns

- **regex_in_loop** — `python-antipatterns.py:232-241` — Demonstrates inefficient regex pattern recompilation inside loop instead of pre-compiling.
- **string_concat_loop** — `python-antipatterns.py:241-246` — Demonstrates inefficient string concatenation through repeated += operations in loops.

## Dependencies

External library imports used in fixtures: `pickle`, `subprocess`, `yaml`, `asyncio`, `random`, `concurrent.futures.ThreadPoolExecutor`. No internal module dependencies.
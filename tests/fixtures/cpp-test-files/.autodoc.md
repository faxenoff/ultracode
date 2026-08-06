# C++ Test Fixtures

## Overview

This module provides a comprehensive collection of C++ test fixtures demonstrating object-oriented design, mathematical operations, modern language features (C++11 and beyond), and generic template programming. The fixtures serve as reference implementations for parsing and semantic analysis of C++ code across multiple paradigms: basic classes with inheritance, numeric and container templates, lambda expressions, async operations, and RAII patterns.

## Organization

### Basic Object-Oriented Programming (`basic_classes.cpp`)

Foundational classes demonstrating encapsulation, inheritance, and polymorphism.

**Classes:**
- **Rectangle** — `basic_classes.cpp:7-36` — Geometric shape with width and height properties, computing area and perimeter
- **Square** — `basic_classes.cpp:39-51` — Specialized rectangle with equal sides
- **Shape** — `basic_classes.cpp:54-60` — Abstract base defining area, perimeter, and draw operations
- **Drawable** — `basic_classes.cpp:63-68` — Interface for color assignment operations
- **ColoredRectangle** — `basic_classes.cpp:70-85` — Composite class combining Rectangle with color property and Drawable interface
- **Vector2D** — `basic_classes.cpp:88-118` — 2D vector with construction, component access, and magnitude calculation
- **FileHandler** — `basic_classes.cpp:121-164` — Resource manager for file I/O with open/close lifecycle

**Methods - Rectangle:**
- **Rectangle** — `basic_classes.cpp:15-15` — Constructor accepting width and height
- **area** — `basic_classes.cpp:17-19` — Computes width × height
- **perimeter** — `basic_classes.cpp:21-23` — Computes 2 × (width + height)
- **Rectangle** — `basic_classes.cpp:26-28` — Default constructor initialization
- **getWidth** — `basic_classes.cpp:31-31` — Property accessor for width
- **getHeight** — `basic_classes.cpp:32-32` — Property accessor for height
- **setWidth** — `basic_classes.cpp:34-34` — Width mutator
- **setHeight** — `basic_classes.cpp:35-35` — Height mutator

**Methods - Square:**
- **perimeter** — `basic_classes.cpp:43-45` — Overridden perimeter for equal-sided square
- **setSide** — `basic_classes.cpp:47-50` — Sets both dimensions to single value

**Methods - Shape:**
- **Shape** — `basic_classes.cpp:56-56` — Constructor
- **area** — `basic_classes.cpp:57-57` — Pure virtual area method
- **perimeter** — `basic_classes.cpp:58-58` — Pure virtual perimeter method
- **draw** — `basic_classes.cpp:59-59` — Pure virtual drawing operation

**Methods - Drawable:**
- **Drawable** — `basic_classes.cpp:65-65` — Constructor
- **setColor** — `basic_classes.cpp:66-66` — Pure virtual color assignment
- **std** — `basic_classes.cpp:67-67` — String conversion

**Methods - ColoredRectangle:**
- **setColor** — `basic_classes.cpp:78-80` — Sets internal color field
- **std** — `basic_classes.cpp:82-84` — Returns formatted string with dimensions and color

**Methods - Vector2D:**
- **Vector2D** — `basic_classes.cpp:96-98` — Constructor with x, y components
- **Vector2D** — `basic_classes.cpp:100-104` — Component accessor methods
- **Vector2D** — `basic_classes.cpp:106-108` — Copy constructor
- **std** — `basic_classes.cpp:110-113` — Stream output operator
- **magnitude** — `basic_classes.cpp:115-117` — Euclidean norm √(x² + y²)

**Methods - FileHandler:**
- **FileHandler** — `basic_classes.cpp:134-138` — Constructor with filename
- **FileHandler** — `basic_classes.cpp:142-143` — Destructor closing file resource
- **FileHandler** — `basic_classes.cpp:150-160` — Write operation with error handling
- **isOpen** — `basic_classes.cpp:162-162` — Boolean file state check
- **std** — `basic_classes.cpp:163-163` — Destructor output

### Mathematical Utilities (`math_utils.hpp`)

Template-based numeric and statistical operations for domain-specific calculations.

**Constants:**
- **define** — `math_utils.hpp:2-3` — PI constant definition

**Free Functions:**
- **deg_to_rad** — `math_utils.hpp:14-14` — Angle conversion from degrees
- **rad_to_deg** — `math_utils.hpp:15-15` — Angle conversion to degrees
- **T** — `math_utils.hpp:18-19` — Template square root function
- **T** — `math_utils.hpp:21-22` — Template absolute value function
- **T** — `math_utils.hpp:123-125` — Template matrix determinant calculation
- **T** — `math_utils.hpp:128-130` — Template inverse matrix computation

**Classes:**
- **Vector3D** — `math_utils.hpp:26-51` — 3D vector with element access (x, y, z) and arithmetic
- **ComplexMath** — `math_utils.hpp:54-63` — Complex number operations (construction, magnitude, phase)
- **Statistics** — `math_utils.hpp:66-79` — Statistical analysis (mean, variance, median, standard deviation, correlation)
- **Matrix** — `math_utils.hpp:83-111` — Templated 2D matrix with construction, transpose, and element access

**Methods - Vector3D:**
- **Vector3D** — `math_utils.hpp:44-45` — Constructor with x, y, z components
- **Vector3D** — `math_utils.hpp:45-46` — Constructor from array
- **T** — `math_utils.hpp:46-47` — Component accessor
- **setX** — `math_utils.hpp:39-39` — X coordinate mutator
- **setY** — `math_utils.hpp:40-40` — Y coordinate mutator
- **setZ** — `math_utils.hpp:41-41` — Z coordinate mutator
- **T** — `math_utils.hpp:47-47` — Dot product operation
- **Vector3D** — `math_utils.hpp:48-48` — Cross product operation
- **T** — `math_utils.hpp:49-49` — Magnitude calculation
- **Vector3D** — `math_utils.hpp:50-50` — Normalized unit vector

**Methods - ComplexMath:**
- **Complex** — `math_utils.hpp:58-58` — Constructor from real, imaginary parts
- **Complex** — `math_utils.hpp:59-59` — Polar form constructor
- **magnitude** — `math_utils.hpp:60-60` — Modulus |z|
- **phase** — `math_utils.hpp:61-61` — Argument θ
- **Complex** — `math_utils.hpp:62-62` — Conjugate operation

**Methods - Statistics:**
- **mean** — `math_utils.hpp:69-69` — Arithmetic average of dataset
- **variance** — `math_utils.hpp:72-72` — Dispersion measure σ²
- **median** — `math_utils.hpp:75-75` — Middle value of sorted dataset
- **standard_deviation** — `math_utils.hpp:77-77` — Root mean square deviation
- **correlation** — `math_utils.hpp:78-78` — Pearson correlation between vectors

**Methods - Matrix:**
- **Matrix** — `math_utils.hpp:92-93` — Constructor from row, column counts
- **size_t** — `math_utils.hpp:94-95` — Row count accessor
- **size_t** — `math_utils.hpp:95-96` — Column count accessor
- **Matrix** — `math_utils.hpp:97-98` — Transpose operation
- **Matrix** — `math_utils.hpp:98-99` — Deep copy constructor
- **Matrix** — `math_utils.hpp:101-102` — Multiplication operation
- **T** — `math_utils.hpp:103-104` — Element accessor by coordinates
- **T** — `math_utils.hpp:34-34` — X component getter
- **T** — `math_utils.hpp:35-35` — Y component getter
- **T** — `math_utils.hpp:36-36` — Z component getter
- **Matrix** — `math_utils.hpp:105-105` — Determinant calculation
- **T** — `math_utils.hpp:106-106` — Matrix inverse
- **Matrix** — `math_utils.hpp:107-107` — Matrix inversion in-place
- **size_t** — `math_utils.hpp:109-109` — Rank computation
- **size_t** — `math_utils.hpp:110-110` — Null space dimension

**Type Aliases:**
- **Complex** — `math_utils.hpp:56-56` — Complex number as pair of doubles
- **Matrix2d** — `math_utils.hpp:114-114` — 2×2 matrix specialization
- **Matrix3d** — `math_utils.hpp:115-115` — 3×3 matrix specialization
- **Matrix4d** — `math_utils.hpp:116-116` — 4×4 matrix specialization

**Macros:**
- **define** — `math_utils.hpp:133-134` — PI radian constant
- **define** — `math_utils.hpp:134-135` — Euler's number
- **define** — `math_utils.hpp:135-136` — Golden ratio

### Modern C++ Features (`modern_cpp.cpp`)

Demonstrations of contemporary language features: lambdas, variadic templates, structured bindings, async operations, and RAII.

**Classes:**
- **Point** — `modern_cpp.cpp:15-19` — 2D coordinate with aggregate initialization
- **LambdaExamples** — `modern_cpp.cpp:35-60` — Collection of lambda expression patterns (capture, mutable, move semantics)
- **ModernFeatures** — `modern_cpp.cpp:63-140` — Structured bindings, variadic templates, auto type deduction
- **AsyncExample** — `modern_cpp.cpp:143-158` — Demonstration of std::async and futures
- **ResourceManager** — `modern_cpp.cpp:161-184` — RAII pattern with value semantics (copy/move constructors)
- **ExceptionSafeClass** — `modern_cpp.cpp:187-231` — Exception safety guarantees with strong exception safety

**Free Functions:**
- **T** — `modern_cpp.cpp:23-30` — Template variadic function for generic value handling
- **demonstrate** — `modern_cpp.cpp:37-59` — Lambda capture and scope demonstration
- **process_pairs** — `modern_cpp.cpp:73-81` — Structured binding over container of pairs
- **get_complex_type** — `modern_cpp.cpp:84-89` — Return type deduction with auto
- **fibonacci** — `modern_cpp.cpp:92-95` — Constexpr computation at compile time
- **print_all** — `modern_cpp.cpp:99-102` — Variadic template function for heterogeneous output

**Methods - Point:**
- **Point** — `modern_cpp.cpp:15-19` — Aggregate constructor with x, y initialization

**Methods - LambdaExamples:**
- **demonstrate** — `modern_cpp.cpp:37-59` — Exercise lambda captures (by-value, by-reference, mutable)

**Methods - ModernFeatures:**
- **ModernFeatures** — `modern_cpp.cpp:109-116` — Constructor with parameter validation
- **T** — `modern_cpp.cpp:119-122` — Template generic method
- **set_name** — `modern_cpp.cpp:125-127` — Property setter with string conversion
- **std** — `modern_cpp.cpp:129-131` — String representation method
- **T** — `modern_cpp.cpp:134-139` — Variadic generic method accepting multiple types

**Methods - AsyncExample:**
- **std** — `modern_cpp.cpp:145-150` — Async task launcher returning future
- **demonstrate_async** — `modern_cpp.cpp:152-157` — Async operation execution and result retrieval

**Methods - ResourceManager:**
- **add_value** — `modern_cpp.cpp:171-175` — Append value to internal collection
- **size_t** — `modern_cpp.cpp:177-179` — Size accessor
- **std** — `modern_cpp.cpp:181-183` — Vector move-semantics return

**Methods - ExceptionSafeClass:**
- **ExceptionSafeClass** — `modern_cpp.cpp:205-214` — Constructor with exception-safe initialization
- **size_t** — `modern_cpp.cpp:216-221` — Read-only data accessor
- **size_t** — `modern_cpp.cpp:223-228` — Writable data reference with rollback on exception
- **size_t** — `modern_cpp.cpp:230-230` — Data size query

### Template Metaprogramming (`templates.cpp`)

Generic implementations showcasing templates, specialization, and compile-time computation.

**Classes:**
- **Stack** — `templates.cpp:22-54` — LIFO container template with push, pop operations
- **Stack** — `templates.cpp:58-83` — Alternative Stack specialization (likely for specific type)
- **Printable** — `templates.cpp:107-111` — Trait class for printable type detection
- **Container** — `templates.cpp:114-120` — Generic container wrapper
- **unique_ptr** — `templates.cpp:124-180` — Move-only smart pointer with exclusive ownership
- **Array** — `templates.cpp:201-220` — Fixed-size array template with bounds checking

**Free Functions:**
- **T** — `templates.cpp:9-12` — Template function with SFINAE constraint
- **T** — `templates.cpp:15-18` — Alternative template overload
- **T** — `templates.cpp:123-125` — Delete operator overload for smart pointer
- **T** — `templates.cpp:128-130` — Placement new allocator function
- **Args** — `templates.cpp:86-90` — Variadic template parameter pack expansion
- **is_positive** — `templates.cpp:95-97` — Template predicate for positive values
- **is_positive** — `templates.cpp:101-103` — Specialization for floating-point types
- **Container** — `templates.cpp:114-120` — Container template specialization or instantiation
- **factorial** — `templates.cpp:191-197` — Compile-time factorial via recursion

**Methods - Stack (first definition):**
- **push** — `templates.cpp:27-29` — Insert element at top
- **T** — `templates.cpp:31-38` — Pop with exception on empty
- **empty** — `templates.cpp:40-42` — Boolean emptiness check
- **size_t** — `templates.cpp:44-46` — Element count
- **T** — `templates.cpp:48-53` — Non-const top element access

**Methods - Stack (second definition):**
- **push** — `templates.cpp:63-65` — Insert element at top
- **pop** — `templates.cpp:67-74` — Remove and return top element
- **empty** — `templates.cpp:76-78` — Boolean emptiness check
- **size_t** — `templates.cpp:80-82` — Element count

**Methods - unique_ptr:**
- **unique_ptr** — `templates.cpp:141-148` — Constructor from raw pointer
- **unique_ptr** — `templates.cpp:152-153` — Move constructor
- **ptr** — `templates.cpp:154-156` — Pointer dereference operator
- **ptr** — `templates.cpp:158-160` — Member access operator
- **ptr** — `templates.cpp:177-179` — Release underlying pointer and clear

**Methods - Array:**
- **size_t** — `templates.cpp:208-210` — Bound-checked element accessor
- **size_t** — `templates.cpp:212-214` — Size constant query

---

## Design Patterns

**RAII (Resource Acquisition Is Initialization):** FileHandler, ResourceManager, unique_ptr, and ExceptionSafeClass demonstrate deterministic resource management through constructor/destructor pairing.

**Template Specialization:** Math utilities provide generic template implementations (Vector3D, Matrix, Statistics) with type-specific optimizations. Stack and Array show both primary and specialized template definitions.

**Smart Pointers:** unique_ptr implementation illustrates move semantics and exclusive ownership, contrasting with raw pointer usage in traditional classes.

**Trait Classes:** Printable demonstrates SFINAE-based compile-time type querying for conditional template instantiation.
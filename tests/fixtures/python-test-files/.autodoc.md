# tests/fixtures/python-test-files

## Overview

This module provides a comprehensive test fixture suite for validating Python code parser capabilities across four complexity layers. It systematically exercises language features from basic function and class definitions through advanced abstractions: basic parsing and decorators (Layer 1), async methods and descriptors (Layer 2), inheritance hierarchies and generic types (Layer 3), and design patterns (Layer 4). The fixtures enable parser validation for type annotations, nested structures, method resolution order, and relationship mapping without external dependencies.

## Flow

```
Test Progression by Complexity
Layer 1: Basic          Layer 2: Advanced       Layer 3: Relationships    Layer 4: Patterns
Parsing                Features               & Mapping                 & Recognition
  ↓                        ↓                        ↓                           ↓
Functions with       Async methods,         Inheritance chains,       Singleton, Observer,
decorators      →    Magic methods,    →    Protocols,          →    Factory, Builder,
Simple classes       Descriptors,           Generics,                Strategy, Resource
                     Generators,            Diamond paths,            pooling, weak refs
                     Context managers       Circular deps
```

## Entities

### Layer 1: Basic Parsing

#### Functions
- **complex_function** `layer1_basic_parsing.py:32-39` — Accepts multiple parameter types and returns nested optional collections.
- **generic_function** `layer1_basic_parsing.py:43-47` — Performs type-generic operation without specialization.
- **async_complex_function** `layer1_basic_parsing.py:47-50` — Asynchronous function with complex parameter handling.
- **custom_decorator** `layer1_basic_parsing.py:59-67` — Wrapper function that applies custom decoration logic to target functions.
- **wrapper** `layer1_basic_parsing.py:62-65` — Inner wrapper implementing the actual decoration behavior.
- **parametrized_decorator** `layer1_basic_parsing.py:67-77` — Decorator factory accepting configuration parameters before decoration.
- **decorator** `layer1_basic_parsing.py:69-75` — Closure returning wrapper function for parametrized decoration.
- **wrapper** `layer1_basic_parsing.py:71-74` — Inner wrapper for parametrized decorator that preserves function behavior.
- **heavily_decorated_function** `layer1_basic_parsing.py:81-85` — Function decorated with multiple decorator layers.

#### Classes
- **AdvancedClass** `layer1_basic_parsing.py:89-182` — Demonstrates instance/class/static methods, properties, abstract methods, and async operations.
- **ConcreteClass** `layer1_basic_parsing.py:186-232` — Abstract base implementation with initialization, validation, and factory methods.
- **MixinA** `layer1_basic_parsing.py:236-245` — Mixin providing shared methods for multiple inheritance scenarios.
- **MixinB** `layer1_basic_parsing.py:245-254` — Second mixin with overlapping and unique methods for cooperation testing.
- **MultipleInheritanceClass** `layer1_basic_parsing.py:254-274` — Combines multiple mixins demonstrating method resolution order.
- **OuterClass** `layer1_basic_parsing.py:278-322` — Container class with nested inner classes for hierarchy testing.
- **InnerClass** `layer1_basic_parsing.py:286-307` — Nested class within OuterClass with encapsulation semantics.
- **DeeplyNestedClass** `layer1_basic_parsing.py:301-307` — Nested class within InnerClass for deep nesting validation.
- **LambdaContainer** `layer1_basic_parsing.py:333-351` — Class storing and executing lambda functions and comprehensions.

#### Methods in AdvancedClass
- **__init__** `layer1_basic_parsing.py:95-102` — Constructor initializing instance state.
- **instance_method** `layer1_basic_parsing.py:103-107` — Standard method operating on instance state.
- **_protected_method** `layer1_basic_parsing.py:107-111` — Method with name mangling convention for encapsulation.
- **__private_method** `layer1_basic_parsing.py:111-115` — Truly private method demonstrating name mangling.
- **class_method** `layer1_basic_parsing.py:117-121` — Class method receiving class reference instead of instance.
- **alternative_constructor** `layer1_basic_parsing.py:122-125` — Class method serving as alternative constructor.
- **static_method** `layer1_basic_parsing.py:131-135` — Static method without class or instance binding.
- **static_validator** `layer1_basic_parsing.py:136-140` — Static validation method independent of state.
- **computed_property** `layer1_basic_parsing.py:142-146` — Property returning computed value from getter.
- **computed_property** `layer1_basic_parsing.py:147-153` — Settable property with backing attribute validation.
- **computed_property** `layer1_basic_parsing.py:154-159` — Deletable property with cleanup on deletion.
- **abstract_method** `layer1_basic_parsing.py:161-165` — Abstract method requiring subclass implementation.
- **async_abstract_method** `layer1_basic_parsing.py:166-170` — Asynchronous abstract method for subclass override.
- **decorated_method** `layer1_basic_parsing.py:173-177` — Method with applied decorator modifying behavior.
- **cached_method** `layer1_basic_parsing.py:178-182` — Method with caching decorator for performance optimization.

#### Methods in ConcreteClass
- **__init__** `layer1_basic_parsing.py:189-194` — Constructor implementing base abstract requirements.
- **abstract_method** `layer1_basic_parsing.py:195-199` — Implementation of inherited abstract method.
- **async_abstract_method** `layer1_basic_parsing.py:199-204` — Async implementation of abstract async method.
- **instance_method** `layer1_basic_parsing.py:205-210` — Concrete instance operation with specific behavior.
- **from_config** `layer1_basic_parsing.py:212-220` — Class method creating instance from configuration dictionary.
- **complex_signature_method** `layer1_basic_parsing.py:221-228` — Method with variadic and keyword arguments.

#### Methods in Mixins and Multiple Inheritance
- **mixin_a_method** `layer1_basic_parsing.py:239-242` — MixinA-specific method.
- **shared_method** `layer1_basic_parsing.py:242-245` — Method shared across multiple mixins (MixinA version).
- **mixin_b_method** `layer1_basic_parsing.py:248-251` — MixinB-specific method.
- **shared_method** `layer1_basic_parsing.py:251-254` — Method shared across multiple mixins (MixinB version).
- **__init__** `layer1_basic_parsing.py:257-261` — Constructor in MultipleInheritanceClass.
- **shared_method** `layer1_basic_parsing.py:261-266` — Resolves shared method call through MRO chain.
- **demonstrate_mro** `layer1_basic_parsing.py:266-274` — Method demonstrating method resolution order traversal.

#### Methods in Nested Classes
- **__init__** `layer1_basic_parsing.py:283-286` — Constructor in OuterClass.
- **__init__** `layer1_basic_parsing.py:291-294` — Constructor in InnerClass.
- **inner_method** `layer1_basic_parsing.py:294-297` — Method accessible from inner scope.
- **inner_class_method** `layer1_basic_parsing.py:298-301` — Class method in InnerClass.
- **deeply_nested_method** `layer1_basic_parsing.py:376-380` — Method in DeeplyNestedClass (note: appears in Layer 2 file section but logically belongs to nesting hierarchy).

---

### Layer 2: Advanced Features

#### Classes
- **MagicMethodsClass** `layer2_advanced_features.py:31-241` — Comprehensive implementation of dunder methods for operator overloading, representation, and protocol support.
- **PropertyDescriptorClass** `layer2_advanced_features.py:245-300` — Demonstrates descriptor protocol with custom getters, setters, and deleters.
- **ValidatedDescriptor** `layer2_advanced_features.py:301-332` — Descriptor enforcing validation rules on attribute assignment.
- **ClassWithDescriptors** `layer2_advanced_features.py:332-342` — Uses custom descriptors for attribute access control.
- **AsyncClass** `layer2_advanced_features.py:373-433` — Demonstrates async methods, context managers, iterators, and generator support.
- **IteratorClass** `layer2_advanced_features.py:504-524` — Implements iterator protocol with `__iter__` and `__next__`.
- **SimpleDataClass** `layer2_advanced_features.py:529-535` — Basic dataclass with auto-generated `__init__` and comparison methods.
- **AdvancedDataClass** `layer2_advanced_features.py:536-549` — Dataclass with post-init processing and custom methods.
- **FrozenDataClass** `layer2_advanced_features.py:550-560` — Immutable dataclass with computed distance method.
- **DataClassWithInitVar** `layer2_advanced_features.py:561-576` — Dataclass using `InitVar` for constructor-only fields with post-init handling.
- **CustomNamedTuple** `layer2_advanced_features.py:586-597` — Named tuple subclass with custom methods.
- **SimpleEnum** `layer2_advanced_features.py:601-607` — Enumeration with string values.
- **IntBasedEnum** `layer2_advanced_features.py:607-613` — Enumeration with integer values.
- **AutoEnum** `layer2_advanced_features.py:613-619` — Enumeration with auto-assigned numeric values.
- **FlagEnum** `layer2_advanced_features.py:619-629` — Bit-flag enumeration for bitwise operations.
- **ResourceManager** `layer2_advanced_features.py:659-680` — Context manager for resource lifecycle management.

#### Functions and Generator Functions
- **simple_generator** `layer2_advanced_features.py:437-442` — Generator yielding sequential values.
- **generator_with_send** `layer2_advanced_features.py:442-458` — Generator accepting values via `send()` protocol.
- **generator_with_yield_from** `layer2_advanced_features.py:458-464` — Generator delegating to sub-generators with `yield from`.
- **recursive_generator** `layer2_advanced_features.py:464-480` — Generator recursively traversing nested structures.
- **async_generator** `layer2_advanced_features.py:480-486` — Asynchronous generator yielding values.
- **async_generator_with_send** `layer2_advanced_features.py:486-488` — Async generator supporting value injection.
- **simple_context_manager** `layer2_advanced_features.py:634-645` — Function-based context manager using decorator.
- **async_context_manager** `layer2_advanced_features.py:646-659` — Async context manager using decorator.

#### Methods in AsyncClass
- **deeply_nested_method** `layer2_advanced_features.py:376-380` — Nested method within AsyncClass.
- **async_method** `layer2_advanced_features.py:380-391` — Coroutine method executing asynchronously.
- **async_class_method** `layer2_advanced_features.py:392-397` — Async class method with class-level access.
- **async_static_method** `layer2_advanced_features.py:398-403` — Async static method independent of state.
- **__aenter__** `layer2_advanced_features.py:404-410` — Async context manager entry point.
- **__aexit__** `layer2_advanced_features.py:410-415` — Async context manager exit handler.
- **__aiter__** `layer2_advanced_features.py:416-420` — Async iterator entry point.
- **__anext__** `layer2_advanced_features.py:420-433` — Async iterator next value producer.

#### Methods in IteratorClass
- **__init__** `layer2_advanced_features.py:507-511` — Constructor initializing iterator state.
- **__iter__** `layer2_advanced_features.py:511-515` — Iterator protocol entry returning self.
- **__next__** `layer2_advanced_features.py:515-524` — Iterator protocol next value with StopIteration handling.

#### Methods in Dataclasses
- **__post_init__** `layer2_advanced_features.py:545-549` — AdvancedDataClass post-initialization processing.
- **distance** `layer2_advanced_features.py:556-560` — FrozenDataClass computing geometric distance.
- **__post_init__** `layer2_advanced_features.py:567-576` — DataClassWithInitVar processing InitVar fields.

#### Methods in CustomNamedTuple
- **description** `layer2_advanced_features.py:592-597` — Method returning formatted description string.

#### Methods in ResourceManager
- **__init__** `layer2_advanced_features.py:662-666` — Constructor storing resource reference.
- **__enter__** `layer2_advanced_features.py:666-672` — Context manager entry acquiring resource.
- **__exit__** `layer2_advanced_features.py:672-680` — Context manager exit releasing resource safely.

---

### Layer 3: Relationship Mapping

#### Classes
- **BaseProtocol** `layer3_relationship_mapping.py:44-56` — Protocol defining base method and property interface.
- **ExtendedProtocol** `layer3_relationship_mapping.py:56-63` — Protocol extending BaseProtocol with additional methods.
- **AbstractBaseClass** `layer3_relationship_mapping.py:63-94` — Abstract base with template methods and hooks for subclass customization.
- **MiddleClass** `layer3_relationship_mapping.py:94-125` — Intermediate class between abstract base and concrete implementation.
- **ConcreteImplementation** `layer3_relationship_mapping.py:125-146` — Concrete implementation of abstract interface.
- **MixinA** `layer3_relationship_mapping.py:150-163` — Mixin providing shared and cooperative methods (Layer 3 variant).
- **MixinB** `layer3_relationship_mapping.py:163-177` — Second mixin with method cooperation (Layer 3 variant).
- **MixinC** `layer3_relationship_mapping.py:177-191` — Third mixin extending multiple inheritance complexity.
- **ComplexMultipleInheritance** `layer3_relationship_mapping.py:191-225` — Class combining three mixins with MRO demonstration.
- **DiamondBase** `layer3_relationship_mapping.py:229-239` — Base class in diamond inheritance pattern.
- **DiamondLeft** `layer3_relationship_mapping.py:239-254` — Left branch of diamond pattern.
- **DiamondRight** `layer3_relationship_mapping.py:254-269` — Right branch of diamond pattern.
- **DiamondBottom** `layer3_relationship_mapping.py:269-291` — Bottom class resolving diamond method calls.
- **ImportDependentClass** `layer3_relationship_mapping.py:295-365` — Class using external library imports (datetime, pathlib, json, numpy).
- **CircularReferenceA** `layer3_relationship_mapping.py:365-388` — Class with forward reference to CircularReferenceB.
- **CircularReferenceB** `layer3_relationship_mapping.py:388-419` — Class with backward reference to CircularReferenceA.
- **BaseForOverrides** `layer3_relationship_mapping.py:423-476` — Base class with overridable methods, properties, and class/static methods.
- **ChildWithOverrides** `layer3_relationship_mapping.py:476-530` — Child overriding parent methods with different implementations.
- **GrandChildWithDeepOverrides** `layer3_relationship_mapping.py:530-570` — Deep child further overriding parent methods.
- **GenericBase** `layer3_relationship_mapping.py:574-588` — Generic base class parameterized by type variable.
- **GenericChild** `layer3_relationship_mapping.py:588-599` — Generic child specializing parent type variable.
- **ConcreteGeneric** `layer3_relationship_mapping.py:599-610` — Concrete specialization of generic hierarchy.

#### Methods in Protocols
- **base_method** `layer3_relationship_mapping.py:47-51` — BaseProtocol method definition.
- **base_property** `layer3_relationship_mapping.py:52-56` — BaseProtocol property interface.
- **extended_method** `layer3_relationship_mapping.py:59-63` — ExtendedProtocol additional method.

#### Methods in AbstractBaseClass
- **__init__** `layer3_relationship_mapping.py:66-71` — Constructor for abstract base.
- **abstract_method** `layer3_relationship_mapping.py:72-76` — Abstract method requiring subclass implementation.
- **abstract_property** `layer3_relationship_mapping.py:77-81` — Abstract property interface.
- **concrete_method** `layer3_relationship_mapping.py:81-85` — Concrete method implementation in base.
- **template_method** `layer3_relationship_mapping.py:85-89` — Template method invoking before/main/after hooks.
- **base_class_method** `layer3_relationship_mapping.py:90-94` — Class method in abstract base.

#### Methods in MiddleClass
- **__init__** `layer3_relationship_mapping.py:97-101` — Constructor in intermediate class.
- **abstract_method** `layer3_relationship_mapping.py:101-105` — Partial implementation of abstract method.
- **abstract_property** `layer3_relationship_mapping.py:106-110` — Property implementing abstract interface.
- **concrete_method** `layer3_relationship_mapping.py:110-115` — Concrete method with middle-class behavior.
- **middle_specific_method** `layer3_relationship_mapping.py:115-119` — Method unique to middle class.
- **base_class_method** `layer3_relationship_mapping.py:120-125` — Class method implementation in middle.

#### Methods in ConcreteImplementation
- **__init__** `layer3_relationship_mapping.py:128-132` — Constructor in concrete class.
- **abstract_method** `layer3_relationship_mapping.py:132-137` — Final implementation of abstract method.
- **concrete_method** `layer3_relationship_mapping.py:137-142` — Concrete method with final behavior.
- **concrete_specific_method** `layer3_relationship_mapping.py:142-146` — Method specific to concrete implementation.

#### Methods in Mixins (Layer 3)
- **shared_method** `layer3_relationship_mapping.py:153-156` — MixinA shared method.
- **mixin_a_only** `layer3_relationship_mapping.py:156-159` — MixinA-specific method.
- **cooperative_method** `layer3_relationship_mapping.py:159-163` — MixinA cooperative method calling super().
- **shared_method** `layer3_relationship_mapping.py:166-169` — MixinB shared method.
- **mixin_b_only** `layer3_relationship_mapping.py:169-172` — MixinB-specific method.
- **cooperative_method** `layer3_relationship_mapping.py:172-177` — MixinB cooperative method calling super().
- **shared_method** `layer3_relationship_mapping.py:180-183` — MixinC shared method.
- **mixin_c_only** `layer3_relationship_mapping.py:183-186` — MixinC-specific method.
- **cooperative_method** `layer3_relationship_mapping.py:186-191` — MixinC cooperative method calling super().

#### Methods in ComplexMultipleInheritance
- **__init__** `layer3_relationship_mapping.py:194-198` — Constructor initializing all mixins.
- **shared_method** `layer3_relationship_mapping.py:198-204` — Shared method resolving through MRO.
- **cooperative_method** `layer3_relationship_mapping.py:204-209` — Cooperative method demonstrating MRO traversal.
- **demonstrate_mro** `layer3_relationship_mapping.py:209-225` — Method printing method resolution order chain.

#### Methods in Diamond Pattern
- **__init__** `layer3_relationship_mapping.py:232-236` — Constructor in DiamondBase.
- **base_method** `layer3_relationship_mapping.py:236-239` — Base method in diamond.
- **__init__** `layer3_relationship_mapping.py:242-247` — Constructor in DiamondLeft.
- **base_method** `layer3_relationship_mapping.py:247-251` — DiamondLeft implementation of base method.
- **left_method** `layer3_relationship_mapping.py:251-254` — DiamondLeft-specific method.
- **__init__** `layer3_relationship_mapping.py:257-262` — Constructor in DiamondRight.
- **base_method** `layer3_relationship_mapping.py:262-266` — DiamondRight implementation of base method.
- **right_method** `layer3_relationship_mapping.py:266-269` — DiamondRight-specific method.
- **__init__** `layer3_relationship_mapping.py:272-279` — Constructor in DiamondBottom.
- **base_method** `layer3_relationship_mapping.py:279-285` — DiamondBottom resolving diamond base_method.
- **combined_method** `layer3_relationship_mapping.py:285-291` — Method combining left and right branch behavior.

#### Methods in ImportDependentClass
- **__init__** `layer3_relationship_mapping.py:298-306` — Constructor setting up import dependencies.
- **_setup_dependencies** `layer3_relationship_mapping.py:306-329` — Private method initializing external library references.
- **process_with_datetime** `layer3_relationship_mapping.py:329-334` — Method using datetime module.
- **process_with_pathlib** `layer3_relationship_mapping.py:334-347` — Method using pathlib module.
- **process_with_json** `layer3_relationship_mapping.py:347-351` — Method using json module.
- **process_with_numpy** `layer3_relationship_mapping.py:351-365` — Method using numpy (external dependency).

#### Methods in CircularReferences
- **__init__** `layer3_relationship_mapping.py:368-373` — Constructor in CircularReferenceA.
- **set_reference** `layer3_relationship_mapping.py:373-378` — Method setting forward reference to CircularReferenceB.
- **method_using_b** `layer3_relationship_mapping.py:378-384` — Method using CircularReferenceB reference.
- **get_name** `layer3_relationship_mapping.py:384-388` — Method returning class identifier.
- **__init__** `layer3_relationship_mapping.py:391-396` — Constructor in CircularReferenceB.
- **method_using_a** `layer3_relationship_mapping.py:396-402` — Method using CircularReferenceA reference.
- **get_name** `layer3_relationship_mapping.py:402-406` — Method returning class identifier.
- **combined_operation** `layer3_relationship_mapping.py:406-419` — Method demonstrating circular reference cooperation.

#### Methods in BaseForOverrides
- **__init__** `layer3_relationship_mapping.py:426-429` — Constructor in base for overrides.
- **simple_method** `layer3_relationship_mapping.py:429-433` — Simple method for override testing.
- **complex_method** `layer3_relationship_mapping.py:433-442` — Complex method with hook pattern.
- **template_hook_method** `layer3_relationship_mapping.py:442-449` — Template method calling internal hooks.
- **_before_hook** `layer3_relationship_mapping.py:449-453` — Private hook invoked before main operation.
- **_main_operation** `layer3_relationship_mapping.py:453-457` — Private hook executing main operation.
- **_after_hook** `layer3_relationship_mapping.py:457-461` — Private hook invoked after main operation.
- **class_method_to_override** `layer3_relationship_mapping.py:462-466` — Class method for override testing.
- **static_method_to_override** `layer3_relationship_mapping.py:467-471` — Static method for override testing.
- **property_to_override** `layer3_relationship_mapping.py:472-476` — Property for override testing.

#### Methods in ChildWithOverrides
- **__init__** `layer3_relationship_mapping.py:479-483` — Constructor in child class.
- **simple_method** `layer3_relationship_mapping.py:483-488` — Overridden simple method with different behavior.
- **complex_method** `layer3_relationship_mapping.py:488-499` — Overridden complex method changing operation.
- **_main_operation** `layer3_relationship_mapping.py:499-504` — Overridden hook in child.
- **_after_hook** `layer3_relationship_mapping.py:504-508` — Overridden after-hook in child.
- **class_method_to_override** `layer3_relationship_mapping.py:509-514` — Overridden class method.
- **static_method_to_override** `layer3_relationship_mapping.py:515-519` — Overridden static method.
- **property_to_override** `layer3_relationship_mapping.py:520-525` — Overridden property with different backing.
- **child_specific_method** `layer3_relationship_mapping.py:526-530` — Method unique to child class.

#### Methods in GrandChildWithDeepOverrides
- **__init__** `layer3_relationship_mapping.py:533-537` — Constructor in grandchild class.
- **simple_method** `layer3_relationship_mapping.py:537-542` — Further overridden simple method.
- **complex_method** `layer3_relationship_mapping.py:542-556` — Deeply overridden complex method.
- **_before_hook** `layer3_relationship_mapping.py:556-560` — Overridden before-hook in grandchild.
- **demonstrate_override_chain** `layer3_relationship_mapping.py:560-570` — Method showing override chain results.

#### Methods in Generics
- **__init__** `layer3_relationship_mapping.py:577-580` — Constructor in GenericBase.
- **get_value** `layer3_relationship_mapping.py:580-584` — Generic method returning type parameter.
- **process_value** `layer3_relationship_mapping.py:584-588` — Generic method processing type parameter.
- **__init__** `layer3_relationship_mapping.py:591-595` — Constructor in GenericChild.
- **get_combined** `layer3_relationship_mapping.py:595-599` — Method combining parent and child generic values.
- **__init__** `layer3_relationship_mapping.py:602-606` — Constructor in ConcreteGeneric.
- **string_operation** `layer3_relationship_mapping.py:606-610` — Method performing concrete string operation.

---

### Layer 4: Pattern Recognition

#### Classes
- **BasicContextManager** `layer4_pattern_recognition.py:39-60` — Context manager with simple enter/exit semantics.
- **ExceptionSuppressingContextManager** `layer4_pattern_recognition.py:60-76` — Context manager swallowing specific exceptions.
- **NestedContextManager** `layer4_pattern_recognition.py:137-163` — Context manager demonstrating nested resource management.
- **CustomBusinessException** `layer4_pattern_recognition.py:167-176` — Custom exception for business logic errors.
- **ValidationError** `layer4_pattern_recognition.py:176-180` — Exception for validation failures.
- **ProcessingError** `layer4_pattern_recognition.py:180-184` — Exception for processing failures.
- **RetryableError** `layer4_pattern_recognition.py:184-188` — Exception indicating operation should be retried.
- **Singleton** `layer4_pattern_recognition.py:356-375` — Class ensuring only one instance exists globally.
- **ObserverPattern** `layer4_pattern_recognition.py:375-406` — Observer pattern implementation for event notification.
- **FactoryPattern** `layer4_pattern_recognition.py:406-428` — Factory pattern for object creation abstraction.
- **BuilderPattern** `layer4_pattern_recognition.py:428-472` — Builder pattern for complex object construction.
- **StrategyPattern** `layer4_pattern_recognition.py:473-496` — Strategy pattern for interchangeable algorithms.
- **ResourcePool** `layer4_pattern_recognition.py:500-541` — Object pool managing reusable resource instances.
- **WeakReferenceManager** `layer4_pattern_recognition.py:541-577` — Manager using weak references for memory-efficient tracking.
- **AsyncContextPool** `layer4_pattern_recognition.py:634-674` — Asynchronous context manager pool for concurrent resource access.

#### Functions (Context Managers and Patterns)
- **file_manager** `layer4_pattern_recognition.py:77-102` — Context manager function handling file operations.
- **database_transaction** `layer4_pattern_recognition.py:103-119` — Context manager simulating database transaction lifecycle.
- **async_resource_manager** `layer4_pattern_recognition.py:120-137` — Async context manager for resource handling.

#### Methods in BasicContextManager
- **__init__** `layer4_pattern_recognition.py:42-46` — Constructor storing resource handle.
- **__enter__** `layer4_pattern_recognition.py:46-52` — Entry point acquiring or preparing resource.
- **__exit__** `layer4_pattern_recognition.py:52-60` — Exit point releasing or cleaning up resource.

#### Methods in ExceptionSuppressingContextManager
- **__init__** `layer4_pattern_recognition.py:63-66` — Constructor storing exception types to suppress.
- **__enter__** `layer4_pattern_recognition.py:66-69` — Entry point for exception suppression context.
- **__exit__** `layer4_pattern_recognition.py:69-76` — Exit handler that catches and suppresses specified exceptions.

#### Methods in NestedContextManager
- **__init__** `layer4_pattern_recognition.py:140-144` — Constructor initializing nested resource stack.
- **__enter__** `layer4_pattern_recognition.py:144-159` — Entry acquiring multiple nested resources.
- **__exit__** `layer4_pattern_recognition.py:159-163` — Exit releasing all nested resources in reverse order.

#### Exception Classes
- **__init__** `layer4_pattern_recognition.py:170-176` — Constructor in CustomBusinessException.

#### Design Pattern Methods
- No additional public methods documented for pattern classes as they serve as pattern demonstration structures.

---

## Dependencies

**Internal Dependencies:**
- All four layers are independent test fixtures demonstrating isolated feature sets
- Layer 3 imports Python standard library modules: `datetime`, `pathlib`, `json`
- Layer 3 demonstrates optional external dependency: `numpy` (not required for tests to run)

**External Dependencies:**
- Python standard library only (no third-party dependencies required)
- `dataclasses`, `enum`, `typing`, `abc`, `weakref` modules used for advanced features
- `asyncio` for async/await demonstrations

**Design Patterns Recognized:**
- **Template Method** — BaseForOverrides and inheritance chain
- **Observer** — ObserverPattern class
- **Factory** — FactoryPattern and `from_config` methods
- **Builder** — BuilderPattern class
- **Strategy** — StrategyPattern class
- **Singleton** — Singleton pattern class
- **Context Manager** — BasicContextManager and resource management classes
- **Descriptor** — PropertyDescriptorClass and ValidatedDescriptor
- **Iterator** — IteratorClass and generator functions
- **Mixin** — Multiple inheritance composition across all layers
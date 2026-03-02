/**
 * Framework Patterns (React, Angular, Vue, Express, NestJS)
 */

import type { GlobalCacheEntry } from "../types.js";

/**
 * React framework patterns
 */
export const REACT_PATTERNS: GlobalCacheEntry[] = [
  // Hooks
  { text: "useState", category: "framework", language: "typescript", framework: "react" },
  { text: "useEffect", category: "framework", language: "typescript", framework: "react" },
  { text: "useContext", category: "framework", language: "typescript", framework: "react" },
  { text: "useReducer", category: "framework", language: "typescript", framework: "react" },
  { text: "useCallback", category: "framework", language: "typescript", framework: "react" },
  { text: "useMemo", category: "framework", language: "typescript", framework: "react" },
  { text: "useRef", category: "framework", language: "typescript", framework: "react" },
  { text: "useLayoutEffect", category: "framework", language: "typescript", framework: "react" },
  { text: "useImperativeHandle", category: "framework", language: "typescript", framework: "react" },
  { text: "useDebugValue", category: "framework", language: "typescript", framework: "react" },
  { text: "useDeferredValue", category: "framework", language: "typescript", framework: "react" },
  { text: "useTransition", category: "framework", language: "typescript", framework: "react" },
  { text: "useId", category: "framework", language: "typescript", framework: "react" },
  { text: "useSyncExternalStore", category: "framework", language: "typescript", framework: "react" },

  // Components
  { text: "React.FC", category: "framework", language: "typescript", framework: "react" },
  { text: "React.Component", category: "framework", language: "typescript", framework: "react" },
  { text: "React.PureComponent", category: "framework", language: "typescript", framework: "react" },
  { text: "React.memo", category: "framework", language: "typescript", framework: "react" },
  { text: "React.forwardRef", category: "framework", language: "typescript", framework: "react" },
  { text: "React.lazy", category: "framework", language: "typescript", framework: "react" },
  { text: "React.Suspense", category: "framework", language: "typescript", framework: "react" },
  { text: "React.Fragment", category: "framework", language: "typescript", framework: "react" },

  // Context
  { text: "React.createContext", category: "framework", language: "typescript", framework: "react" },
  { text: "Context.Provider", category: "framework", language: "typescript", framework: "react" },
  { text: "Context.Consumer", category: "framework", language: "typescript", framework: "react" },

  // Common imports
  { text: "import React from 'react'", category: "framework", language: "typescript", framework: "react" },
  { text: "import { useState } from 'react'", category: "framework", language: "typescript", framework: "react" },
  { text: "import { useEffect } from 'react'", category: "framework", language: "typescript", framework: "react" },

  // React class lifecycle methods — real entity methods
  {
    text: "componentDidMount",
    embeddingText: "componentDidMount method\ndescription: react lifecycle called after component mounts into the dom",
    category: "framework",
    language: "typescript",
    framework: "react",
  },
  {
    text: "componentWillUnmount",
    embeddingText:
      "componentWillUnmount method\ndescription: react lifecycle called before component is removed from the dom",
    category: "framework",
    language: "typescript",
    framework: "react",
  },
  {
    text: "componentDidUpdate",
    embeddingText:
      "componentDidUpdate method\ndescription: react lifecycle called after component updates\nparams: prevProps:object, prevState:object",
    category: "framework",
    language: "typescript",
    framework: "react",
  },
  {
    text: "shouldComponentUpdate",
    embeddingText:
      "shouldComponentUpdate method\ndescription: react lifecycle to optimize re-renders\nreturns: boolean",
    category: "framework",
    language: "typescript",
    framework: "react",
  },
  {
    text: "render",
    embeddingText:
      "render method\ndescription: react class component render method returns jsx element\nreturns: JSX.Element",
    category: "framework",
    language: "typescript",
    framework: "react",
  },
  {
    text: "getSnapshotBeforeUpdate",
    embeddingText: "getSnapshotBeforeUpdate method\ndescription: react lifecycle captures snapshot before dom update",
    category: "framework",
    language: "typescript",
    framework: "react",
  },
  {
    text: "getDerivedStateFromProps",
    embeddingText:
      "getDerivedStateFromProps method\ndescription: react static lifecycle to sync state from props\nreturns: object|null",
    category: "framework",
    language: "typescript",
    framework: "react",
  },

  // JSX patterns
  { text: "return (<div>", category: "pattern", language: "typescript", framework: "react" },
  { text: "className=", category: "pattern", language: "typescript", framework: "react" },
  { text: "onClick=", category: "pattern", language: "typescript", framework: "react" },
  { text: "onChange=", category: "pattern", language: "typescript", framework: "react" },
  { text: "{children}", category: "pattern", language: "typescript", framework: "react" },
  { text: "key=", category: "pattern", language: "typescript", framework: "react" },
  { text: "ref=", category: "pattern", language: "typescript", framework: "react" },
];

/**
 * Angular framework patterns
 */
export const ANGULAR_PATTERNS: GlobalCacheEntry[] = [
  // Decorators
  { text: "@Component", category: "framework", language: "typescript", framework: "angular" },
  { text: "@Injectable", category: "framework", language: "typescript", framework: "angular" },
  { text: "@NgModule", category: "framework", language: "typescript", framework: "angular" },
  { text: "@Directive", category: "framework", language: "typescript", framework: "angular" },
  { text: "@Pipe", category: "framework", language: "typescript", framework: "angular" },
  { text: "@Input", category: "framework", language: "typescript", framework: "angular" },
  { text: "@Output", category: "framework", language: "typescript", framework: "angular" },
  { text: "@ViewChild", category: "framework", language: "typescript", framework: "angular" },
  { text: "@ViewChildren", category: "framework", language: "typescript", framework: "angular" },
  { text: "@ContentChild", category: "framework", language: "typescript", framework: "angular" },
  { text: "@ContentChildren", category: "framework", language: "typescript", framework: "angular" },
  { text: "@HostListener", category: "framework", language: "typescript", framework: "angular" },
  { text: "@HostBinding", category: "framework", language: "typescript", framework: "angular" },

  // Lifecycle hooks — real entity methods with predictable embeddingText
  {
    text: "ngOnInit",
    embeddingText: "ngOnInit method\ndescription: angular lifecycle hook called on component initialization",
    category: "framework",
    language: "typescript",
    framework: "angular",
  },
  {
    text: "ngOnDestroy",
    embeddingText: "ngOnDestroy method\ndescription: angular lifecycle hook called before component is destroyed",
    category: "framework",
    language: "typescript",
    framework: "angular",
  },
  {
    text: "ngOnChanges",
    embeddingText:
      "ngOnChanges method\ndescription: angular lifecycle hook called when input properties change\nparams: changes:SimpleChanges",
    category: "framework",
    language: "typescript",
    framework: "angular",
  },
  {
    text: "ngAfterViewInit",
    embeddingText:
      "ngAfterViewInit method\ndescription: angular lifecycle hook called after component view is initialized",
    category: "framework",
    language: "typescript",
    framework: "angular",
  },
  {
    text: "ngAfterContentInit",
    embeddingText:
      "ngAfterContentInit method\ndescription: angular lifecycle hook called after content is projected into the component",
    category: "framework",
    language: "typescript",
    framework: "angular",
  },
  {
    text: "ngDoCheck",
    embeddingText: "ngDoCheck method\ndescription: angular lifecycle hook for custom change detection",
    category: "framework",
    language: "typescript",
    framework: "angular",
  },

  // DI
  { text: "constructor(private", category: "pattern", language: "typescript", framework: "angular" },
  { text: "inject()", category: "framework", language: "typescript", framework: "angular" },

  // RxJS (commonly used with Angular)
  { text: "Observable", category: "framework", language: "typescript", framework: "angular" },
  { text: "Subject", category: "framework", language: "typescript", framework: "angular" },
  { text: "BehaviorSubject", category: "framework", language: "typescript", framework: "angular" },
  { text: "ReplaySubject", category: "framework", language: "typescript", framework: "angular" },
  { text: ".subscribe", category: "framework", language: "typescript", framework: "angular" },
  { text: ".pipe", category: "framework", language: "typescript", framework: "angular" },
  { text: "map()", category: "framework", language: "typescript", framework: "angular" },
  { text: "filter()", category: "framework", language: "typescript", framework: "angular" },
  { text: "switchMap()", category: "framework", language: "typescript", framework: "angular" },
  { text: "mergeMap()", category: "framework", language: "typescript", framework: "angular" },
  { text: "catchError()", category: "framework", language: "typescript", framework: "angular" },
  { text: "takeUntil()", category: "framework", language: "typescript", framework: "angular" },
  { text: "tap()", category: "framework", language: "typescript", framework: "angular" },

  // Signals (Angular 16+)
  { text: "signal()", category: "framework", language: "typescript", framework: "angular" },
  { text: "computed()", category: "framework", language: "typescript", framework: "angular" },
  { text: "effect()", category: "framework", language: "typescript", framework: "angular" },

  // Common imports
  {
    text: "import { Component } from '@angular/core'",
    category: "framework",
    language: "typescript",
    framework: "angular",
  },
  {
    text: "import { Injectable } from '@angular/core'",
    category: "framework",
    language: "typescript",
    framework: "angular",
  },
  { text: "import { Observable } from 'rxjs'", category: "framework", language: "typescript", framework: "angular" },
];

/**
 * Vue framework patterns
 */
export const VUE_PATTERNS: GlobalCacheEntry[] = [
  // Composition API
  { text: "ref", category: "framework", language: "typescript", framework: "vue" },
  { text: "reactive", category: "framework", language: "typescript", framework: "vue" },
  { text: "computed", category: "framework", language: "typescript", framework: "vue" },
  { text: "watch", category: "framework", language: "typescript", framework: "vue" },
  { text: "watchEffect", category: "framework", language: "typescript", framework: "vue" },
  { text: "onMounted", category: "framework", language: "typescript", framework: "vue" },
  { text: "onUnmounted", category: "framework", language: "typescript", framework: "vue" },
  { text: "onUpdated", category: "framework", language: "typescript", framework: "vue" },
  { text: "provide", category: "framework", language: "typescript", framework: "vue" },
  { text: "inject", category: "framework", language: "typescript", framework: "vue" },
  { text: "defineProps", category: "framework", language: "typescript", framework: "vue" },
  { text: "defineEmits", category: "framework", language: "typescript", framework: "vue" },
  { text: "defineExpose", category: "framework", language: "typescript", framework: "vue" },

  // Options API
  { text: "data()", category: "framework", language: "typescript", framework: "vue" },
  { text: "methods:", category: "framework", language: "typescript", framework: "vue" },
  { text: "computed:", category: "framework", language: "typescript", framework: "vue" },
  { text: "watch:", category: "framework", language: "typescript", framework: "vue" },
  { text: "props:", category: "framework", language: "typescript", framework: "vue" },
  { text: "emits:", category: "framework", language: "typescript", framework: "vue" },

  // Template directives
  { text: "v-if", category: "pattern", language: "typescript", framework: "vue" },
  { text: "v-else", category: "pattern", language: "typescript", framework: "vue" },
  { text: "v-for", category: "pattern", language: "typescript", framework: "vue" },
  { text: "v-bind", category: "pattern", language: "typescript", framework: "vue" },
  { text: "v-on", category: "pattern", language: "typescript", framework: "vue" },
  { text: "v-model", category: "pattern", language: "typescript", framework: "vue" },
  { text: "v-show", category: "pattern", language: "typescript", framework: "vue" },
  { text: "v-slot", category: "pattern", language: "typescript", framework: "vue" },

  // Common imports
  { text: "import { ref } from 'vue'", category: "framework", language: "typescript", framework: "vue" },
  { text: "import { defineComponent } from 'vue'", category: "framework", language: "typescript", framework: "vue" },
];

/**
 * Express/Node.js patterns
 */
export const EXPRESS_PATTERNS: GlobalCacheEntry[] = [
  // HTTP methods
  { text: "app.get", category: "framework", language: "typescript", framework: "express" },
  { text: "app.post", category: "framework", language: "typescript", framework: "express" },
  { text: "app.put", category: "framework", language: "typescript", framework: "express" },
  { text: "app.delete", category: "framework", language: "typescript", framework: "express" },
  { text: "app.patch", category: "framework", language: "typescript", framework: "express" },
  { text: "app.use", category: "framework", language: "typescript", framework: "express" },

  // Request/Response
  { text: "req.body", category: "framework", language: "typescript", framework: "express" },
  { text: "req.params", category: "framework", language: "typescript", framework: "express" },
  { text: "req.query", category: "framework", language: "typescript", framework: "express" },
  { text: "req.headers", category: "framework", language: "typescript", framework: "express" },
  { text: "res.json", category: "framework", language: "typescript", framework: "express" },
  { text: "res.send", category: "framework", language: "typescript", framework: "express" },
  { text: "res.status", category: "framework", language: "typescript", framework: "express" },
  { text: "res.redirect", category: "framework", language: "typescript", framework: "express" },

  // Middleware pattern
  { text: "(req, res, next)", category: "pattern", language: "typescript", framework: "express" },
  { text: "next()", category: "framework", language: "typescript", framework: "express" },

  // Common imports
  { text: "import express from 'express'", category: "framework", language: "typescript", framework: "express" },
  { text: "const app = express()", category: "pattern", language: "typescript", framework: "express" },
  { text: "app.listen", category: "framework", language: "typescript", framework: "express" },
];

/**
 * NestJS patterns
 */
export const NESTJS_PATTERNS: GlobalCacheEntry[] = [
  // Decorators
  { text: "@Controller", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Injectable", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Module", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Get", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Post", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Put", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Delete", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Patch", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Body", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Param", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Query", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@Headers", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@UseGuards", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@UsePipes", category: "framework", language: "typescript", framework: "nestjs" },
  { text: "@UseInterceptors", category: "framework", language: "typescript", framework: "nestjs" },

  // Common imports
  {
    text: "import { Controller } from '@nestjs/common'",
    category: "framework",
    language: "typescript",
    framework: "nestjs",
  },
  {
    text: "import { Injectable } from '@nestjs/common'",
    category: "framework",
    language: "typescript",
    framework: "nestjs",
  },
];

# ESLint Plugin: no-unused-viewmodel-properties

**Date:** 2026-03-10
**Status:** Approved

## Problem

Users of `model-vue-presenter` sometimes leave unused properties in the `viewModel` computed object — either forgotten dead code, or properties exposed solely for testing purposes (anti-pattern, since `.spy()` already handles testing needs). There is no automated way to catch this today.

## Solution

A custom ESLint plugin shipped as part of this library. Consumers opt in by adding the plugin to their ESLint config. The library also uses the plugin on its own test fixtures to verify it works.

## Architecture

The plugin is exported from this library under a dedicated entry point:

```js
import modelVuePresenter from 'model-vue-presenter/eslint'

export default [
  {
    plugins: { 'model-vue-presenter': modelVuePresenter },
    rules: { 'model-vue-presenter/no-unused-viewmodel-properties': 'error' }
  }
]
```

The plugin exposes one rule: **`no-unused-viewmodel-properties`**.

## Rule: `no-unused-viewmodel-properties`

### Trigger

The rule runs on `.ts`/`.js` files. It activates when it finds a `presenterFactory(...)` `CallExpression` — no filename convention required.

### Step 1 — Property Extraction (AST)

Traverses the `presenterFactory` callback's return statement to find the `viewModel` key, unwraps the `computed(() => ({ ... }))` call, and collects the property names from the inner object literal.

AST path:
```
CallExpression(presenterFactory)
  └─ ArrowFunctionExpression (callback)
       └─ ReturnStatement
            └─ ObjectExpression
                 └─ Property[key=viewModel]
                      └─ CallExpression(computed)
                           └─ ArrowFunctionExpression
                                └─ ObjectExpression  ← extract keys here
```

### Step 2 — Finding Importer `.vue` Files

From the presenter file's directory, walks upward to find the nearest `package.json` (project root). Globs all `.vue` files under the project root. Reads each and checks whether it contains an import path that resolves to this presenter file.

### Step 3 — Local Alias Detection

For each matching `.vue` file, scans the `<script setup>` section for the destructuring call and extracts the **local variable name** used for `viewModel`:

```ts
const { viewModel } = usePresenter()          // localName = "viewModel"
const { viewModel: storeViewModel } = ...     // localName = "storeViewModel"
```

If no destructuring of `viewModel` is found, the `.vue` file is skipped — it is not consuming the viewModel, so properties used there do not count as "used."

### Step 4 — Usage Detection

For each matching `.vue` file (with a resolved local name), extracts the raw text of both `<template>` and `<script setup>` sections. For each viewModel property, checks for the pattern `localName.propertyName` using a word-boundary-aware regex.

A property is considered **used** only if it appears in **every** importing `.vue` file (each file is analyzed independently).

### Step 5 — Reporting

Any property not found in any importing `.vue` file is reported at its key node in the presenter file:

```
viewModel property "showSkeletonLoader" is not used in any importing .vue file
```

Errors are reported in the **presenter file**, at the exact property key node.

### Scope

- Supports standard `viewModel.property` access pattern
- Supports `viewModel` aliased at destructuring call site
- Each `.vue` file is analyzed independently — a property must be used in each file that imports the presenter
- Destructured viewModel properties (e.g. `const { headline } = viewModel`) are out of scope for now (extensible later)

## Testing Strategy

Uses Vitest + ESLint's `RuleTester`. Fixture files on disk replace mocking — the rule reads real `.vue` files, which keeps tests realistic and fixtures serve as documentation.

### Structure

```
__tests__/
  eslint/
    fixtures/
      used-all-properties/
        use-pet-store.presenter.ts   ← presenter with N viewModel props
        pet-store.vue                ← template using all N props
      unused-property/
        use-pet-store.presenter.ts   ← presenter with N viewModel props
        pet-store.vue                ← template using N-1 props
      used-in-script-setup/
        use-counter.presenter.ts
        counter.vue                  ← property accessed in <script setup> only
      viewmodel-alias/
        use-counter.presenter.ts
        counter.vue                  ← destructures viewModel as custom name
    no-unused-viewmodel-properties.test.ts
```

Valid cases assert zero errors. Invalid cases assert the exact property name reported and the node location.

## Packaging

A new build entry point is added to `vite.config.ts` for `lib/eslint.ts`. This file exports the plugin object with the rule. The `package.json` exports map is updated with an `eslint` condition so consumers can import `model-vue-presenter/eslint`.

# ESLint Plugin Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `no-unused-viewmodel-properties` ESLint rule as part of this library that reports viewModel properties in presenter files that are never accessed in any importing `.vue` file.

**Architecture:** A single ESLint rule runs on `.ts` presenter files, extracts viewModel property names from the AST, then reads importing `.vue` files from disk to check template and script setup sections for `viewModel.propertyName` access patterns (including aliased viewModel names). The rule and plugin entry point are compiled to `dist/eslint.js` via a second Vite build entry.

**Tech Stack:** ESLint 9, `@typescript-eslint/parser` (dev/test only), Vite multi-entry build, Vitest + `RuleTester`

---

## File Map

| Path | Action | Responsibility |
|------|--------|----------------|
| `lib/eslint/index.ts` | Create | Plugin entry — exports the plugin object with the rule |
| `lib/eslint/rules/no-unused-viewmodel-properties.ts` | Create | The rule — detection, file scanning, reporting |
| `__tests__/eslint/no-unused-viewmodel-properties.test.ts` | Create | RuleTester tests for all scenarios |
| `__tests__/eslint/fixtures/used-all-properties/use-pet-store.presenter.ts` | Create | Fixture: presenter with 3 viewModel props |
| `__tests__/eslint/fixtures/used-all-properties/pet-store.vue` | Create | Fixture: template using all 3 props |
| `__tests__/eslint/fixtures/unused-property/use-pet-store.presenter.ts` | Create | Fixture: presenter with 3 viewModel props |
| `__tests__/eslint/fixtures/unused-property/pet-store.vue` | Create | Fixture: template using only 2 props |
| `__tests__/eslint/fixtures/used-in-script-setup/use-counter.presenter.ts` | Create | Fixture: presenter with 2 viewModel props |
| `__tests__/eslint/fixtures/used-in-script-setup/counter.vue` | Create | Fixture: one prop in template, one only in script setup |
| `__tests__/eslint/fixtures/viewmodel-alias/use-counter.presenter.ts` | Create | Fixture: presenter with 2 viewModel props |
| `__tests__/eslint/fixtures/viewmodel-alias/counter.vue` | Create | Fixture: viewModel destructured with alias |
| `vite.config.ts` | Modify | Add `eslint` as second build entry point |
| `package.json` | Modify | Add `eslint` to `peerDependencies`, `devDependencies`, and `exports` |

---

## Chunk 1: Dependencies and Skeletons

### Task 1: Install ESLint and TypeScript parser

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install devDependencies**

```bash
npm install --save-dev eslint @typescript-eslint/parser
```

Expected: `package.json` devDependencies updated with `eslint` and `@typescript-eslint/parser`.

- [ ] **Step 2: Add eslint as optional peerDependency**

In `package.json`, add to `"peerDependencies"`:
```json
"eslint": ">=8.0.0"
```

And add `"peerDependenciesMeta"` section:
```json
"peerDependenciesMeta": {
  "eslint": {
    "optional": true
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add eslint and typescript-parser dev dependencies"
```

---

### Task 2: Create library file skeletons

**Files:**
- Create: `lib/eslint/index.ts`
- Create: `lib/eslint/rules/no-unused-viewmodel-properties.ts`

- [ ] **Step 1: Create the rule skeleton**

Create `lib/eslint/rules/no-unused-viewmodel-properties.ts`:

```typescript
import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unused viewModel properties in presenter files',
    },
    messages: {
      unusedProperty: 'viewModel property "{{property}}" is not used in any importing .vue file',
    },
    schema: [],
  },
  create(context) {
    return {}
  },
}

export default rule
```

- [ ] **Step 2: Create the plugin entry**

Create `lib/eslint/index.ts`:

```typescript
import noUnusedViewModelProperties from './rules/no-unused-viewmodel-properties'

const plugin = {
  rules: {
    'no-unused-viewmodel-properties': noUnusedViewModelProperties,
  },
}

export default plugin
```

- [ ] **Step 3: Commit**

```bash
git add lib/eslint/
git commit -m "chore: add eslint plugin and rule skeletons"
```

---

## Chunk 2: Fixture Files

### Task 3: Create "used-all-properties" fixtures

**Files:**
- Create: `__tests__/eslint/fixtures/used-all-properties/use-pet-store.presenter.ts`
- Create: `__tests__/eslint/fixtures/used-all-properties/pet-store.vue`

- [ ] **Step 1: Create the presenter fixture**

Create `__tests__/eslint/fixtures/used-all-properties/use-pet-store.presenter.ts`:

```typescript
import { presenterFactory } from '../../../../lib/main'
import { computed, reactive } from 'vue'

export const usePetStorePresenter = presenterFactory(() => {
  const state = reactive({
    isLoading: true,
    pets: [] as string[],
  })

  return {
    viewModel: computed(() => ({
      headline: state.isLoading ? 'Loading...' : 'Welcome',
      pets: state.pets,
      showSkeletonLoader: state.isLoading,
    })),
  }
})
```

- [ ] **Step 2: Create the Vue component fixture**

Create `__tests__/eslint/fixtures/used-all-properties/pet-store.vue`:

```vue
<template>
  <div>
    <h2>{{ viewModel.headline }}</h2>
    <p v-if="viewModel.showSkeletonLoader">Loading...</p>
    <ol>
      <li v-for="pet in viewModel.pets" :key="pet">{{ pet }}</li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { usePetStorePresenter } from './use-pet-store.presenter'
const { viewModel } = usePetStorePresenter()
</script>
```

---

### Task 4: Create "unused-property" fixtures

**Files:**
- Create: `__tests__/eslint/fixtures/unused-property/use-pet-store.presenter.ts`
- Create: `__tests__/eslint/fixtures/unused-property/pet-store.vue`

- [ ] **Step 1: Create the presenter fixture**

Create `__tests__/eslint/fixtures/unused-property/use-pet-store.presenter.ts`:

```typescript
import { presenterFactory } from '../../../../lib/main'
import { computed, reactive } from 'vue'

export const usePetStorePresenter = presenterFactory(() => {
  const state = reactive({
    isLoading: true,
    pets: [] as string[],
  })

  return {
    viewModel: computed(() => ({
      headline: state.isLoading ? 'Loading...' : 'Welcome',
      pets: state.pets,
      showSkeletonLoader: state.isLoading,
    })),
  }
})
```

- [ ] **Step 2: Create the Vue component fixture — note: `showSkeletonLoader` intentionally omitted**

Create `__tests__/eslint/fixtures/unused-property/pet-store.vue`:

```vue
<template>
  <div>
    <h2>{{ viewModel.headline }}</h2>
    <ol>
      <li v-for="pet in viewModel.pets" :key="pet">{{ pet }}</li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { usePetStorePresenter } from './use-pet-store.presenter'
const { viewModel } = usePetStorePresenter()
</script>
```

---

### Task 5: Create "used-in-script-setup" fixtures

**Files:**
- Create: `__tests__/eslint/fixtures/used-in-script-setup/use-counter.presenter.ts`
- Create: `__tests__/eslint/fixtures/used-in-script-setup/counter.vue`

- [ ] **Step 1: Create the presenter fixture**

Create `__tests__/eslint/fixtures/used-in-script-setup/use-counter.presenter.ts`:

```typescript
import { presenterFactory } from '../../../../lib/main'
import { computed, ref } from 'vue'

export const useCounterPresenter = presenterFactory(() => {
  const count = ref(0)

  return {
    viewModel: computed(() => ({
      count: count.value,
      isEven: count.value % 2 === 0,
    })),
  }
})
```

- [ ] **Step 2: Create the Vue component fixture — `isEven` is used only in script setup**

Create `__tests__/eslint/fixtures/used-in-script-setup/counter.vue`:

```vue
<template>
  <div>{{ viewModel.count }}</div>
</template>

<script setup lang="ts">
import { useCounterPresenter } from './use-counter.presenter'
import { watch } from 'vue'
const { viewModel } = useCounterPresenter()
watch(() => viewModel.isEven, (val) => console.log(val))
</script>
```

---

### Task 6: Create "viewmodel-alias" fixtures

**Files:**
- Create: `__tests__/eslint/fixtures/viewmodel-alias/use-counter.presenter.ts`
- Create: `__tests__/eslint/fixtures/viewmodel-alias/counter.vue`

- [ ] **Step 1: Create the presenter fixture**

Create `__tests__/eslint/fixtures/viewmodel-alias/use-counter.presenter.ts`:

```typescript
import { presenterFactory } from '../../../../lib/main'
import { computed, ref } from 'vue'

export const useCounterPresenter = presenterFactory(() => {
  const count = ref(0)

  return {
    viewModel: computed(() => ({
      count: count.value,
      isEven: count.value % 2 === 0,
    })),
  }
})
```

- [ ] **Step 2: Create the Vue component fixture — viewModel is aliased as `counterVM`**

Create `__tests__/eslint/fixtures/viewmodel-alias/counter.vue`:

```vue
<template>
  <div>{{ counterVM.count }}</div>
</template>

<script setup lang="ts">
import { useCounterPresenter } from './use-counter.presenter'
import { watch } from 'vue'
const { viewModel: counterVM } = useCounterPresenter()
watch(() => counterVM.isEven, (val) => console.log(val))
</script>
```

- [ ] **Step 3: Commit all fixtures**

```bash
git add __tests__/eslint/
git commit -m "test: add eslint rule fixture files"
```

---

## Chunk 3: Tests (TDD — Write First)

### Task 7: Write the test file

**Files:**
- Create: `__tests__/eslint/no-unused-viewmodel-properties.test.ts`

- [ ] **Step 1: Create the test file**

Create `__tests__/eslint/no-unused-viewmodel-properties.test.ts`:

```typescript
import { RuleTester } from 'eslint'
import typescriptParser from '@typescript-eslint/parser'
import { describe, it } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import rule from '../../lib/eslint/rules/no-unused-viewmodel-properties'

RuleTester.describe = describe
RuleTester.it = it

const ruleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

const fixturesDir = path.resolve(__dirname, 'fixtures')

function readFixture(scenario: string, fileName: string): string {
  return fs.readFileSync(path.resolve(fixturesDir, scenario, fileName), 'utf8')
}

function fixturePath(scenario: string, fileName: string): string {
  return path.resolve(fixturesDir, scenario, fileName)
}

ruleTester.run('no-unused-viewmodel-properties', rule, {
  valid: [
    {
      name: 'all viewModel properties are used in template',
      code: readFixture('used-all-properties', 'use-pet-store.presenter.ts'),
      filename: fixturePath('used-all-properties', 'use-pet-store.presenter.ts'),
    },
    {
      name: 'viewModel property used only in <script setup>',
      code: readFixture('used-in-script-setup', 'use-counter.presenter.ts'),
      filename: fixturePath('used-in-script-setup', 'use-counter.presenter.ts'),
    },
    {
      name: 'viewModel aliased at destructuring — all properties used',
      code: readFixture('viewmodel-alias', 'use-counter.presenter.ts'),
      filename: fixturePath('viewmodel-alias', 'use-counter.presenter.ts'),
    },
  ],
  invalid: [
    {
      name: 'viewModel property not used in any importing .vue file',
      code: readFixture('unused-property', 'use-pet-store.presenter.ts'),
      filename: fixturePath('unused-property', 'use-pet-store.presenter.ts'),
      errors: [
        { messageId: 'unusedProperty', data: { property: 'showSkeletonLoader' } },
      ],
    },
  ],
})
```

- [ ] **Step 2: Run tests — confirm the invalid case fails**

```bash
npm test -- __tests__/eslint/no-unused-viewmodel-properties.test.ts
```

Expected: The 1 invalid case fails (rule reports no errors yet, but RuleTester expects 1 error). The 3 valid cases pass vacuously since the empty rule also reports no errors.

- [ ] **Step 3: Commit failing tests**

```bash
git add __tests__/eslint/no-unused-viewmodel-properties.test.ts
git commit -m "test: add failing tests for no-unused-viewmodel-properties rule"
```

---

## Chunk 4: Rule Implementation

### Task 8: Implement viewModel property extraction

**Files:**
- Modify: `lib/eslint/rules/no-unused-viewmodel-properties.ts`

The goal of this task is to make the rule detect `presenterFactory` calls and extract viewModel property names from the AST. No file scanning yet — just the AST traversal.

- [ ] **Step 1: Replace the rule skeleton with full implementation**

Replace `lib/eslint/rules/no-unused-viewmodel-properties.ts` entirely:

```typescript
import type { Rule } from 'eslint'
import type { Node, CallExpression, Property, ObjectExpression, ArrowFunctionExpression, FunctionExpression, ReturnStatement } from 'estree'
import fs from 'node:fs'
import path from 'node:path'

interface ViewModelProperty {
  name: string
  node: Node
}

function extractViewModelProperties(callNode: CallExpression): ViewModelProperty[] {
  const callback = callNode.arguments[0]
  if (
    !callback ||
    (callback.type !== 'ArrowFunctionExpression' && callback.type !== 'FunctionExpression')
  ) return []

  const body = (callback as ArrowFunctionExpression | FunctionExpression).body
  if (body.type !== 'BlockStatement') return []

  const returnStatement = body.body.find((s): s is ReturnStatement => s.type === 'ReturnStatement')
  if (!returnStatement?.argument || returnStatement.argument.type !== 'ObjectExpression') return []

  const returnObj = returnStatement.argument as ObjectExpression
  const viewModelProp = returnObj.properties.find(
    (p): p is Property =>
      p.type === 'Property' &&
      ((p.key.type === 'Identifier' && p.key.name === 'viewModel') ||
        (p.key.type === 'Literal' && p.key.value === 'viewModel'))
  )
  if (!viewModelProp) return []

  const computedCall = viewModelProp.value
  if (computedCall.type !== 'CallExpression') return []

  const computedCallback = computedCall.arguments[0]
  if (
    !computedCallback ||
    (computedCallback.type !== 'ArrowFunctionExpression' &&
      computedCallback.type !== 'FunctionExpression')
  ) return []

  let viewModelObj: ObjectExpression | undefined
  const cbBody = (computedCallback as ArrowFunctionExpression | FunctionExpression).body
  if (cbBody.type === 'ObjectExpression') {
    viewModelObj = cbBody as ObjectExpression
  } else if (cbBody.type === 'BlockStatement') {
    const ret = cbBody.body.find((s): s is ReturnStatement => s.type === 'ReturnStatement')
    if (ret?.argument?.type === 'ObjectExpression') {
      viewModelObj = ret.argument as ObjectExpression
    }
  }
  if (!viewModelObj) return []

  return viewModelObj.properties
    .filter((p): p is Property => p.type === 'Property')
    .map((p) => ({
      name: p.key.type === 'Identifier' ? p.key.name : String((p.key as any).value),
      node: p.key,
    }))
}

function findProjectRoot(filePath: string): string {
  let dir = path.dirname(filePath)
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir
    dir = path.dirname(dir)
  }
  return path.dirname(filePath)
}

function findVueFiles(root: string): string[] {
  const results: string[] = []

  function scan(dir: string): void {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') {
        continue
      }
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) scan(full)
      else if (entry.name.endsWith('.vue')) results.push(full)
    }
  }

  scan(root)
  return results
}

function importsPresenter(vueFilePath: string, presenterFilePath: string): boolean {
  let content: string
  try {
    content = fs.readFileSync(vueFilePath, 'utf8')
  } catch {
    return false
  }

  const presenterWithoutExt = presenterFilePath.replace(/\.(ts|tsx|js|jsx)$/, '')
  const importRegex = /from\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1]
    if (!importPath.startsWith('.')) continue
    const vueDir = path.dirname(vueFilePath)
    const resolved = path.resolve(vueDir, importPath).replace(/\.(ts|tsx|js|jsx)$/, '')
    if (resolved === presenterWithoutExt) return true
  }

  return false
}

function getViewModelLocalName(scriptContent: string): string | null {
  // Matches: const { viewModel } = ... or const { viewModel: alias } = ...
  // \b prevents matching e.g. "storeViewModel" as "viewModel"
  const match = scriptContent.match(/\{\s*viewModel\b(?:\s*:\s*(\w+))?\s*[,}]/)
  if (!match) return null
  return match[1] ?? 'viewModel'
}

function isPropertyUsedInVueFile(vueFilePath: string, propertyName: string): boolean {
  let content: string
  try {
    content = fs.readFileSync(vueFilePath, 'utf8')
  } catch {
    return false
  }

  const scriptSetupMatch = content.match(/<script\b[^>]*\bsetup\b[^>]*>([\s\S]*?)<\/script>/)
  const scriptContent = scriptSetupMatch?.[1] ?? ''
  const localName = getViewModelLocalName(scriptContent)
  // File doesn't destructure viewModel at all — treat as neutral (skip), not as "unused"
  if (!localName) return true

  const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/)
  const templateContent = templateMatch?.[1] ?? ''

  // Negative lookbehind on left + negative lookahead on right = full word boundary
  const regex = new RegExp(
    `(?<![\\w$])${escapeRegex(localName)}\\.${escapeRegex(propertyName)}(?![\\w$])`
  )

  return regex.test(templateContent) || regex.test(scriptContent)
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unused viewModel properties in presenter files',
    },
    messages: {
      unusedProperty: 'viewModel property "{{property}}" is not used in any importing .vue file',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'presenterFactory') return

        const properties = extractViewModelProperties(node)
        if (properties.length === 0) return

        const presenterFilePath =
          typeof (context as any).filename === 'string'
            ? (context as any).filename
            : context.getFilename()

        const projectRoot = findProjectRoot(presenterFilePath)
        const vueFiles = findVueFiles(projectRoot)
        const importingVueFiles = vueFiles.filter((f) => importsPresenter(f, presenterFilePath))

        if (importingVueFiles.length === 0) return

        for (const { name, node: keyNode } of properties) {
          // every: property must be used in ALL importing .vue files (each file is independent)
          const isUsed = importingVueFiles.every((f) => isPropertyUsedInVueFile(f, name))
          if (!isUsed) {
            context.report({
              node: keyNode,
              messageId: 'unusedProperty',
              data: { property: name },
            })
          }
        }
      },
    }
  },
}

export default rule
```

- [ ] **Step 2: Run tests**

```bash
npm test -- __tests__/eslint/no-unused-viewmodel-properties.test.ts
```

Expected: All 4 tests pass.

- [ ] **Step 3: Run the full test suite to confirm no regressions**

```bash
npm test
```

Expected: All existing tests still pass.

- [ ] **Step 4: Commit**

```bash
git add lib/eslint/rules/no-unused-viewmodel-properties.ts
git commit -m "feat: implement no-unused-viewmodel-properties eslint rule"
```

---

## Chunk 5: Build Integration

### Task 9: Update Vite config for multi-entry build

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Read current vite.config.ts**

Verify current content before editing (already read above, but confirm nothing changed).

- [ ] **Step 2: Update the `lib` build configuration**

In `vite.config.ts`, replace the `lib` block:

Old:
```typescript
lib: {
  entry: resolve(__dirname, 'lib/main.ts'),
  fileName: 'main',
  formats: ['es'],
},
```

New:
```typescript
lib: {
  entry: {
    main: resolve(__dirname, 'lib/main.ts'),
    eslint: resolve(__dirname, 'lib/eslint/index.ts'),
  },
  formats: ['es'],
  fileName: (format, entryName) => `${entryName}.js`,
},
```

- [ ] **Step 3: Verify TypeScript compiles cleanly with new files**

```bash
npx vue-tsc --noEmit
```

Expected: No errors. (`@types/node` is already in devDependencies so `fs`/`path` resolve fine.)

- [ ] **Step 4: Mark `eslint` as external in rollupOptions**

In the `rollupOptions.external` array, add `'eslint'`:

Old:
```typescript
external: ["vue"],
```

New:
```typescript
external: ["vue", "eslint"],
```

---

### Task 10: Update package.json exports and build

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add `exports` map and update `types`**

In `package.json`, add an `"exports"` field and update `"types"`:

```json
"exports": {
  ".": {
    "import": "./dist/main.js",
    "types": "./dist/types/main.d.ts"
  },
  "./eslint": {
    "import": "./dist/eslint.js",
    "types": "./dist/types/eslint/index.d.ts"
  }
},
```

Keep the existing `"main"` and `"types"` fields for backwards compatibility.

- [ ] **Step 2: Run the build**

```bash
npm run build
```

Expected: `dist/main.js` and `dist/eslint.js` both emitted. No errors.

- [ ] **Step 3: Verify dist output**

```bash
ls dist/
```

Expected output includes: `main.js`, `eslint.js`, `types/` directory.

- [ ] **Step 4: Run tests one final time**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts package.json
git commit -m "feat: expose eslint plugin from library build"
```

---

## Consumer Usage

Once shipped, consumers configure the plugin in their `eslint.config.js`:

```js
import modelVuePresenter from 'model-vue-presenter/eslint'

export default [
  {
    plugins: { 'model-vue-presenter': modelVuePresenter },
    rules: {
      'model-vue-presenter/no-unused-viewmodel-properties': 'error',
    },
  },
]
```

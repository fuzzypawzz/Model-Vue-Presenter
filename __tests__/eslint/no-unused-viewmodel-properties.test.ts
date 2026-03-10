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

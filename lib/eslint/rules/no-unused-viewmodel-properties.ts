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

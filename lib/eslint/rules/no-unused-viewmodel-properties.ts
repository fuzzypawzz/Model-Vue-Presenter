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

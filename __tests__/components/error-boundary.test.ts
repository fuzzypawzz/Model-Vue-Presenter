import { defineComponent } from 'vue'

import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import { presenterFactory } from '../../lib/presenter-factory'
import ErrorBoundary from './error-boundary.vue'

test('presenters throwing error will trigger error boundaries and not crash the component because the viewModel is undefined', async () => {
  const ChildComponent = defineComponent({
    setup() {
      const useThrowingPresenter = presenterFactory(() => {
        throw new Error('Error thrown in presenter')
      })

      return useThrowingPresenter()
    },

    // It's important to try to access the viewModel here, since the presenter
    // crashes if an error is thrown inside it and the presenter factory returns
    // an empty computed ref in that case, to prevent the Vue compoent from crashing
    // when trying to access a property on the viewModel.
    template: `<div>{{ viewModel.someProperty }}</div>`
  })

  const Parent = defineComponent({
    setup() {},
    components: { ChildComponent, ErrorBoundary },
    template: `
    <error-boundary>
      <child-component></child-component>
    </error-boundary>
    `
  })

  const wrapper = mount(Parent)

  await wrapper.vm.$nextTick()
  // We should NOT be seeing this error: TypeError: Cannot read properties of undefined (reading 'someProperty')
  expect(wrapper.text()).toContain('Error thrown in presenter')
})

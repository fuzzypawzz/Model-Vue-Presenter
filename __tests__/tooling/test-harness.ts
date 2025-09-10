import { computed, defineComponent, h } from 'vue'

import { vi } from 'vitest'

import { presenterFactory } from '../../lib/main'

export const testHarness = {
  get actualViewModelValues(): {
    greeting: string
    products: string[]
    isProductsLoading?: false
  } {
    return {
      greeting: 'Welcome to my pet store',
      products: ['Cats', 'Dogs', 'Crocodiles'],
      isProductsLoading: false
    }
  },

  get mockedViewModelValues() {
    return {
      greeting: 'Finding available pets for sale...',
      products: [],
      isProductsLoading: true
    }
  },

  createFactoryCallback() {
    return () => {
      const counter = 0

      return {
        viewModel: computed(() => testHarness.actualViewModelValues),
        counter
      }
    }
  },

  createFactoryCallbackThatThrows() {
    return () => {
      throw Error('Thrown from inside the presenter')
    }
  },

  createPresenterHook() {
    const callback = testHarness.createFactoryCallback()

    return presenterFactory(callback)
  },

  createPresenterHookWithOnCreatedAndDestroyHooks() {
    const onCreatedMockedFunction = vi.fn()
    const onDestroyMockedFunction = vi.fn()

    const usePresenter = presenterFactory(() => {
      return {
        viewModel: computed(() => ({})),
        onCreated() {
          onCreatedMockedFunction()
        },
        onDestroy() {
          onDestroyMockedFunction()
        }
      }
    })

    return { usePresenter, onCreatedMockedFunction, onDestroyMockedFunction }
  },

  createTestComponent(usePresenterHook: (...args: any[]) => unknown) {
    return defineComponent({
      setup() {
        usePresenterHook()

        return () => h('div', 'Test component')
      }
    })
  }
}

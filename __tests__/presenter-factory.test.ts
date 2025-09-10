import { computed, ref } from 'vue'

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ERROR } from '../lib/constants/error'
import { presenterFactory } from '../lib/main'
import { testHarness } from './tooling/test-harness'

describe('presenter factory behaviour', () => {
  it('runs the presenterFactory callback only when the outputted hook is called', () => {
    const callback = vi.fn(testHarness.createFactoryCallback())

    const usePresenterHook = presenterFactory(callback)

    expect(callback).not.toHaveBeenCalled()

    usePresenterHook()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('invokes the onCreated function when the outputted usePresenter hook is called', async () => {
    const { usePresenter, onCreatedMockedFunction } =
      testHarness.createPresenterHookWithOnCreatedAndDestroyHooks()

    expect(onCreatedMockedFunction).not.toHaveBeenCalled()

    mount(testHarness.createTestComponent(usePresenter))

    expect(onCreatedMockedFunction).toHaveBeenCalledTimes(1)
  })

  it('invokes the destroy function when the outputted usePresenter hook is called', async () => {
    const { usePresenter, onDestroyMockedFunction } =
      testHarness.createPresenterHookWithOnCreatedAndDestroyHooks()

    expect(onDestroyMockedFunction).not.toHaveBeenCalled()

    const wrapper = mount(testHarness.createTestComponent(usePresenter))

    expect(onDestroyMockedFunction).not.toHaveBeenCalled()

    wrapper.unmount()

    expect(onDestroyMockedFunction).toHaveBeenCalledTimes(1)
  })

  it.each([ref({}), {}, null])(
    'throws if the returned viewModel is not a computed property',
    (viewModel) => {
      // @ts-expect-error - Invalid view model
      const usePresenter = presenterFactory(() => {
        return { viewModel }
      })

      expect(usePresenter).toThrow(ERROR.PRESENTER_CONFIG.VIEW_MODEL_IS_NOT_COMPUTED)
    }
  )

  it('returns the presenter and the view model wrapped in an object', () => {
    const usePresenter = testHarness.createPresenterHook()

    const returnValue = usePresenter()

    expect(returnValue).toStrictEqual({
      presenter: expect.any(Object),
      viewModel: expect.any(Object)
    })
  })

  it('does not swallow errors thrown inside the presentrer', () => {
    const usePresenter = presenterFactory(() => {
      throw 'Thrown from inside the presenter'
    })

    expect(() => usePresenter()).toThrow('Thrown from inside the presenter')
  })
})

describe('presenter spies', () => {
  it('it allows the user to create one spy per presenter instance', () => {
    const usePresenter = testHarness.createPresenterHook()

    expect(() => {
      usePresenter()
      usePresenter.spy()
      usePresenter.spy()
    }).toThrowError(ERROR.SPYING.NO_PRESENTER_INSTANCE)

    expect(() => {
      usePresenter()
      usePresenter.spy()

      usePresenter()
      usePresenter.spy()

      usePresenter()
      usePresenter.spy()
    }).not.toThrow()

    const useSomeOtherTestPresenter = presenterFactory(() => {
      return {
        viewModel: computed(() => ({}))
      }
    })

    expect(() => {
      usePresenter()
      useSomeOtherTestPresenter()

      usePresenter.spy()
      useSomeOtherTestPresenter.spy()
    }).not.toThrow()
  })

  it('creates a spy for the latest-resolved presenter instance', () => {
    const usePresenter = testHarness.createPresenterHook()

    // Create an instance of the presenter
    usePresenter()

    // Resolves to the same presenter instance as the one above
    const resolvedInstanceSpy = usePresenter.spy().presenter

    if (resolvedInstanceSpy.counter !== 0) {
      throw 'The counter on the presenter should be 0 at this point. This is likely a bug in the test suite.'
    }

    // Resolves a new instance of the presenter, which are different from the one we are spying on
    const unrelatedPresenterInstance = usePresenter().presenter

    expect(unrelatedPresenterInstance === resolvedInstanceSpy).toBe(false)

    // This change of state should not reflect on our spy-able instance
    unrelatedPresenterInstance.counter++
    expect(resolvedInstanceSpy.counter).toBe(0)
  })

  it('returns a presenter that we can use to spy on', () => {
    const usePresenter = testHarness.createPresenterHook()

    const resolvedInstance = usePresenter().presenter
    const resolvedInstanceSpy = usePresenter.spy().presenter

    if (resolvedInstanceSpy.counter !== 0 || resolvedInstance.counter !== 0) {
      throw 'The counter on the presenter should start at 0'
    }

    expect(resolvedInstanceSpy === resolvedInstance).toBe(true)

    // Incrementing the counter on the resolved instance should reflect on the spy-able instance
    resolvedInstance.counter++

    expect(resolvedInstanceSpy.counter).toBe(1)
  })
})

describe('view model mocking', () => {
  it('returns the mocked view model', () => {
    const usePresenter = testHarness.createPresenterHook()

    usePresenter.mockViewModel((vm) => {
      return {
        ...vm,
        ...testHarness.mockedViewModelValues
      }
    })

    const { viewModel } = usePresenter()

    expect(viewModel.value.greeting).toBe(testHarness.mockedViewModelValues.greeting)
    expect(viewModel.value.products.length).toBe(testHarness.mockedViewModelValues.products.length)
    expect(viewModel.value.isProductsLoading).toBe(
      testHarness.mockedViewModelValues.isProductsLoading
    )
  })

  it('mocks the view model for the next resolved presenter instance only', () => {
    const usePresenter = testHarness.createPresenterHook()

    usePresenter.mockViewModel((vm) => {
      return {
        ...vm,
        ...testHarness.mockedViewModelValues
      }
    })

    // The view model should be mocked, since this is creating the first instance after calling mockViewModel()
    const firstInstance = usePresenter()

    expect(firstInstance.viewModel.value.greeting).toBe(testHarness.mockedViewModelValues.greeting)
    expect(firstInstance.viewModel.value.products.length).toBe(
      testHarness.mockedViewModelValues.products.length
    )
    expect(firstInstance.viewModel.value.isProductsLoading).toBe(
      testHarness.mockedViewModelValues.isProductsLoading
    )

    // The view model should no longer be mocked
    const secondInstance = usePresenter()

    expect(secondInstance.viewModel.value.greeting).toBe(testHarness.actualViewModelValues.greeting)
    expect(secondInstance.viewModel.value.products.length).toBe(
      testHarness.actualViewModelValues.products.length
    )
    expect(secondInstance.viewModel.value.isProductsLoading).toBe(
      testHarness.actualViewModelValues.isProductsLoading
    )
  })

  it('throws if the mocked view model contains properties that is not available in the actual view model', () => {
    const usePresenter = testHarness.createPresenterHook()

    const nonExistingProperties = {
      doesNotExistInActualViewModel: 'doesNotExistOnActualViewModel'
    }

    usePresenter.mockViewModel((vm) => {
      return {
        ...vm,
        ...nonExistingProperties
      }
    })

    const expectedError = ERROR.VIEW_MODEL_MOCKING.HAS_NON_EXISTING_PROPERTIES(
      Object.keys(nonExistingProperties)
    )

    expect(usePresenter).toThrow(expectedError)
  })

  it('throws if the mocked view model does not have all the properties from the actual view model', () => {
    const usePresenter = testHarness.createPresenterHook()

    const actualViewModelValues = testHarness.actualViewModelValues

    delete actualViewModelValues.isProductsLoading

    // @ts-expect-error - purposefully does not return all view model properties
    usePresenter.mockViewModel(() => {
      return actualViewModelValues
    })

    const expectedError = ERROR.VIEW_MODEL_MOCKING.PROPERTIES_ARE_MISSING(['isProductsLoading'])

    expect(usePresenter).toThrow(expectedError)
  })
})

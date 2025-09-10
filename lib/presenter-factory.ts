import { computed, getCurrentScope, onMounted } from 'vue'

import { ERROR } from '@/constants/error'
import { tryOnScopeDispose } from '@/helpers/try-on-scope-dispose'
import type {
  PresenterConfig,
  PresenterFactoryFunction,
  PresenterHookOutput,
  Props,
  View,
  ViewModelOverride
} from '@/presenter-factory.types'
import { validatePresenterConfig, validateViewModelOverride } from '@/validators'

/**
 * @example
 * const useDocumentOverviewPresenter = presenterFactory(() => {
 *   const state = reactive({ showSkeleton: false })
 *
 *   return {
 *     viewModel: computed(() => {
 *       return {
 *         isPageSkeletonLoaderShown: state.showSkeleton
 *       }
 *     }),
 *
 *     onCreated() { ... },
 *     onDestroy() { ... }
 *   }
 * })
 *
 * const { presenter, viewModel } = useDocumentOverviewPresenter()
 */
export function presenterFactory<
  TPresenterOptions extends PresenterConfig,
  TProps extends Props = void,
  TView extends View = void
>(presenterFactoryFunction: PresenterFactoryFunction<TProps, TView, TPresenterOptions>) {
  const cachedPresenterInstance = {
    value: undefined as TPresenterOptions | undefined,
    reset() {
      this.value = undefined
    }
  }

  const viewModelOverride = {
    value: undefined as ViewModelOverride<TPresenterOptions> | undefined,
    reset() {
      this.value = undefined
    }
  }

  function createPresenterProxy(
    presenterOptions: TPresenterOptions,
    viewModelOverride: ViewModelOverride<TPresenterOptions>
  ) {
    return new Proxy(presenterOptions, {
      get(target, property: keyof PresenterConfig) {
        if (property === 'viewModel') {
          return computed(() => viewModelOverride(target.viewModel.value))
        }

        return Reflect.get(target, property)
      }
    })
  }

  function createFallbackPresenterAndViewModel() {
    return {
      presenter: {},
      viewModel: computed(() => {
        return {}
      })
    } as PresenterHookOutput<TPresenterOptions>
  }

  /**
   * @example
   * const { viewModel, presenter } = useFooPresenter(props, view)
   */
  function usePresenterHook(props: TProps, view: TView): PresenterHookOutput<TPresenterOptions> {
    let presenterApi: TPresenterOptions

    try {
      presenterApi = presenterFactoryFunction(props, view)
    } catch (errorInPresenter) {
      /**
       * Prevent Vue component templates from breaking during render
       * when they access the viewModel like this `my-attr="viewModel.someProperty"`.
       * Else we would get errors "TypeError: Cannot read properties of undefined (reading 'someProperty')"
       */
      if (getCurrentScope()) {
        onMounted(() => {
          throw errorInPresenter
        })

        return createFallbackPresenterAndViewModel()
      }

      throw errorInPresenter
    }

    validatePresenterConfig(presenterApi)

    if (viewModelOverride.value)
      validateViewModelOverride(viewModelOverride.value, presenterApi.viewModel.value)

    tryOnScopeDispose(() => {
      presenterApi.onDestroy?.()
      cachedPresenterInstance.reset()
    })

    presenterApi.onCreated?.()

    const presenterOptions = viewModelOverride.value
      ? createPresenterProxy(presenterApi, viewModelOverride.value)
      : presenterApi

    cachedPresenterInstance.value = presenterOptions

    viewModelOverride.reset()

    return {
      presenter: presenterOptions,
      viewModel: presenterOptions.viewModel
    }
  }

  /**
   * @example
   * const wrapper = mount(DocumentOverview)
   * const { viewModel } = useDocumentOverviewPresenter.spy()
   *
   * expect(viewModel.value.amountOfClicks).toBe(0)
   * wrapper.find('button').trigger('click')
   * expect(viewModel.value.amountOfClicks).toBe(1)
   */
  usePresenterHook.spy = function (): PresenterHookOutput<TPresenterOptions> {
    const presenterOptions = cachedPresenterInstance.value

    if (!presenterOptions) throw ERROR.SPYING.NO_PRESENTER_INSTANCE

    cachedPresenterInstance.reset()

    return {
      presenter: presenterOptions,
      viewModel: presenterOptions.viewModel
    }
  }

  // TODO: resetSpy needs testing
  usePresenterHook.resetSpy = function () {
    cachedPresenterInstance.reset()
  }

  /**
   * @example
   * useDocumentOverviewPresenter.mockViewModel((viewModel) => {
   *   return {
   *     ...viewModel,
   *     showPageSkeletonLoader: true,
   *   }
   * })
   */
  usePresenterHook.mockViewModel = function (
    viewModelOverrideFunction: ViewModelOverride<TPresenterOptions>
  ) {
    viewModelOverride.value = viewModelOverrideFunction
  }

  return usePresenterHook
}

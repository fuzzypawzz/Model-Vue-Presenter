import type { ComputedRef } from 'vue'

// TODO: Write tests for types

export type Props = object | void
export type View = object | void

export type PresenterConfig = {
    viewModel: ComputedRef

    /**
     * @description The onCreated hook is invoked when the presenter is resolved.
     */
    onCreated?(): void

    /**
     * @description The onDestroy hook is called when the Vue component unmounts.
     * If you're using a presenter without its component (during testing, for example),
     * then you must ensure to call this hook manually.
     */
    onDestroy?(): void
}

type RemoveInternalPresenterHooks<TPresenterConfig extends PresenterConfig> = Omit<
    TPresenterConfig,
    'onCreated' | 'onDestroy'
>

type UnwrapComputedRef<T extends ComputedRef> = T['value']

/**
 * @description Callback function used override properties on a presenter view model.
 */
export type ViewModelOverride<TPresenterConfig extends PresenterConfig> = <
    TViewModel extends UnwrapComputedRef<TPresenterConfig['viewModel']>
>(
    viewModel: TViewModel
) => TViewModel

export type PresenterHookOutput<TPresenterConfig extends PresenterConfig> = {
    presenter: RemoveInternalPresenterHooks<TPresenterConfig>
    viewModel: TPresenterConfig['viewModel']
}

export type PresenterFactoryFunction<
    TProps,
    TView,
    TPresenterConfig extends PresenterConfig
> = (props: TProps, view: TView) => TPresenterConfig
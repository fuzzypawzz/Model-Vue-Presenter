import { isReadonly } from "vue";
import { ERROR } from "@/constants/error";
import { PresenterConfig, ViewModelOverride } from "@/presenter-factory.types";

export function validatePresenterConfig(config: PresenterConfig) {
    if (!isReadonly(config.viewModel)) {
        throw new Error(ERROR.PRESENTER_CONFIG.VIEW_MODEL_IS_NOT_COMPUTED)
    }

    if (config.onCreated && typeof config.onCreated !== 'function') {
        throw new Error(ERROR.PRESENTER_CONFIG.ON_CREATED_HOOK_NOT_A_FUNCTION)
    }

    if (config.onDestroy && typeof config.onDestroy !== 'function') {
        throw new Error(ERROR.PRESENTER_CONFIG.ON_DESTROY_HOOK_NOT_A_FUNCTION)
    }
}

export function validateViewModelOverride(viewModelOverride: ViewModelOverride<PresenterConfig>, actualViewModel: Record<string, unknown>) {
    const mockedViewModel = viewModelOverride(actualViewModel)

    const nonExistingProperties = Object.keys(mockedViewModel).filter(key => !(key in actualViewModel))
    const missingProperties = Object.keys(actualViewModel).filter(key => !(key in mockedViewModel))

    if (nonExistingProperties.length) {
        throw new Error(ERROR.VIEW_MODEL_MOCKING.HAS_NON_EXISTING_PROPERTIES(nonExistingProperties))
    }

    if (missingProperties.length) {
        throw new Error(ERROR.VIEW_MODEL_MOCKING.PROPERTIES_ARE_MISSING(missingProperties))
    }
}
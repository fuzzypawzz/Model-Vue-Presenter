export const ERROR = {
    PRESENTER_CONFIG: {
        INFO: 'PresenterFactory: The configuration returned by the factory function is invalid.',
        get VIEW_MODEL_IS_NOT_COMPUTED() {
            return `${this.INFO} The 'viewModel' property must be a Vue computed property.`
        },
        get ON_CREATED_HOOK_NOT_A_FUNCTION() {
            return `${this.INFO} The 'onCreated' property must be a function.`
        },
        get ON_DESTROY_HOOK_NOT_A_FUNCTION() {
            return `${this.INFO} The 'onDestroy' property must be a function.`
        }
    },

    VIEW_MODEL_MOCKING: {
        INFO: 'PresenterFactory: The mocked view model is invalid.',
        PROPERTIES_ARE_MISSING(properties: string[]) {
            return `${this.INFO} Properties ${properties} are missing in the mocked view model.`
        },

        HAS_NON_EXISTING_PROPERTIES(properties: string[]) {
            return `${this.INFO} Mocked view model properties ${properties} doesn't exist in the actual view model.`
        }
    },

    SPYING: {
        INFO: 'PresenterFactory: Failed to spy on presenter.',
        get NO_PRESENTER_INSTANCE() {
            return `${this.INFO} Did you call your presenter hook before calling spy().`
        }
    }
}
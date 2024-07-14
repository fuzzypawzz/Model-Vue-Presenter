import { presenterFactory } from "../../lib/main";
import { computed, reactive } from "vue";

export const usePetStorePresenter = presenterFactory(() => {
    const state = reactive({
        products: [] as string[],
        isProductsLoading: true
    })

    const greeting = computed(() => {
        return state.isProductsLoading ? 'Finding available pets for sale' : 'Welcome to my pet store'
    });

    (function fakeLoadingOfProducts() {
        setTimeout(() => {
            state.products.push('Cats', 'Dogs', 'Crocodiles')
            state.isProductsLoading = false
        }, 50)
    })()

    return {
        viewModel: computed(() => ({
            headline: greeting.value,
            pets: state.products,
            showSkeletonLoader: state.isProductsLoading
        }))
    }
})
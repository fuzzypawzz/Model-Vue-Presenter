import { presenterFactory } from '../../../../lib/main'
import { computed, reactive } from 'vue'

export const usePetStorePresenter = presenterFactory(() => {
  const state = reactive({
    isLoading: true,
    pets: [] as string[],
  })

  return {
    viewModel: computed(() => ({
      headline: state.isLoading ? 'Loading...' : 'Welcome',
      pets: state.pets,
      showSkeletonLoader: state.isLoading,
    })),
  }
})

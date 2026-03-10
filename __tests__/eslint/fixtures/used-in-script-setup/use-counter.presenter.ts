import { presenterFactory } from '../../../../lib/main'
import { computed, ref } from 'vue'

export const useCounterPresenter = presenterFactory(() => {
  const count = ref(0)

  return {
    viewModel: computed(() => ({
      count: count.value,
      isEven: count.value % 2 === 0,
    })),
  }
})

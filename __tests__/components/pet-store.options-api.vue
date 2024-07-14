<template>
  <div>
    <h2>{{ viewModel.headline }}</h2>

    <p v-if="viewModel.showSkeletonLoader">Loading...</p>

    <ol>
      <li v-for="pet in viewModel.pets" :key="pet">
        {{ pet }}
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { usePetStorePresenter } from "../tooling/use-pet-store.presenter";

export default defineComponent({
  name: "pet-store.options-api.vue",

  setup() {
    const { viewModel } = usePetStorePresenter()

    return { viewModel }
  }
})
</script>
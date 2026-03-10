<template>
  <div>
    <h2>{{ viewModel.headline }}</h2>
    <ol>
      <li v-for="pet in viewModel.pets" :key="pet">{{ pet }}</li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { usePetStorePresenter } from './use-pet-store.presenter'
const { viewModel } = usePetStorePresenter()
</script>

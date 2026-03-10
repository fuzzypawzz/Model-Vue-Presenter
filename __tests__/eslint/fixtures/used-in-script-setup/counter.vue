<template>
  <div>{{ viewModel.count }}</div>
</template>

<script setup lang="ts">
import { useCounterPresenter } from './use-counter.presenter'
import { watch } from 'vue'
const { viewModel } = useCounterPresenter()
watch(() => viewModel.value.isEven, (val) => console.log(val))
</script>

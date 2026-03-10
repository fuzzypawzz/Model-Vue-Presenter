<template>
  <div>{{ counterVM.count }}</div>
</template>

<script setup lang="ts">
import { useCounterPresenter } from './use-counter.presenter'
import { watch } from 'vue'
const { viewModel: counterVM } = useCounterPresenter()
watch(() => counterVM.value.isEven, (val) => console.log(val))
</script>

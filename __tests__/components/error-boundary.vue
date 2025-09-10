<template>
  <p v-if="currentError">{{ currentError }}</p>
  <slot v-else />
</template>

<script lang="ts" setup>
import { onErrorCaptured, ref } from 'vue'

const currentError = ref<Error | null>(null)

onErrorCaptured((error) => {
  currentError.value = error
  return false
})
</script>

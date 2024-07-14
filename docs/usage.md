# Usage examples

## Products page presenter

Here's a simple example of a products page presenter.

The presenter manages some local state like a skeleton loader while it's fetching some products from the model.

```ts
import { reactive, computed } from "vue"
import { presenterFactory } from "@model-vue-presenter"

import { useAvailableProducts, fetchAvailableProducts } from '../'

export const useProductsPagePresenter = presenterFactory(() => {
  const products = useAvailableProducts()
  
  const skeletonLoader = reactive({
    isShown: false,
    show() { this.isShown = true },
    hide() { this.isShown = false },
  })
  
  return {
    viewModel: computed(() => ({
      isSkeletonLoaderShown: skeletonLoader.isShown,
      productPageHeading: 'Available products',
      products: products.value
    })),
    
    onCreated() {
      skeletonLoader.show()
      fetchAvailableProducts().finally(() => {
        skeletonLoader.hide()
      })
    },
  }
})
```
### Consuming the view model

The presenter hook returns a computed viewModel and the presenter instance when invoked.

Due to the nature of Vue's ecosystem, the computed viewModel is automatically unwrapped when referenced in the template.

The syntax is simple, yet powerful.

```vue
<template>
  <h2>{{ viewModel.productPageHeading }}</h2>
  
  <skeleton-loader v-if="viewModel.isSkeletonLoaderShown" />
  
  <div v-else>
    <product-card v-for="product in viewModel.products" :key="product.id">
      <template #header>
        {{ product.name }}
      </template>
        
      <template #price>
        {{ product.price }}
      </template>
    </product-card>
  </div>
</template>

<script setup lang="ts">
import { useProductsPagePresenter } from './'
   
const { viewModel, presenter } = useProductsPagePresenter()
</script>
```
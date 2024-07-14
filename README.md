# Model-View-Presenter toolkit for Vue 3

The toolkit enables you to easily leverage the Model-View-Presenter design pattern in Vue 3 apps.

Separate logic from the Vue components and reduce code coupling.

Works with both `Options API` and `Composition API`.

### Examples

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

```ts
import { reactive, computed } from "vue"
import { presenterFactory } from "@model-vue-presenter"

import { useAvailableProducts, fetchAvailableProducts } from '../'

type Props = void
type View = void

export const useProductsPagePresenter = presenterFactory((props, view) => {
  const products = useAvailableProducts()
  
  const skeletonLoader = reactive({
    isShown: false,
    show() { this.isShown = true },
    hide() { this.isShown = false },
  })
  
  return {
    viewModel: computed(() => {
      return {
        isSkeletonLoaderShown: skeletonLoader.isShown,
        productPageHeading: 'Available products',
        products: products.value
      }
    }),

    // Invoked when the vue component is created.
    onCreated() {
      skeletonLoader.show()
      fetchAvailableProducts().finally(() => {
        skeletonLoader.hide()
      })
    },

    // Invoked when the vue component scope is disposed.
    onDestroy() {
      // ...
    }
  }
})
```

### Documentation

I am currently working on a documentation site. I will publish it as soon as it's ready.
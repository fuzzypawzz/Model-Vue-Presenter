# Model-View-Presenter toolkit for Vue 3

The toolkit enables you to easily leverage the Model-View-Presenter design pattern in Vue 3 apps.

Separate logic from the Vue components and reduce code coupling.

### Documentation

For detailed documentation, including API references, tutorials, and more, please see the [documentation site](https://fuzzypawzz.github.io/Model-Vue-Presenter).

### Installation

To begin with Model-Vue-Presenter, simply install the library:

```bash
$ npm install model-vue-presenter
# or
yarn add model-vue-presenter
```

### Examples

#### Clean vue component, implementing a presenter:

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

#### Simple presenter file:
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

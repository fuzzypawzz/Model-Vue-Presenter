# Installation

To begin with Model-Vue-Presenter, simply install the library:

```bash
$ npm install model-vue-presenter
# or
yarn add model-vue-presenter
```

Import and use the presenter factory function:

```ts
import { presenterFactory } from "@model-vue-presenter";
import { computed } from "vue";

const usePresenter = presenterFactory(() => {
  return {
    viewModel: computed(() => ({}))
  }
})
```
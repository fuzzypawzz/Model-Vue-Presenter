# PresenterFactory

The factory function is used to create a presenter hook for a Vue component.

## presenterFactory()

### Type
```ts
function presenterFactory(callback: (props: object | void, view: object | void) => PresenterConfig): PresenterHook
```

### Example

```ts
import { computed } from 'vue'
import { presenterFactory } from '@model-vue-presenter'

type Props = void
type View = void

const usePresenter = presenterFactory((props, view) => {
  return {
    viewModel: computed(() => ({
      // ...
    })),

    onCreated() {},
    onDestroy() {},
  }
})
```

## viewModel

The presenter configuration callback must return a viewModel.

The viewModel property must be a Vue computed property.

### Type
```ts
type ViewModel = ComputedRef<Record<string, unknown>>
```

### Example

```ts{3,4,5}
export const usePresenter = presenterFactory(() => {
  return {
    viewModel: computed(() => ({
      heading: 'Hello world'
    })),
  }
})
```

## props and view references

You can optionally pass Vue component props and/or view references.

### Type
```ts
type Props = Record<string, unknown>
```
```ts
type View = Record<string, unknown>
```

::: info
Make sure you don't destructure props in your Vue component as they will lose reactivity.
You must always pass the entire props object to the presenter.
:::

### Example

```ts{1}
export const usePresenter = presenterFactory((props, view) => {
  return {
    viewModel: computed(() => ({
      heading: 'Hello world'
    })),
  }
})
```

```vue{8}
<script setup lang="ts">
const props = defineProps()

const viewReferences = {
  someFunction: () => {}
}
  
const { viewModel, presenter } = usePresenter(props, viewReferences) 
</script>
```

## onCreated()

The presenter has an optional internal lifecycle hook which is called when the related Vue component is created.

::: info
The onCreated hook must be synchronous. Vue will not clean up reactive watchers if they are created asynchronously. See the official Vue documentation for more info. 
:::
### Type
```ts
function onCreated(): void
```

### Example

```ts
export const usePresenter = presenterFactory((props, view) => {
  return {
    // ...
    onCreated() {
      // Logic to be executed when the component is created.
    }
  }
})
```

## onDestroy()

The presenter has an optional internal lifecycle hook which is called when the related Vue component is destroyed.
### Type
```ts
function onDestroy(): void
```

### Example

```ts
export const usePresenter = presenterFactory((props, view) => {
  return {
    // ...
    onDestroy() {
      // Logic to be executed when the component is destroyed.
    }
  }
})
```

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
import { presenterFactory } from 'model-vue-presenter'

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

## mockViewModel()

You can mock a presenter view model. Useful for mocking components in Storybook.

The new returned viewModel must contain the same properties as the original viewModel. 

The presenter will throw an error if the viewModel doesn't contain all the required properties.

### Type
```ts
function mockViewModel(): ViewModel
```

### Example

Here we are mocking a viewModel's skeleton loader and heading state.
Ideal for showing a specific component in a "loading" state in Storybook for example.
```ts
usePresenter.mockViewModel((viewModel) => {
  return {
    ...viewModel,
    isSkeletonLoaderShown: true,
    heading: 'My overwritten heading text',
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

## Spy

You can spy on a presenter instance. This is useful during unit and integration testing.

### Type
```ts
function spy(): PresenterHook
```

### Example

Here's an example where we spy on the presenter instance in order to write assertions against the viewModel.

The Vue component instance will interact with the presenter, but you can still get read access to the viewModel by using the spy() function.

```ts
import waitForExpect from "wait-for-expect";

it('loads some products data when clicking the button', async () => {
  const wrapper = mount(component)
  
  const { viewModel } = usePresenter.spy()

  // Idle state
  expect(viewModel.value.products.length).toBeFalsy()

  // Click the button
  wrapper.find('button').trigger('click')
  
  await waitForExpect(() => {
    expect(viewModel.value.products.length > 10).toBeTruthy()
  })
})
```

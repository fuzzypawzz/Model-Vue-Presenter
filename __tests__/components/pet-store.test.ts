import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import PetStoreUsingCompositionApi from './pet-store.composition-api.vue'
import PetStoreUsingOptionsApi from './pet-store.options-api.vue'
import waitForExpect from "wait-for-expect";
import { usePetStorePresenter } from "../tooling/use-pet-store.presenter";

it.each([
    PetStoreUsingCompositionApi,
    PetStoreUsingOptionsApi
])('renders the view model from the presenter', async (component) => {
    const wrapper = mount(component)

    const { viewModel } = usePetStorePresenter.spy()

    const getHeading = () => wrapper.find('h2')
    const getSkeletonLoader = () => wrapper.find('p')
    const getPetList = () => wrapper.find('ol')

    expect(getHeading().text()).toBe(viewModel.value.headline)
    expect(getSkeletonLoader().exists()).toBe(true)
    expect(getPetList().text()).toBe('')

    await waitForExpect(() => {
        expect(viewModel.value.showSkeletonLoader).toBe(false)
    })

    expect(getHeading().text()).toBe(viewModel.value.headline)
    expect(getSkeletonLoader().exists()).toBe(false)

    const listItems = getPetList().findAll('li')

    viewModel.value.pets.forEach((pet, i) => {
        expect(listItems[i].text()).toBe(pet)
    })
})

it.each([
    PetStoreUsingCompositionApi,
    PetStoreUsingOptionsApi
])('renders the mocked view model from the presenter', (component) => {
    const pets = ['Mockingbirds', 'Mocking Giraffes']

    usePetStorePresenter.mockViewModel((vm) => {
        return {
            ...vm,
            headline: 'A mocked zoo',
            showSkeletonLoader: false,
            pets,
        }
    })

    const wrapper = mount(component)

    const getHeading = () => wrapper.find('h2')
    const getSkeletonLoader = () => wrapper.find('p')
    const getPetList = () => wrapper.find('ol')

    expect(getHeading().text()).toBe('A mocked zoo')
    expect(getSkeletonLoader().exists()).toBe(false)

    const listItems = getPetList().findAll('li')

    pets.forEach((pet, i) => {
        expect(listItems[i].text()).toBe(pet)
    })
})
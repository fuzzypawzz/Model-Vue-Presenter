# Introduction

Welcome to Model-Vue-Presenter, a powerful and flexible library designed to enhance your Vue 3 applications by implementing the Model-View-Presenter (MVP) design pattern. 

With Model-Vue-Presenter, you can decouple business logic from your Vue components, resulting in cleaner, more maintainable code.

## Why Model-View-Presenter (MVP)?

The MVP design pattern is a user interface architectural pattern engineered to facilitate the separation of concerns within your application. By splitting the application into three core components—Model, View, and Presenter—you can achieve a more modular, testable, and scalable codebase.

#### Model: 
Represents the data layer of your application. It is responsible for managing the data and business logic, ensuring that all changes to the data are properly handled.

#### View:
The visual layer (the Vue component), which displays the data to the user. It is responsible for rendering the UI and receiving user input.

#### Presenter: 
Acts as an intermediary between the Model and the View. It retrieves data from the Model, formats it, and updates the View. Additionally, 
it processes user interactions and commands the Model to update accordingly.

## Benefits
There are of a couple of great benefits of using this design pattern in UI apps.

#### Separation of Concerns:
Keep your business logic separate from your UI components, making your Vue components more readable and easier to maintain.

#### Testability:
With business logic isolated in the Presenter, unit testing becomes straightforward and effective.

You can test against your view models and call functions on the Presenter just like the Vue component would do it at runtime.

The library also exposes functions to spy on presenter instances, so you can write assertions towards presenters which are invoked indirectly in the component tree.

#### Scalability: 
The decoupled structure promotes scalability. You Vue components will become leaner as they only depend on the view model and possibly a presenter interface.

This means that you can move and refactor your Vue components faster and with less effort.

#### Easy component mocking in Storybook:
The library comes with a typesafe mocking function that you can use to mock the presenter view models.

This is especially ideal for usage in Storybook where mocking can sometimes be a pain depending on the complexity of your components.
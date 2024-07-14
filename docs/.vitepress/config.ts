import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Model-Vue-Presenter",
  description: "Documentation for the Model Vue Presenter library",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/presenter-factory' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Installation', link: '/installation' },
          { text: 'Usage', link: '/usage' },
        ]
      },
      {
        text: 'Presenter API',
        items: [
          { text: 'PresenterFactory', link: '/presenter-factory' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/fuzzypawzz/Model-Vue-Presenter' }
    ]
  }
})

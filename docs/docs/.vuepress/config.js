const version = require("./../../package.json").version;
const glob = require('glob');

function printConfig(config) {
  console.log("config.themeConfig.sidebar =", config.themeConfig.sidebar)
  return config;
}

module.exports = printConfig({
  configureWebpack: {
    resolve: {
      alias: {
        '@img': '/img/'
      }
    }
  },
  // title: `heliosRX ${version}`,
  title: `heliosRX`,
  description: "Examples of useful vuepress code",
  head: [
    ['link', { rel: 'icon', href: '/logo-small.png' }]
  ],
  plugins: [
  ],
  themeConfig: {
    lastUpdated: false,
    logo: '/logo-small.png',
    repo: "heliosRX/heliosRX",
    repoLabel: "Github",
    displayAllHeaders: true,
    // sidebar: markdownFiles,
    sidebar: {
      '/guide/': getGuideSidebar('Guide', 'Basic usage', 'Tutorials'),
      '/api/': getApiSidebar(),
      '/tips/': getTipsSidebar('Firebase', 'Advanced'),
      // '/plugin/': getPluginSidebar('Plugin', 'Introduction', 'Official Plugins'),
      // '/guide/': {
      //   title: 'Guide',     // required
      //   // path: '/guide/',    // optional, which should be a absolute path.
      //   collapsable: false,  // optional, defaults to true
      //   sidebarDepth: 2,    // optional, defaults to 1
      //   children: markdownFiles,
      // },
    },
    // ['FOO', 'FOO'],
    // ['BAR', 'BAR'],
    // ...markdownFiles
    /*
    sidebar: {
      '/reference/': [
        '',              // /foo/
        ['one', 'ONE'],  // /foo/one.html
        ['two', 'TWO']   // /foo/two.html
      ],
      '/guide': {
        title: 'Group 1',   // required
        path: '/docs/',      // optional, which should be a absolute path.
        collapsable: false, // optional, defaults to true
        sidebarDepth: 1,    // optional, defaults to 1
        children: [
          '/'
        ]
      },
    },
    */
    /*
    "A": ["/", "Home"],
    "A": ["/docs/homepage/", "A Homepage Fit for Heroes"],
    "A": "/docs/foo",
    "A": "/docs/extending/",

    sidebar: [
      {
       title: 'Group 1',   // required
       path: '/docs/',      // optional, which should be a absolute path.
       collapsable: false, // optional, defaults to true
       sidebarDepth: 1,    // optional, defaults to 1
       children: [
         '/'
       ]
      },
    ], */
    nav: [
      { text: 'Home',  link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API',   link: '/api/' },
      { text: 'Tips', link: '/tips/' },
      // { text: 'External', link: 'https://google.com' }
    ],
  },
  extendMarkdown(md) {
    lineNumbers: true
  },
});

function getApiSidebar () {
  let markdownFiles = glob
    .sync('docs/api/**/*.md')
    .map(f => f.substr(5+4).replace('README.md', ''))
    .sort();
  // console.log("markdownFiles", markdownFiles)

  return markdownFiles;
  // return [
  //   'one',
  //   'two'
  // ]
}

function getGuideSidebar (groupA, groupB, groupC) {

  // update the docs/**/*.md pattern with your folder structure
  let markdownFiles = glob
    .sync('docs/guide/*.md')
    .map(f => f.substr(5+6))
    .filter(f => !f.includes('README.md'))
    .sort()

  let markdownFilesTutorial = glob
    .sync('docs/guide/tutorial/*.md')
    .map(f => f.substr(5+6))
    .filter(f => !f.includes('README.md'))
    .sort()

  return [
    {
      title: groupA,
      collapsable: true,
      children: markdownFiles,
    },
    {
      title: groupB,
      collapsable: false,
      children: [
        'basics/01-5-minute-intro.md',
        'basics/02-cheat-sheet.md',
      ],
    },
    {
      title: groupC,
      collapsable: false,
      children: markdownFilesTutorial,
    }
  ]
}

function getTipsSidebar (groupA, groupB) {

  // update the docs/**/*.md pattern with your folder structure
  let markdownFiles = glob
    .sync('docs/tips/*.md')
    .map(f => f.substr(5+5))
    .filter(f => !f.includes('README.md'))
    .sort()

  return [
    {
      title: groupA,
      collapsable: false,
      children: markdownFiles,
    },
    // {
    //   title: groupB,
    //   collapsable: false,
    //   children: markdownFilesTutorial,
    // }
  ]
}

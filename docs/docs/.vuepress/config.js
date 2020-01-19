const version = require("../../../package.json").version;
const glob = require('glob');

const isTLD = false; // Only private build

function printConfig(config) {
  console.log("config.themeConfig.sidebar =", config.themeConfig.sidebar)
  return config;
}

module.exports = printConfig({
  base: isTLD ? '/heliosrx/' : '/',
  configureWebpack: {
    resolve: {
      alias: {
        '@img': '/img/'
      }
    }
  },
  title: `heliosRX (v${version})`,
  // title: `heliosRX`,
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
    repoLabel: "GitHub",
    displayAllHeaders: true,
    sidebar: {
      '/guide/': getGuideSidebar('Guide', 'Basic usage', 'Tutorials', 'Advanced'),
      '/api/':   getApiSidebar(),
      '/tips/':  getTipsSidebar('Firebase Security Rules', 'Migration'),
    },
    nav: [
      { text: 'Guide', link: '/guide/01-intro' },
      { text: 'API',   link: '/api/' },
      { text: 'Tips', link: '/tips/01-designing-good-security-rules' },
      // { text: 'GitHub', link: 'https://github.com/heliosRX/heliosRX' }
    ],
  },
  extendMarkdown(md) {
    lineNumbers: true
  },
});

function getApiSidebar() {
  let markdownFiles = glob
    .sync('docs/api/**/*.md')
    .map(f => f.substr(5+4).replace('README.md', ''))
    .sort();

  return markdownFiles;
}

function readFileList( name ) {
  return glob
    .sync('docs/guide/' + name + '/*.md')
    .map(f => f.substr(5+6))
    .filter(f => !f.includes('README.md'))
    .sort()
}

function getGuideSidebar( groupA, groupB, groupC, groupD ) {

  // update the docs/**/*.md pattern with your folder structure

  let markdownFilesBasics = readFileList('');
  let markdownFilesTutorial = readFileList('tutorial');
  let markdownFilesAdvanced = readFileList('advanced');

  return [
    {
      title: groupA,
      collapsable: false,
      children: markdownFilesBasics,
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
    },
    {
      title: groupD,
      collapsable: false,
      children: markdownFilesAdvanced,
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

  let markdownFilesMigration = glob
    .sync('docs/tips/migration/*.md')
    .map(f => f.substr(5+5))
    .sort()
  console.log("markdownFilesMigration", markdownFilesMigration)

  return [
    {
      title: groupA,
      collapsable: false,
      children: markdownFiles,
    },
    {
      title: groupB,
      collapsable: false,
      children: markdownFilesMigration,
    }
  ]
}

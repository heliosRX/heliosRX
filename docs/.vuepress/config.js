const version = require("../../package.json").version;
const glob = require('glob');

const isTLD = false; // Only private build
const isDev = ( process.env.NODE_ENV === "development");
const ifDev = ( x ) => isDev ? x : null

const tree = {
  'api': [
    'setup',
    'generic-store',
    'schema-definition',
    'generic-model',
    'generic-list',
    'ready-api', // !!!
    'enums',
    'CLI',
    // ifDev('_dump'),
  ],
  // 'tips': [
  // ],
  'tips': [
    'designing-good-security-rules',
    'lessons-learned',
    'bolt-cheat-sheet',
    'security-rules-tips',
    'how-to-debug-security-rules',
    ifDev('_database-design'),
  ],
  'tips/migration': [
    'migration-1',
    'future',
  ],
  'guide/intro': [
    'intro',
    'installation',
    'configuration',
    'example-project',
    ifDev('_backend'),
  ],
  'guide/basics': [
    '15-minute-intro',
    'cheat-sheet',
  ],
  'guide/tutorial': [
    'schema-definition',
    'fetch-and-subscribe',
    'updating-data',
    'nested-data',
    'custom-getters-and-actions',
    'relations',
  ],
  'guide/advanced': [
    'internals',
    'backends',
    'plugins',
    ifDev('logging'),
  ],
};

function getChildren( section, prefix = false ) {
  if ( !( section in tree ) ) {
    // read from fs
    return glob
      .sync(section + '/*.md')
      .map(f => f.substr( section.length + 1 ))
      .filter(f => !f.includes('README.md'))
      .filter(f => isDev || !f.startsWith('_'))
      .sort()
      .map(item => ( prefix ? ( '/' + section + '/' ) : '' ) + item)
  }
  return tree[ section ]
    .filter(f => f)
    .map(item => '/' + section + '/' + item + '.md')
}

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
  // title: `heliosRX (v${version})`,
  title: `heliosRX`,
  description: `heliosRX documention (v${version})`,
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
    activeHeaderLinks: true,
    displayAllHeaders: true, // only guide would be nice
    sidebar: {
      '/guide/': [
        {
          title: 'Guide',
          collapsable: false,
          children: getChildren('guide/intro'),
          // path: '/foo/',      // optional, which should be a absolute path.
          // sidebarDepth: 1,    // optional, defaults to 1
        },
        {
          title:  'Basic usage',
          collapsable: false,
          children: getChildren('guide/basics'),
        },
        {
          title: 'Tutorials',
          collapsable: false,
          children: getChildren('guide/tutorial'),
        },
        {
          title: 'Advanced',
          collapsable: false,
          children: getChildren('guide/advanced'),
        }
      ],
      '/api/':  getChildren('api'),
      '/tips/': [
        {
          title: 'Firebase Security Rules',
          collapsable: false,
          children: getChildren('tips'),
        },
        {
          title: 'Migration',
          collapsable: false,
          children: getChildren('tips/migration'),
        }
      ],
    },
    nav: [
      { text: 'Guide', link: '/guide/intro/intro.html' },
      { text: 'API',   link: '/api/' },
      { text: 'Tips',  link: '/tips/designing-good-security-rules.html' },
    ],
  },
  extendMarkdown(md) {
    lineNumbers: true
  },
});

if ( isDev ) {
  module.exports.themeConfig.sidebar['/dev/'] = [
    {
      title: 'DEV',
      collapsable: false,
      children: getChildren('dev'),
    },
    {
      title: 'WIP',
      collapsable: false,
      children: getChildren('dev/wip', true),
    },
    {
      title: 'ROADMAP',
      collapsable: false,
      children: ['/ROADMAP'],
    }
  ],
  module.exports.themeConfig.nav.push({ text: 'DEV ⚙️', link: '/dev/' });
}

const path = require('path')
const buble = require('@rollup/plugin-buble')
const replacePlugin = require('@rollup/plugin-replace')
const resolvePlugin = require('@rollup/plugin-node-resolve')
const commonjsPlugin = require('@rollup/plugin-commonjs');
const sizeSnapshot = require("rollup-plugin-size-snapshot").sizeSnapshot;

const version = process.env.VERSION || require('../package.json').version
const banner =
`/**
 * heliosRX v${version}
 * (c) ${new Date().getFullYear()} Thomas Weustenfeld
 * @license MIT
 */`

const resolve = _path => path.resolve(__dirname, '../', _path)

const configs = {
  umdDev: {
    input:  resolve('src/index.js'),
    file:   resolve('dist/heliosrx.js'),
    format: 'umd',
    env:    'development'
  },
  umdProd: {
    input:  resolve('src/index.js'),
    file:   resolve('dist/heliosrx.min.js'),
    format: 'umd',
    env:    'production'
  },
  commonjs: {
    input:  resolve('src/index.js'),
    file:   resolve('dist/heliosrx.common.js'),
    format: 'cjs'
  },
  esm: {
    input:  resolve('src/index.esm.js'),
    file:   resolve('dist/heliosrx.esm.js'),
    format: 'es'
  },
  'esm-browser-dev': {
    input:  resolve('src/index.esm.js'),
    file:   resolve('dist/heliosrx.esm.browser.js'),
    format: 'es',
    env:    'development',
    transpile: false
  },
  'esm-browser-prod': {
    input:  resolve('src/index.esm.js'),
    file:   resolve('dist/heliosrx.esm.browser.min.js'),
    format: 'es',
    env:    'production',
    transpile: false
  }
}

function genConfig (opts) {
  const config = {
    input: {
      input: opts.input,
      plugins: [
        replacePlugin({
          __VERSION__: version
        }),
        resolvePlugin(),
        commonjsPlugin({
          include: 'node_modules/**', // Default: undefined
        }),
        sizeSnapshot(),
      ]
    },
    output: {
      banner,
      file: opts.file,
      format: opts.format,
      name: 'heliosRX',
      globals: {
        vuex: 'Vuex',
      },
    },
    external: ['vuex']
  }

  if (opts.env) {
    config.input.plugins.unshift(replacePlugin({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  if (opts.transpile !== false) {
    config.input.plugins.push(buble({
      transforms: {
        modules: false,
      },
      objectAssign: 'Object.assign'
    }));
  }

  return config
}

function mapValues (obj, fn) {
  const res = {}
  Object.keys(obj).forEach(key => {
    res[key] = fn(obj[key], key)
  })
  return res
}

module.exports = mapValues(configs, genConfig)

// module.exports = {
//   'umdDev': genConfig(  )
// }
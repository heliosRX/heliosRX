const path = require('path')
const buble = require('@rollup/plugin-buble')
const replacePlugin = require('@rollup/plugin-replace')
const resolvePlugin = require('@rollup/plugin-node-resolve')
const commonjsPlugin = require('@rollup/plugin-commonjs')
// const sizeSnapshot = require("rollup-plugin-size-snapshot").sizeSnapshot;
// const ignorePlugin = require("rollup-plugin-ignore");

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
    env:    'development',
  },
  umdProd: {
    input:  resolve('src/index.js'),
    file:   resolve('dist/heliosrx.min.js'),
    format: 'umd',
    env:    'production',
  },
  commonjs: {
    input:  resolve('src/index.js'),
    file:   resolve('dist/heliosrx.common.js'),
    format: 'cjs',
    removeImportVue: true,
  },
  esm: {
    input:  resolve('src/index.esm.js'),
    file:   resolve('dist/heliosrx.esm.js'),
    format: 'es'
  },
  /* iife: {
    input:  resolve('src/index.js'),
    file:   resolve('dist/heliosrx.iife.js'),
    format: 'iife'
  }, */
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

/* function genConfigIngore (config, opts) {
  if ( opts.removeImportVue === true && false ) {
    config.input.plugins.push(ignorePlugin(
      [ 'vue', 'vuex' ]
    ));
  }
  return config
} */

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
          include: 'node_modules/**',
        }),
      ],
      // external: [ 'vuex', 'vue' ],
    },
    output: {
      banner,
      file: opts.file,
      format: opts.format,
      name: 'heliosRX',
      globals: {
        vue: 'Vue',
        vuex: 'Vuex',
      },
    },
  }

  if (opts.env) {
    config.input.plugins.unshift(replacePlugin({
      'process.env.NODE_ENV': JSON.stringify( opts.env )
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
    res[key] = fn(obj[key], key);
  })
  return res
}

// eslint-disable-next-line
function print( obj ) {
  console.log("---------------------------------------------------------------")
  console.log(obj)
  console.log("---------------------------------------------------------------")
  return obj;
}

module.exports = mapValues(configs, genConfig);

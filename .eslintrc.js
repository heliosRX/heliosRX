const config = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaFeatures: {
      modules: true
    }
  },
  env: {
    browser: true,
  },
  extends: [
    "plugin:vue-libs/recommended",
    'eslint:recommended',
    'standard',
  ],
  plugins: [
    'import'
  ],
  settings: {
    'import/extensions': [ ".js" ],
    'import/resolver': {
      'alias': {
        map: [
            ['@', './src/'],
        ],
        extensions: [ '.js' ]
      },
    }
  },
  rules: {
    // ---- modules
    'import/no-unresolved'        : ['error', {commonjs: true, amd: false}],
    'import/named'                : 'error',
    'import/namespace'            : 'error',
    'import/default'              : 'error',
    'import/export'               : 'error',
    'import/first'                : 'warn',
    // ---- styles (whitespaces, quotes, line breaks)
    'spaced-comment'              : 'off',
    'comma-dangle'                : 'off',
    'padded-blocks'               : 'off',
    'no-multi-spaces'             : 'off',
    'key-spacing'                 : 'off',
    'space-in-parens'             : 'off',
    'space-before-function-paren' : 'off',
    'indent'                      : 'off',
    'array-bracket-spacing'       : 'off',
    'quotes'                      : 'off',
    'semi'                        : 'off',
    'object-curly-spacing'        : 'off',
    'computed-property-spacing'   : 'off',
    'object-curly-newline'        : 'off',
    'no-irregular-whitespace'     : 'warn',
    'no-trailing-spaces'          : 'warn',
    'operator-linebreak'          : [ 'warn', 'before' ],
    'comma-spacing'               : [ 'warn', { 'after': true } ],
    'func-call-spacing'           : 'warn',
    'no-multiple-empty-lines'     : 'warn',
    'block-spacing'               : 'warn',
    'quote-props'                 : [ 'warn', "as-needed" ],
    // ---- other
    'camelcase'                   : 'off',
    'new-cap'                     : ['error', { 'capIsNew': false, 'newIsCap': true }],
    'no-debugger'                 : 'warn',
    'prefer-const'                : 'off', // might enable this
    'standard/no-callback-literal': 'off', // See https://github.com/standard/eslint-plugin-standard/issues/27
    'no-unused-vars'              : 'warn',
    'dot-notation'                : 'off',
    'no-floating-decimal'         : 'warn',
    'no-case-declarations'        : 'warn',
  }
  // TODO: Create my own preset
}

if ( process.env.npm_package_name === 'heliosrx'
  || process.title == 'linter-eslint helper' ) {
   module.exports = config;
} else {
  // Ignore linter, when using package with "yarn link"
  module.exports = {}
  console.warn("Ignoring heliosRX linter config!")

   /* let util = require('util');
   let fs = require('fs');
   fs.writeFile("editor-env-settings.js", util.inspect(process), () => {}); */
}

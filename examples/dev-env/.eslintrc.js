module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/essential',
    'standard',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  plugins: [
    'vue', // required to lint *.vue files
    'import'
  ],
  settings: {
    'import/extensions': [ ".js", ".vue" ],
    'import/resolver': {
      'alias': {
        map: [
            ['@', './src/'],
        ],
        extensions: [ '.js', '.vue' ]
      },
    }
  },
  rules: {
    // ---- modules
    'import/no-unresolved': 0,
    'import/named': 0,
    'import/namespace': 0, // good
    'import/no-duplicates': 0,
    'import/default': 0, // good
    'import/export': 2,
    'import/first': 'warn',
    'import/no-named-as-default-member': 0,
    // ----
    'spaced-comment': 0,
    'comma-dangle': 0, // NO NO NOPE
    'key-spacing': 0,
    'padded-blocks': 0,
    'no-multi-spaces': 0,
    'no-floating-decimal': 0,
    'func-call-spacing': 0,
    'indent': 'off',
    'quotes': 'off',
    'semi': 'off',
    'comma-spacing': 'off',
    'no-irregular-whitespace': 'off',
    'no-trailing-spaces': 'warn',
    'space-in-parens': 'off',
    'camelcase': 'off',
    'block-spacing': 'off',
    'no-unused-vars': 'warn',
    'space-before-function-paren': 'off',
    "new-cap": [2, { "capIsNew": false, "newIsCap": true }], // For immutable Record() etc.
    "no-class-assign": 0, // Class assign is used for higher order components.
    "no-nested-ternary": 0, // It's nice for JSX.
    "import/imports-first": 0, // Este sorts by atom/sort-lines natural order.
    "react/jsx-filename-extension": 0, // No, JSX belongs to .js files
    "no-confusing-arrow": 0, // This rule is super confusing.
    "arrow-parens": 0, // Not really.
    "no-debugger": process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "vue/no-use-v-if-with-v-for": 0,
    'operator-linebreak': 0, // This is stupid
    'standard/no-callback-literal': 0, // See https://github.com/standard/eslint-plugin-standard/issues/27
    'prefer-const': 0,
    'array-bracket-spacing': 0,
    'quote-props': [0],
    'computed-property-spacing': 0,
    'dot-notation': 0,
    'object-curly-newline': 0,
    'no-case-declarations': 0,
    'no-multiple-empty-lines': 0,
    'object-curly-spacing': 'warn'
  }
}

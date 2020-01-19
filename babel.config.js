module.exports = {
  presets: [
    // "env"
    // "@babel/preset-env",
    // "@babel/env"
    // [ "@vue/app", { corejs: 3, useBuiltIns: "entry" } ]
    [require('@babel/preset-env'), { 'modules': false }],
  ],
  plugins: [
    // "@babel/plugin-transform-runtime",
    // require('@babel/plugin-proposal-class-properties'),
    // [require('@babel/plugin-transform-for-of'), { assumeArray: true }],
    // ["@babel/plugin-proposal-class-properties", { "loose": false }],
    // "transform-object-rest-spread",
  ],
  env: {
    test: {
      "presets": [
        [require('@babel/preset-env'), { 'modules': false }],
        // [ "@babel/preset-env", { "useBuiltIns": "entry" } ]
      ],
      "plugins": [
        // "transform-es2015-modules-commonjs"
      ]
    }
  }
}

module.exports = {
  presets: [
    // [ "@vue/app", { corejs: 3, useBuiltIns: "entry" } ]
    // "@babel/preset-env",
    [require('@babel/preset-env'), { 'modules': false }],
  ],
  env: {
    test: {
      "presets": [
        [
          "@babel/preset-env",
          {
            "useBuiltIns": "entry"
          }
        ]
      ],
      "plugins": [
        "transform-es2015-modules-commonjs"
      ]
    }
  }
}

/*
module.exports = {
  'presets': [
  ],
  'plugins': [
    require('@babel/plugin-proposal-class-properties'),
    [require('@babel/plugin-transform-for-of'), { assumeArray: true }],
  ],
}
*/

module.exports = {
  presets: [
    // TODO: We might be able to get rid of babel entirely
    [require('@babel/preset-env'), { modules: false }],
    // '@babel/env'
  ],
  plugins: [
    // '@babel/plugin-transform-named-capturing-groups-regex',
    // ['@babel/plugin-transform-for-of', { assumeArray: true },
    // ['@babel/plugin-proposal-class-properties', { 'loose': false }],
    // '@babel/plugin-transform-regenerator',
    // '@babel/plugin-transform-runtime',
  ],
  env: {
    test: {
      presets: [
        [require('@babel/preset-env'), {
          useBuiltIns: 'entry',
          corejs: 3,
          modules: 'auto',
          targets: { node: 'current' }
        }],
      ],
      plugins: [
      ],
    }
  }
}

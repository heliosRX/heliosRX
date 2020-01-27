module.exports = {
  presets: [
    [require('@babel/preset-env'), { 'modules': false }],
    // [ '@vue/app', { corejs: 3, useBuiltIns: 'entry' } ]
    // '@babel/env'
  ],
  plugins: [
    // '@babel/plugin-transform-runtime',
    // '@babel/plugin-proposal-class-properties',
    // ['@babel/plugin-transform-for-of'), { assumeArray: true },
    // ['@babel/plugin-proposal-class-properties', { 'loose': false }],
    // 'transform-object-rest-spread',
  ],
  env: {
    test: {
      'presets': [
        [require('@babel/preset-env'), {
          'useBuiltIns': 'entry',
          'corejs': 3,
          'modules': 'auto',
          'targets': { 'node': 'current' }
        }],
      ],
      'plugins': [
        // '@babel/plugin-transform-regenerator',
        // '@babel/plugin-transform-runtime',
        // 'transform-es2015-modules-commonjs',
      ],
    }
  }
}

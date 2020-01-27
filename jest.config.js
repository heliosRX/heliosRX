module.exports = {
  verbose: false,
  moduleFileExtensions: [
    'js',
    // 'jsx',
    'json',
    // 'vue'
  ],
  moduleDirectories: [
    "peers/node_modules",
    "node_modules",
    "src"
  ],
  transformIgnorePatterns: [
    // "<rootDir>/node_modules/(?!flatted)"
  ],
  transform: {
    // '^.+\\.vue$': 'vue-jest',
    // '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    // '^.+\\.jsx?$': 'babel-jest',
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  snapshotSerializers: [
    // 'jest-serializer-vue'
  ],
  testMatch: [
    '<rootDir>/tests/unit/**/*.spec.(js|jsx|ts|tsx)'
  ],
  testURL: 'http://localhost/',
}

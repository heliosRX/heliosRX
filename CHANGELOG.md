# heliosRX Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added

- Added `CHANGELOG.md`
- Added CI pipeline, code coverage is now displayed in [`README.md`](./README.md)
- Documentation: Added more information how to retrieve data
- Documentation: Added more information how to write data and how to use `reorder()`

### Changed

- `validate_bolt_type` is now called `type`
- Removed all debug output and introduced a log-level system (based on `ulog`)

### Removed


## [0.2.2] - 2020-01-27

### Added

- Added unit tests (33% coverage)
- Automatic client side validation for bolt-types
- Added (boolean) `enableTypeValidation` option to `Generic Store`
- Added `$exists` getter to `Generic Model`
- Documenation: Added proposal for backend API
- Documenation: Added proposal for plugin API

### Changed

- Renamed `validate` in schema to `validator`
- Fixed a few minor issues found through unit testing

### Removed

- Deprecated test runner for firebase (now using jest)

## [0.2.1] - 2020-01-19

### Added

- CLI tool `helios`, which can initialize a project and generate bolt rules
- rollup.js build scripts that generate CJS, ESM, UMD and minified versions
- Release script to publish to npm
- Documentation: Added installation guide for development

### Changed

- `heliosRX` can now be imported as Vue plugin with `Vue.use(heliosRX, {})`
- Fixed issue where CLI does not work with linked packages (`--preserve-symlinks`)
- Fixed issue related to Vue.js being imported multiple times by declaring vue and vuex as a peer dependency

### Removed

- Removed `src/classes/utils.js` (now a factory)

## [0.2.0] - 2020-01-13

### Added

- Initial release

[Unreleased]: https://github.com/heliosrx/heliosrx/compare/v0.2.3...HEAD
[0.2.3]: https://github.com/heliosrx/heliosrx/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/heliosrx/heliosrx/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/heliosrx/heliosrx/compare/v0.2...v0.2.1
[0.2.0]: https://github.com/heliosrx/heliosrx/releases/tag/v0.2
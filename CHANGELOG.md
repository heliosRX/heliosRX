# heliosRX Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added
### Changed
### Removed

## [0.2.4] - 2020-02-08

### Added

- `GenericStore.setDefault()` - set default options for new stores
- New options `allowEmptySchema`

### Changed

- Removed all debug output and introduced a log-level system (based on `loglevel`)
- `task.remove()` now doesnt use soft_delete = true as default anymore
- Timestamp fields will now ALWAYS return a moment object even when data is invalid
  (Check for `obj.isValid()` or `moment.isValidDate(obj)`)
- `.reorder()` now also takes an Array of `GenericModel's` as input

### Removed

- Removed `$lastUpdate` from `GenericModel`
- Removed deprecated "global API"

## [0.2.3] - 2020-02-02

### Added

- Subcriptions made by Vue components are now automatically unsynced, when the component's `beforeDestroy` life-cycle hook is called
- Added (boolean) `autoUnsubscribe` option to `Generic Store`
- Added CI pipeline, code coverage is now displayed in [`README.md`](./README.md)
- Documentation: Added more information how to retrieve data
- Documentation: Added more information how to write data and how to use `reorder()`
- New method `previewPath` (GenericStore)
- New getter `schemaFields` (GenericStore)
- Added `CHANGELOG.md`

### Changed

- :boom: `$store` in static actions is now called `$model`
- :boom: `new_from_template` is now called `newFromTemplate`
- :boom: `new_from_data` is now called `newFromData`
- :boom: `schema_required_fields` is now called `schemaRequiredFields` (GenricStore)
- :boom: `schema_optional_fields` is now called `schemaOptionalFields` (GenricStore)
- :boom: `schema_all_fields` is now called `schemaAllFields` (GenricStore)
- :boom: `unsync_all` is now called `unsyncAll` (GenericStore)
- :boom: `reset_global_instance_cache` is now called `resetGlobalInstanceCache` (GenericStore)
- :boom: `$id_list` is now called `$idList` (GenericList)
- :boom: `$isValid` is now a getter (GenericModel)
- :boom: `validate_bolt_type` is now called `type` (Model Definition)

### Removed

- `sync_list` is now internal
- `fetch_list` is now internal
- `sync_individual` is now internal
- `fetch_individual` is now internal
- `queryHash` is not internal

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

[Unreleased]: https://github.com/heliosrx/heliosrx/compare/v0.2.4...HEAD
[0.2.4]: https://github.com/heliosrx/heliosrx/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/heliosrx/heliosrx/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/heliosrx/heliosrx/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/heliosrx/heliosrx/compare/v0.2...v0.2.1
[0.2.0]: https://github.com/heliosrx/heliosrx/releases/tag/v0.2

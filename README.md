<h1 align="center">heliosRX</h1>

![Discord](https://img.shields.io/discord/655646290507464743?label=discord&logo=discord)

[![npm version](https://badge.fury.io/js/heliosrx.svg)](http://badge.fury.io/js/heliosrx)

[![Build Status](https://travis-ci.org/heliosrx/heliosrx.png)](https://travis-ci.org/heliosrx/heliosrx)

[![Code Climate](https://codeclimate.com/github/heliosrx/heliosrx/badges/gpa.svg)](https://codeclimate.com/github/heliosrx/heliosrx)

[![CDNJS version](https://img.shields.io/cdnjs/v/heliosrx.svg)](https://cdnjs.com/libraries/heliosrx)

<p align="center">
  <a href="https://github.com/badges/shields/graphs/contributors" alt="Contributors">
    <img src="https://img.shields.io/github/contributors/badges/shields" />
  </a>
  <a href="#backers" alt="Backers on Open Collective">
    <img src="https://img.shields.io/opencollective/backers/shields" />
  </a>
  <a href="#sponsors" alt="Sponsors on Open Collective">
    <img src="https://img.shields.io/opencollective/sponsors/shields" />
  </a>
  <a href="https://github.com/badges/shields/pulse" alt="Activity">
    <img src="https://img.shields.io/github/commit-activity/m/badges/shields" />
  </a>
  <a href="https://circleci.com/gh/badges/shields/tree/master">
    <img src="https://img.shields.io/circleci/project/github/badges/shields/master" alt="build status" />
  </a>
  <a href="https://circleci.com/gh/badges/daily-tests">
    <img src="https://img.shields.io/circleci/project/github/badges/daily-tests?label=service%20tests" alt="service-test status">
  </a>
  <a href="https://coveralls.io/github/badges/shields">
    <img src="https://img.shields.io/coveralls/github/badges/shields" alt="coverage">
  </a>
  <a href="https://lgtm.com/projects/g/badges/shields/alerts/">
    <img src="https://img.shields.io/lgtm/alerts/g/badges/shields" alt="Total alerts"/>
  </a>
  <a href="https://github.com/badges/shields/compare/gh-pages...master">
    <img src="https://img.shields.io/github/commits-since/badges/shields/gh-pages?label=commits%20to%20be%20deployed" alt="commits to be deployed">
  </a>
  <a href="https://discord.gg/HjJCwm5">
    <img src="https://img.shields.io/discord/308323056592486420?logo=discord" alt="chat on Discord">
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=shields_io">
    <img src="https://img.shields.io/twitter/follow/shields_io?style=social&logo=twitter" alt="follow on Twitter">
  </a>
</p>

**heliosRX** is a reactive front-end ORM layer for the real-time web 🔥
- Currently supports Vue and Firebase.

 ![heliosRX](./doc/img/helios-rx.png)

- 🍭 Easy to use abstraction layer for firebase
- ⚡ Speeds up development significantly
- 🔌 Modular architecture (will support other backends in the future)
- ⏱️ Write fully reactive Realtime Apps

## Generic API

 This is the generic store, which provides a unified API to our database.

 The goal is to target different platforms with a shared codebase:

 - Babel for Web / Desktop
 - Dart / Flutter for Mobile
 - Node for admin tools and cloud functions

 The generic API includes a description of the database including:

 - Storage paths (refs)
 - Schemata
 - Input validation rules

## Demo

...

## Loading and installing heliosRX

1. CDN

2. Load with npm
```bash
npm install heliosrx
# or
yarn add heliosrx
```

```javascript
import heliosRX from 'heliosrx';
```

3. NodeJS

Please check installation instructions for it. Then just run

```bash
npm install heliosrx
```

Then in you javascript file you will need to use

```javascript
const heliosRX = require('heliosrx');
```

See file heliosrx/demo.js file in this repo as a sample.

## Quick Look

```js
TODO
```

## Backers

TODO

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Generate documentation

Run `npx gulp api` which will build the documentation files and place them in the api folder.

## Pull request

I'd be happy to review any pull requests that may better the heliosRX project, in particular if you have a bug fix, enhancement, or a new shape (see src/shapes for examples). Before doing so, please first make sure that all of the tests pass (gulp lint test).

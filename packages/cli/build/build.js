// const path = require('path')
const versionInput =  process.env.VERSION
const versionPgk = require('../package.json').version

console.log("Nothing to do.", versionInput, "->", versionPgk)

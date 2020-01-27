/* Webpack Environment Variables */
process.env.NODE_ENV = "development"
process.env.production = false;

const config = require("./env.js");
config.configureClientEnvironment();

// eslint-disable-next-line
require = require("esm")(module/*, options*/)
require('module-alias/register')
module.exports = require("./generic-store.runner.js")

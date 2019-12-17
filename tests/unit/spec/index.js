/* eslint-disable */

// INFO: Only use relative paths in here

/* Webpack Environment Variables */
process.env.NODE_ENV = "development"
process.env.production = false;

const config = require("../../../config/env.js");
config.configureClientEnvironment();

require = require("esm")(module/*, options*/)
module.exports = require("./genericStore.spec.js") // TODO: via argument  + testname

// ALTERNATIVE: node -r esm src/generic_api/spec

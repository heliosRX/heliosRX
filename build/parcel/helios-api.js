/* eslint-disable */
const path = require('path');

/* Webpack Environment Variables */
process.env.NODE_ENV = "CLI"
process.env.production = true; // HACK

const models       = require('@/models')
const api          = require('@/api')
const setDefaultDB = require('@/generic_api/config').setDefaultDB
const moment       = require('@/moment-gp');

let pjson = require('./package.json');
let pversion = pjson.version || 'unknown';

console.log(`[HeliosAPI] ready v${pversion}`)

module.exports = {
  $models            : models.default,
  $api               : api.default,
  $moment            : moment.default,
  setDefaultDB       : setDefaultDB,
  setDefaultUser     : (id) => { models.setDefaultUser( id ) },
  resetGenericStores : () => { models.resetGenericStores() },
  // GenericStore    : GenericStore,
  // setDefaultDB    : (db) => { models.GenericStore.setDefaultDB( db ) },
}

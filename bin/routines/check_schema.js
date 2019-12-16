/* This script reads all database schema files and runs the following checks:

Syntax: node db/main.js db/rules/check_schema.js [--verbose]

1.
2.
3.
*/

/* eslint-disable */
console.log("***** Validating DB Schema *****");
const chalk = require('chalk');

let all_stores = require("../../src/models").default
// import * as all_stores from '@/models/config.js'

let verbose = ( process.argv[2] === '--verbose' )

Object.keys(all_stores).forEach(storeName => {
  var store = all_stores[storeName];

  if ( !store.modelDefinition
    || !store.modelDefinition.schema
    || !store.modelDefinition.schema.fields ) {
    console.warn('['+storeName+']', chalk.yellow("No schema found to validate input")); // TODO: Chalk
    return;
  }

  store._schema_fields.forEach(field => {
    if ( field.validation_bolt_type ) {
      console.error('['+storeName+' -> '+field.model+']', chalk.red("validation_bolt_type should be validate_bolt_type"))
    }
  })

  let required = {}
  if ( store.modelDefinition.schema.create_required ) {

    store.modelDefinition.schema.create_required.forEach( prop => {
      required[ prop ] = {};
    })
  }

  switch ( storeName ) {
    case 'example':
      // required.name = 'test'
    break
  }

  try {
    let empty_data
    if ( store.isReadonly ) {
      empty_data = store.modelDefinition.schema.create( required, required, 'REALTIMEDB' )
      store._validate_schema( empty_data, false )
    } else {
      empty_data = store.empty( required )
    }
    store._validate_schema( empty_data, false )

    // TODO: Call validate on each property?

    if ( verbose ) {
      console.log('['+storeName+']', chalk.green("OK"));
    }
  } catch ( e ) {
    console.warn('['+storeName+']', chalk.red("Validation failed"));
    console.log(e);
  }
})

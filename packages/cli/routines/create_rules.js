/*
This script reads all database schema files and creates a *.bolt file,
which then will be used to create the database.rules.json

run with:
npm run main db/rules/create_rules.js
*/

import Vue from 'vue'

import fs from "fs"
import path from "path"
// import util from "util"
const chalk = require('chalk');

// TODO: Match rules path with stores !!
// TODO: Create Any fields when to validator defined?

const log1 = (...args) => { /* console.log(...args) */ }

// TODO: Generate automatically
const store_to_group_map = {
  userReadonly: 'user',
  userStatus: 'user',
  userSettings: 'user',
  userMsgInbox: 'user',
  taskComment: 'task',
  taskDetails: 'task',
  taskMeta: 'task',
}

/*
const model_alias_map = {
  challengesPublic: 'challenge',
  challengeTemplate: 'commitment', // TODO (use type)
}
*/

const DEFAULT_BOLT_FILE = `
type {NAME_PLACEHOLDER} {
  {FIELDS_PLACEHOLDER}
}
`
// path can be generated from tempalte path => path ${template_path} is ${model} {}
// TODO OR: Autocheck if path is protected by scanning this file

const DEFAULT_PATH_RULE_FILE = `
path {PATH_PLACEHOLDER} is {NAME_PLACEHOLDER}[] {}
`

function map_vfg_validator_to_bolt_type( validate ) {

  // const VALID_BOLT_BASE_TYPES = [ 'String', 'Number', 'Boolean', 'Object', 'Any', 'Null' ]
  // if ( VALID_BOLT_BASE_TYPES.includes( validate ) ) {}

  const VFG_TO_BOLT_MAP = {
    number: 'Number',
    integer: 'Number',
    double: 'Number',
    string: 'String',
    array: 'Object',
    date: 'Number',
    email: 'String',
    url: 'String',
    creditCard: 'String',
    alpha: 'String',
    alphaNumeric: 'String',
  }
  if ( typeof validate === 'function' ) {
    return 'Null // Function can not be mapped'
  }
  if ( validate in VFG_TO_BOLT_MAP  ) {
    return VFG_TO_BOLT_MAP[ validate ]
  }
  return 'Null // Unknown validate ' + validate
}

function read_types_from_stores(all_stores, generate_path_file) {
  var generatorErrors = []
  var typesContent = ''

  for (var store in all_stores) {

    /* Skip abstract stores */
    if ( all_stores[store].isAbstract /*|| abstract_store[store].modelDefinition.abstract_store*/ ) {
      continue
    }

    if ( store === '_prototype' ) {
      continue
    }

    if ( !all_stores[store] ||
         !all_stores[store].modelDefinition ||
         !all_stores[store].modelDefinition.schema ||
         !all_stores[store].modelDefinition.schema.fields ) {
      console.log(chalk.red(store + ": Schema not found!"), all_stores[store].templatePath)
      continue
    } else {
      console.log("\n")
      console.log('Processing', all_stores[store].templatePath)
    }

    let fields = all_stores[store].modelDefinition.schema.fields

    /* Support arrays and objecs */
    if ( !Array.isArray( fields ) ) {
      fields = Object.keys(fields).map(key => {
        return { model: key, ...fields[key] }
      });
    }

    let boltFields = fields.map(field => {

      if ( !field.model ) {
        console.log(chalk.red("Invalid field. Skipping."), field)
        return
      } else if ( !field.validate_bolt_type ) {
        if ( field.validator ) {
          field.validate_bolt_type = map_vfg_validator_to_bolt_type( field.validator );
        } else {
          console.log(chalk.yellow("Missing validate_bolt_type or VFG-validator"), field, chalk.yellow('using Any'))
          field.validate_bolt_type = 'Any'
        }
      }

      if ( field.model[0] === '/' ) {
        // TODO: Support regex keys OR at least regex types
        console.log(chalk.red("Regex keys are not supported. Found"), field.model)
        return
      }

      if ( field.model.includes('/') ) {
        // TODO: DEFINE SUBTYPE
        field.model = field.model.replace(/\//g, '.')
        console.log(chalk.yellow("Nested data is not supported at the moment. Found"), field.model, "Use a nested model type instead!")
        return
      }

      let defaultNull = ' | Null'
      if ( field.required ) { // Also includes every update (!)
        defaultNull = ''
      }

      return "\t" + field.model.toString()
           + ': ' + field.validate_bolt_type.toString()
           + defaultNull
    }).filter(e => e)

    // log1('- boltFields', boltFields)

    let store_sub_path = ( store_to_group_map[ store ] || '' ) + '/' + store
    let filepath_relative = '../../src/models/' + store_sub_path + '/schema.bolt'
    let filepath = path.join(__dirname, filepath_relative)

    // console.log("- filepath", filepath)

    try {
      let boltText = ''

      if ( generate_path_file ) {
        boltText = DEFAULT_PATH_RULE_FILE;
      } else {
        if ( fs.existsSync(filepath)) {
          boltText = fs.readFileSync(filepath, 'utf8')
        } else {
          console.log(chalk.yellow("Schema file does not exists, using default."), filepath)
          boltText = DEFAULT_BOLT_FILE
        }
      }

      let store_name_capitalized = store.charAt(0).toUpperCase() + store.slice(1);

      // boltText = boltText.replace(/\{PATH_PLACEHOLDER\}/g, all_stores[store]._previewPath( '{id}' ) )
      boltText = boltText.replace(/\{PATH_PLACEHOLDER\}/g, all_stores[store]._previewPath( '' ) )
      boltText = boltText.replace(/\{NAME_PLACEHOLDER\}/g, store_name_capitalized);
      boltText = boltText.replace(/(\s*)\{FIELDS_PLACEHOLDER\}/g, "\n" + boltFields.join("\n"));

      log1("------------------------------------------------------------------------")
      log1(boltText)
      log1("------------------------------------------------------------------------")

      let srcLine = '\n// SOURCE: ' + filepath_relative + "\n"
      typesContent = typesContent + srcLine + boltText + "\n"

    } catch (err) {
      console.warn("Error while reading schema.bolt:", err)
      continue
    }
  }

  if ( generatorErrors.length > 0 ) {
    console.log(generatorErrors.length + ' errors during conversion')
    generatorErrors.forEach((error, index) => {
      console.log(error)
    })
    throw new Error('Failed')
  }

  return typesContent;
}

export async function main( { filename, skipTypes, onlyTypes, genPaths }, environment, dry, verbose, printJson ) {

  // TODO !!!
  const detectProjectRoot = require("../lib/detectProjectRoot");
  let rootDir = detectProjectRoot() || process.cwd();
  let configPath = rootDir + "/src/models/config.js"; // TODO
  const requireES6 = require("esm")(module)
  let all_stores = requireES6(configPath)
  // TODO !!!

  let concat_file_list = [
    path.join(__dirname, '../rules/global/', 'global_types.bolt'),
    path.join(__dirname, '../rules/global/', 'global_functions.bolt'),
    '<TYPES>',
    path.join(rootDir, 'rules/rules.bolt'),
  ];

  if ( skipTypes ) {
    delete concat_file_list[2]
  }
  if ( onlyTypes ) {
    concat_file_list = ['<TYPES>']
  }

  let generate_path_file = genPaths

  let boltFileContent = '// THIS FILE IS AUTOGENERATED - DO NOT EDIT\n'
  concat_file_list.forEach(filename => {
    let filepath = filename; // path.join(__dirname, filename);
    let srcLine = '\n// SOURCE: ' + filename + "\n"

    if ( filename === '<TYPES>' ) {
      boltFileContent += read_types_from_stores(all_stores, generate_path_file) + '\n\n';
    } else if ( filename ) {
      boltFileContent += srcLine + fs.readFileSync(filepath, 'utf8') + '\n\n';
    }
  })

  if ( filename ) {
    let target_file = filename;
    console.log("Writing bolt definition to file:", target_file)
    fs.writeFileSync(target_file, boltFileContent)
  } else {
    //console.log(boltFileContent)
  }
}

/*let types = {}
generate_type(fieldlist, name) {
  for ( field in fieldlist ) {
    if ( field.isNested ) {
      let name = make_type_name()
      generate_type( field, name )
      types[name].push( write_type_field( name ) )
    }
    types[name].push( write_field( field ) )
  }
}*/

/*
let types = {}
generate_type(fieldlist, name) {
  for ( field in fieldlist ) {
    if ( field.isNested ) {
      let name = make_type_name()
      generate_type( field, name )
      types[name].push( write_type_field( name ) )
    }
    types[name].push( write_field( field ) )
  }
}
*/

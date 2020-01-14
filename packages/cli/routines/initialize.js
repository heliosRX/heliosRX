/*
*/

const fs = require('fs')
const path = require('path')
const chalk = require('chalk');
const ejs = require('ejs');
const helper = require('../lib/helper')
const detectProjectRoot = require("../lib/detectProjectRoot");

export async function main( {}, environment, dry, verbose, printJson ) {

  const templateData = {
    exampleIncludeCreateFunc: true,
    exampleModelAndListActionsAndGetters: true,
  };
  const ejsOptions = {}

  let projectRoot = detectProjectRoot();
  let projectFile = helper.readProjectFile();

  // TODO: Check for uncommited changes

  if ( verbose ) {
    console.log( "-----------------------------------------------------" )
    console.log( "env:         ", environment )
    console.log( "cwd:         ", process.cwd() )
    console.log( "projectFile: ", projectFile)
    console.log( "root:        ", projectRoot)
    console.log( "-----------------------------------------------------" )
  }

  if ( !environment ) {
    console.log(chalk.red('No firebase environment defined. Did you run "firebase use"?'));
    process.exit(1);
  }

  const packageJsonFilename = projectRoot + '/package.json';
  if ( fs.existsSync( packageJsonFilename ) ) {
    let jsonData = JSON.parse(fs.readFileSync( packageJsonFilename, 'utf-8' ))

    const scripts = {
      "rules": "npm run rules:make && npm run rules:deploy",
      "rules:make": "helios rules --write database.rules.bolt && firebase-bolt database.rules.bolt",
      "rules:deploy": "firebase deploy --only database"
    }

    Object.keys( scripts ).forEach( key => {
      if ( key in jsonData.scripts ) {
        console.log(chalk.yellow('Script already exists in package.json:' + key ))
      } else {
        jsonData.scripts[ key ] = scripts[ key ];
      }
    })

    fs.copyFileSync( packageJsonFilename, packageJsonFilename + '.backup' );
    console.log('- Created backup of package.json')
    fs.writeFileSync( packageJsonFilename, JSON.stringify( jsonData, null, 2 ));
    console.log('- Updated package.json')

  } else {
    console.log(chalk.red('Can not find package.json.'));
    process.exit(1);
  }

  const filenames = {
    src:           projectRoot + '/src/',
    rulesFolder:   projectRoot + '/rules/',
    rulesFile:     projectRoot + '/rules/rules.bolt',
    modelsFolder:  projectRoot + '/src/models/',
    modelConfig:   projectRoot + '/src/models/config.js',
    modelIndex:    projectRoot + '/src/models/index.js',
    exampleFolder: projectRoot + '/src/models/example/',
  };

  if ( !fs.existsSync( filenames.src ) ) {
    console.log(chalk.red('/src does not exist.'));
    process.exit(1);
  }

  Object.keys( filenames ).forEach( key => {
    if ( key === 'src' ) {
      return
    }
    let filename = filenames[ key ]
    if ( fs.existsSync( filename ) ) {
      console.log(chalk.red('Found existing file. Please delete or rename')
        + ': ' + filename.substr(projectRoot.length))
      process.exit(1);
    }
  })

  function mkdirIfNotExists( filename ) {
    if ( !fs.existsSync( filename ) ) {
      fs.mkdirSync( filename );
      if ( verbose ) {
        console.log("- Creating folder: " + filename )
      }
    }
  }

  mkdirIfNotExists( filenames.rulesFolder );
  mkdirIfNotExists( filenames.modelsFolder );
  mkdirIfNotExists( filenames.exampleFolder );

  function createFromTemplate( template, target ) {
    ejs.renderFile( __dirname + '/../template/' + template, templateData, ejsOptions, ( err, str ) => {
      // str => Rendered HTML string
      if ( verbose ) {
        console.log("- Creating file:   " + target )
      }
      fs.writeFileSync( target, str )
    });
  }

  createFromTemplate( 'project/config.js', filenames.modelConfig )
  createFromTemplate( 'project/index.js', filenames.modelIndex )
  createFromTemplate( 'project/rules.bolt', filenames.rulesFile )

  // const example = [ 'actions.js', 'getters.js', 'index.js', 'schema.js', 'schema.bolt' ]
  const example = [ 'index.js', 'schema.js' ];

  example.forEach( file => {
    createFromTemplate(
      'model-simple/' + file,
      filenames.exampleFolder + file
    );
  })

  console.log()
  console.log(chalk.green('================================='))
  console.log(chalk.green('heliosRX successfully initialized'))
  console.log(chalk.green('================================='))
  console.log()
}

import * as userFunctions from './user.js'
import * as taskFunctions from './task.js'
import * as miscFunctions from './misc.js'
import * as authFunctions from './auth.js'

let apiFunctionList = {}

if ( process.env.NODE_ENV === "CLI" ) {
  Object.assign( apiFunctionList, adminFunctions );
  // No HMR...
}

Object.assign( apiFunctionList, userFunctions );
Object.assign( apiFunctionList, taskFunctions );
Object.assign( apiFunctionList, miscFunctions );
Object.assign( apiFunctionList, authFunctions );

// TODO: Provide automatic help for API functions

if (module.hot) {
  module.hot.accept([
    './user',
    './task',
    './misc',
    './auth',
  ], (filename) => {

    // Parse "./src/api/<moduleName>.js"
    let moduleName = filename[0].split('/').reverse()[0];
    console.log("[HMR*] update api %c<" + moduleName + ">", 'color: #42b983');

    // Path must be hardcoded!
    let updatedModule;
    switch (moduleName) {
      case 'user.js': updatedModule = require('./user'); break;
      case 'task.js': updatedModule = require('./task'); break;
      case 'misc.js': updatedModule = require('./misc'); break;
      case 'auth.js': updatedModule = require('./auth'); break;
    }

    for ( let actionName in updatedModule ) {
      apiFunctionList[ actionName ] = updatedModule[ actionName ];
    }
  })
}

export default apiFunctionList;

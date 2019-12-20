import * as miscFunctions from './misc.js'
import * as authFunctions from './auth.js'

let apiFunctionList = {}

Object.assign( apiFunctionList, miscFunctions );
Object.assign( apiFunctionList, authFunctions );

export default apiFunctionList;

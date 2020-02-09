import log from 'loglevel';
import * as types from  './log-types'

log.noConflict()
log.setDefaultLevel('warn')
log.setLevel('warn')

export const PREFIX_LIST = {
  [types.INFO_COMMON]:            'heliosRX',
  [types.INFO_MODEL]:             'heliosRX',
  [types.INFO_COLLECTION]:        'heliosRX',
  [types.INFO_STORE]:             'heliosRX',
  [types.INFO_STORE_WRITE]:       'heliosRX:write',
  [types.INFO_MOMENT]:            'heliosRX:moment',
  [types.INFO_REGISTRY]:          'heliosRX:REGISTRY',
  [types.INFO_DEEPMERGE]:         'heliosRX:DEEPMERGE',
  [types.INFO_PERMISSION]:        'heliosRX:permission',
  [types.INFO_AUTO_UNSUBSCRIBE]:  'heliosRX:auto-unsubscribe',
  [types.INFO_SUBSCRIBE]:         'heliosRX:subscribe',
  [types.INFO_SUBSCRIBE_DETAILS]: 'heliosRX:subscribe',
  [types.INFO_SUBSCRIBE_QUERY]:   'heliosRX:query',
  [types.INFO_READ_INIT]:         'heliosRX:moment',
  [types.INFO_READ_REMOVE]:       'heliosRX:moment',
};

/*
USAGE:
import { warn, WARNING_MODEL_INVALID_MOMENT } from "../util/log"
warn( WARNING_MODEL_INVALID_MOMENT, ... )
*/
export function warn ( warning, ...args ) {
  return log.getLogger( warning ).warn( ...args )
}

/*
USAGE:
import { info, INFO_MODEL } from "../util/log"
info( INFO_MODEL, ... )
*/
export function info ( target, ...args ) {
  let prefix = PREFIX_LIST[ target ] || target;
  return log.getLogger( target ).info( `[${prefix}]`, ...args )
}

export function trace ( target, ...args ) {
  let prefix = PREFIX_LIST[ target ] || target;
  return log.getLogger( target ).info( `[${prefix}]`, ...args )
}

log.getLogger( types.WARNING_SYNCING_INDIVIDUAL ).setLevel('silent')

export * from './log-types';

export default log;

/*
const _log_group = (name, id, ...args) => {
  console.groupCollapsed('[GENS:READ:' + name + '] ' + ( id ? '{' + id + '}' : '*'));
  args.forEach(arg => console.log('INFO:', arg));
  console.trace();
  console.groupEnd();
}
*/

/*
const _log = (name, ...args) => {
  // Enable logging per store instance
  if ( !name.includes('commitmentDailySettings') ) {
    return
  }
  console.log("[GENS:READ:" + name + "]", ...args)
};
*/

/* let originalFactory = log.methodFactory;

log.methodFactory = function (methodName, logLevel, loggerName) {
  let rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function (message) {
    rawMethod("Newsflash: " + message);
  };
}; */

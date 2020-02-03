import GenericStore from './store/index.js'
// import { install, _registry as registry } from './install'
import { install } from './install'
import { setupNode } from './setup-node'
import registryModule from './registry/module'
import { setDefaultDB, setDefaultUser, resetGenericStores } from './helpers.js'
import { UIDMethod, DeleteMode } from './store/enums.js'
import moment from './moment/index.js'
import { getRegistry } from './external-deps'
import heliosLogger, * as loggerChannel from "./util/log"

const version = '__VERSION__';

class heliosRX {
  static install() {}

  static setup( options ) {
    setupNode(options)
    return heliosRX;
  }
}

heliosRX.install = install
heliosRX.getRegistry = getRegistry;
heliosRX.GenericStore = GenericStore;
heliosRX.version = version;

heliosLogger.channels = loggerChannel;

export default heliosRX;

export {
  version,
  getRegistry,
  registryModule,
  moment,
  GenericStore,
  UIDMethod,
  DeleteMode,
  setDefaultDB,
  setDefaultUser,
  resetGenericStores,
  heliosLogger,
}

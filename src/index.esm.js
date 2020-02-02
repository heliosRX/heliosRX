import GenericStore from './store/index.js'
// import { install, _registry as registry } from './install'
import { install } from './install'
import registryModule from './registry/module'
import { setDefaultDB, setDefaultUser, resetGenericStores } from './helpers.js'
import { UIDMethod, DeleteMode } from './store/enums.js'
import moment from './moment/index.js'
import { getRegistry } from './external-deps'

const version = '__VERSION__';

class heliosRX {
  static install() {}
}

heliosRX.install = install
heliosRX.getRegistry = getRegistry;
heliosRX.GenericStore = GenericStore;
heliosRX.version = version;

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
  resetGenericStores
}

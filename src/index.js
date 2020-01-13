import GenericStore from './store/'
import { install, _registry as registry } from './install'
import registryModule from './registry/module'
import { setDefaultDB, setDefaultUser, resetGenericStores } from './helpers'
import { UIDMethod, DeleteMode } from './store/GenericStore'
import moment from './moment'
import api from './api/'

class heliosRX {
  static install() {}
}

heliosRX.install = install
heliosRX.registry = registry;
heliosRX.api = api;
heliosRX.GenericStore = GenericStore;
// heliosRX.version = '__VERSION__';

export default heliosRX;

export {
  registry,
  registryModule,
  api,
  moment,
  GenericStore,
  UIDMethod,
  DeleteMode,
  setDefaultDB,
  setDefaultUser,
  resetGenericStores
}

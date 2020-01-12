import GenericStore from './store/';
import { install } from './install'
import registry from './registry/';
import api from './api/';

class heliosRX {
  static install() {}
}

heliosRX.install = install
heliosRX.registry = registry;
heliosRX.api = api;
heliosRX.GenericStore = GenericStore;

export default heliosRX;

export { registry, GenericStore, api }

// TODO: Do not export
// export { walkGet } from './registry/utils'
// export { walkGetSafe } from './registry/utils'

export { setDefaultDB, setDefaultUser, resetGenericStores } from './helpers'

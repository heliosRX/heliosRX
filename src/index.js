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

heliosRX.version = version
heliosRX.install = install
heliosRX.getRegistry = getRegistry;
heliosRX.registryModule = registryModule;
heliosRX.moment = moment;
heliosRX.GenericStore = GenericStore;
heliosRX.UIDMethod = UIDMethod;
heliosRX.DeleteMode = DeleteMode;
heliosRX.setDefaultDB = setDefaultDB;
heliosRX.setDefaultUser = setDefaultUser;
heliosRX.resetGenericStores = resetGenericStores;

export default heliosRX;


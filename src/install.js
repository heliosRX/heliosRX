import GenericStore from './store/index.js'
import { setup as storeSetup } from './store/GenericStore.js'
import setupExternalDeps, { _Vuex as Vuex } from './external-deps'

import registryModule from './registry/module'

// import registrySetup from './registry/setup.js'
// import api from './api/index.js'

export let _Vue; // bind on install ( --> MOVE)

export function install (Vue, options) {

  if (install.installed && _Vue === Vue) return
  install.installed = true

  console.log("[GENS] Installing Generic API plugin");

  if ( !options ) {
    throw new Error('heliosRX: Missing configuration. Did you supply config with Vue.use("heliosRx", {...})?')
  }

  if ( !options.db ) {
    throw new Error('heliosRX: Missing configuration "db".')
  }

  if ( !options.models ) {
    throw new Error('heliosRX: Missing configuration "models".')
  }

  _Vue = Vue
  setupExternalDeps({
    Vue,
    models: options.models,
    db:     options.db,
  });

  // Configure database
  let dbConfig = options.db
  // Checking dbConfig.constructor.name === 'Database' won't work in production
  // Setup generic store
  storeSetup({
    Vue,
    firebase: options.firebase || options.db.app.firebase_ // HACK: Figure out from rtdb
  })

  if ( dbConfig.app && dbConfig.app.database ) {
    GenericStore.setDefaultDB( options.db ); // TODO: Move to 'storeSetup'?
  } else if ( typeof dbConfig === 'object' ) {
    throw new Error('heliosRX: Multi-DB configuration not implemented yet.')
  } else {
    throw new Error('heliosRX: Invalid configuration for db.')
  }

  // Setup registry
  let _registry;
  if ( !options.useExistingStore ) {
    // TODO: Get vue from option or from vue instance?

    (Vue._installedPlugins || []).forEach(plugin => {
      if ( plugin.Store && plugin.mapActions ) {
         console.warn("Existing Vuex detected. Consider using 'useExistingStore'. See heliosRX documentation.");
      }
    })

    Vue.use( Vuex );
    _registry = new Vuex.Store( registryModule( 'heliosRX' ) )
    setupExternalDeps({ Vuex, registry: _registry });

    // Initialize registry
    _registry.commit('INIT_REGISTRY'); // TODO: module/INIT_REGISTRY
  } else {

    const store = options.useExistingStore;
    store.registerModule('heliosrx', registryModule( 'heliosRX' ));
    setupExternalDeps({ Vuex, registry: store });

    throw new Error('heliosRX: Custom state management not fully implemented.')
    // TODO: Fix mutations
  }

  // Define $models
  Object.defineProperty(Vue.prototype, '$models', {
    get () { return options.models }
  })

  // Merge user api with helios API
  // let mergedApi = api;
  let mergedApi = {};
  if ( options.userApi ) {
    // mergedApi = Object.assign({}, api, options.userApi);
    mergedApi = options.userApi;
  }

  // Define $api
  Object.defineProperty(Vue.prototype, '$api', {
    get () { return mergedApi }
  })

  // Expose everything to developer console
  let isDevEnvironment = process.env.VUE_APP_PRODUCTION === 'false' && process.browser;
  if ( options.devMode === true ||
       ( options.devMode === undefined && isDevEnvironment ) ) {
    window.$models = options.models;
    window.$db = options.db
    window.$api = mergedApi;
    window.$registry = _registry;
  }
}

import api from './api'
import GenericStore from './store'

export let _Vue
export let _models = {};
export let _db = {};

export function install (Vue, options) {

  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  Object.assign(_models, options.models)
  Object.assign(_db, options.db)

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

  // Configure database
  let dbConfig = options.db
  // Checking dbConfig.constructor.name === 'Database' won't work in production
  if ( dbConfig.app && dbConfig.app.database ) {
    GenericStore.setDefaultDB( options.db );
  } else if ( typeof dbConfig === 'object' ) {
    throw new Error('heliosRX: Multi-DB configuration not implemented yet.')
  } else {
    throw new Error('heliosRX: Invalid configuration for db.')
  }

  // Define $models
  Object.defineProperty(Vue.prototype, '$models', {
    get () { return options.models }
  })

  // Merge user api with helios API
  let mergedApi = api;
  if ( options.userApi ) {
    mergedApi = Object.assign({}, api, options.userApi);
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
  }

  // Initialize registry
  let registry = api.get_registry();
  registry.commit('INIT_REGISTRY');
}

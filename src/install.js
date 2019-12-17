export let _Vue

export let _models = {};

export function install (Vue, options) {

  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  Object.assign(_models, options.models)

  console.log("[GENS] Installing Generic API plugin");

  // const isDef = v => v !== undefined

  Object.defineProperty(Vue.prototype, '$db', {
    // get () { return this._loaderRoot._loader }
    get () { return this.$root.$options.db }
  })

  if ( options && options.models ) {
    Object.defineProperty(Vue.prototype, '$models', {
      get () { return options.models }
    })
  }

  if ( options && options.api ) {
    Object.defineProperty(Vue.prototype, '$api', {
      get () { return options.api }
    })
  }

  if ( process.env.VUE_APP_PRODUCTION === 'false' && process.browser ) {
    // window.$api = options.api;
    window.$models = options.models;
    window.$api = options.api;
  }

  // TODO: Vue.util.defineReactive(this, '_route', this._loader.history.current)
}

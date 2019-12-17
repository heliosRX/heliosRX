import getters from './getters'
import actions from './actions'
import schema from './schema'

// TODO: context for each getter and action
// TODO: how can getters access state in regular store
// TODO: Replace registry by vue instance?

export default {
  modelGetters: {},
  modelActions: {},
  listGetters: {},
  listActions: {},
  staticGetters: getters,
  staticActions: actions,
  schema: schema,
  // no_reactive_getters: true,
  /*hotUpdate() {
    return {
      'getters': this.modelGetters,
      'actions': this.modelActions,
      'schema':  this.schema
    }
  }*/
};

if (module.hot) {
  module.hot.accept();
}

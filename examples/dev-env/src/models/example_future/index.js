import schema from './schema'

export default {
  templatePath: '/foobar/{myid}/*',
  modelGetters: {},
  modelActions: {},
  listGetters: {},
  listActions: {},
  staticGetters: {},
  staticActions: {},
  schema: schema,
  // no_reactive_getters: true,
};

if (module.hot) {
  module.hot.accept();
}

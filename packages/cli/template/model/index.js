import getters from './getters'
import actions from './actions'
import schema from './schema'

export default {
  <% if (exampleModelAndListActionsAndGetters) { %>
  modelGetters: {},
  modelActions: {},
  listGetters: {},
  listActions: {},
  <% } %>
  staticGetters: getters,
  staticActions: actions,
  schema: schema,
};

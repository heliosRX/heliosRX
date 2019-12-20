import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  userAuth: {},
  loggedIn: undefined, // ACHTUNG: muss undefined sein
  initialized: false
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

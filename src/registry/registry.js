import { _Vue as Vue } from '../external-deps'
import genericStoreMutations from './mutations'
import { trace, INFO_REGISTRY } from "../util/log"

// import createPersistedState from 'vuex-persistedstate'
// import { ENABLE_PERSISTENT_REGISTRY } from '@/features'
// TODO: Replace vuex store with vue instance - maybe

export default {
  strict: true,
  // plugins: /* ENABLE_PERSISTENT_REGISTRY ? [ createPersistedState() ] : */ [],
  state: {
    initialized: false,
    res: {},
    sync: {},
    ready: {}
    // index: {},
  },
  getters: {
    get_registry_entry: (state) => name => {
      return state.sync[ name ];
    },
    is_ready: (state) => name => {
      return state.ready[ name ] || false;
    },
  },
  mutations: {

    ...genericStoreMutations,

    // TODO: Refactor (ready mutations)

    INIT_REGISTRY(state) {
      state.initialized = true;
    },

    RESET_REGISTRY(state) {
      trace(INFO_REGISTRY, 'RESET_REGISTRY')
      // Callend on logout
      Vue.set( state, 'sync',  {})
      Vue.set( state, 'res',   {})
      Vue.set( state, 'ready', {})
      state.initialized = false;
    },

    ADD_ENTRY(state, { name, data }) {
      trace(INFO_REGISTRY, 'ADD_ENTRY')
      if (!state.sync[name] || state.sync[name] !== data) {
        Vue.set( state.sync, name, data )
      }
    },

    SET_ENTRY_STATUS( state, { name, value } ) {
      trace(INFO_REGISTRY, 'SET_ENTRY_STATUS')
      if (!state.sync[ name ][status] || state.sync[ name ][status] !== value) {
        Vue.set(state.sync[ name ], 'status', value)
      }
    },

    SET_GLOBAL_READY_STATE( state, { name, value } ) {
      trace(INFO_REGISTRY, 'SET_GLOBAL_READY_STATE')
      if (!state.ready[name] || state.ready[name] !== !!value) {
        Vue.set(state.ready, name, !!value)
      }
    },

    REM_GLOBAL_READY_STATE( state, { name } ) {
      trace(INFO_REGISTRY, 'REM_GLOBAL_READY_STATE')
      Vue.delete(state.ready, name)
    }
  },
}

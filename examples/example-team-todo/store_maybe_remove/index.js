import Vue from "vue";
import Vuex from "vuex";

import app from "@/store/app";
import user from "@/store/user";
import { genericStoreMutations } from '@/generic_api/lib/generic_store/vuefire'
// ^ TODO

/* Enable logger for these modules */
// const vuexLoggerPlugin = createStoreLogger([
//   'app',
//   'user',
// ]);

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: false,

  plugins: [
    // vuexLoggerPlugin
    // updateVuexOnFirestoreUpdatePlugin,
    /* Disable logger in production */
  ],

  state: {
    // res: {}, // NOT USED
    // index: {}, // NOT USED
    // sync: {} // NOT USED
  },

  mutations: {
    // ...firebaseMutations,
    ...genericStoreMutations,
    // ...loggerMutations
  },

  actions: {
    clearAll({ commit }) {
      commit("app/RESET")
      commit("user/LOGOUT")
    }
  },

  modules: {
    app,
    user,
  }
});

if (module.hot) {
  // accept actions and mutations as hot modules
  module.hot.accept([
    './app',
    './user',
  ], (filename) => {

    /* Parse "./src/store/<moduleName>/index.js" */
    let moduleName = filename[0].split('/').reverse()[1];

    console.log("[HMR*] update store module %c<" + moduleName + ">", 'color: #42b983');

    /* Path must be hardcoded! */
    let updatedModule;
    switch (moduleName) {
      case 'app':       updatedModule = require('./app'); break;
      case 'user':      updatedModule = require('./user'); break;
    }
    // console.log("updatedModule", updatedModule);

    store.hotUpdate({
      modules: {
        [moduleName]: {
          namespaced: true,
          mutations:  updatedModule.default.mutations,
          actions:    updatedModule.default.actions,
          getters:    updatedModule.default.getters
        }
      }
    })
  })
}

window.VuexStore = store;
export default store;

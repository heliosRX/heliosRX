import Vue from 'vue'
import App from './App.vue'

import heliosRX from 'heliosrx'
import GenericStore from 'heliosrx/src/store'

import { rtdb } from './firebase'
import db from "heliosrx/src/global_api"; // TODO
import api from 'heliosrx/src/api'
import models from "@/models" // TODO
// import api from '@/api' // TODO

// console.log("heliosRX", heliosRX)

// TODO: Integrate in generic store?
export const ALLOWED_GLOBAL_READY_FLAGS = [
  'auth',
  'user',
  'tasklists',
  'tasklists:*',
  'tasks',
];

Vue.use(heliosRX, {
  models: models,
  api: api,
  readyFlags: ALLOWED_GLOBAL_READY_FLAGS,
  // TODO: passs rtdb here
})

GenericStore.setDefaultDB( rtdb );

// import { get_registry } from 'heliosrx/api/misc'
api.get_registry().commit('INIT_REGISTRY');

// TODO: MOVE
if ( process.env.VUE_APP_PRODUCTION === 'false' ) {
  window.$db = db;
  // window.$registry = registry;
}

Vue.config.productionTip = false

new Vue({
  db: db,
  render: h => h(App),
}).$mount('#app')

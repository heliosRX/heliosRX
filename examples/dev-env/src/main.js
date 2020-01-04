import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui';

import heliosRX from 'heliosrx'
import GenericStore from 'heliosrx/src/store'
import App from './App.vue'

import { rtdb } from './firebase'
import db from "heliosrx/src/global_api"; // TODO
import api from 'heliosrx/src/api'
import models from "@/models" // TODO

import router from '@/router'

import 'element-ui/lib/theme-chalk/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.use(ElementUI);
Vue.use(heliosRX, {
  models: models,
  api: api,
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
  router: router,
  render: h => h(App),
}).$mount('#app')


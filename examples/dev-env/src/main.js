import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui';

import heliosRX from 'heliosrx'
import App from './App.vue'

import { rtdb } from './firebase'
import models from "@/models" // TODO

import router from '@/router'

import 'element-ui/lib/theme-chalk/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.use(ElementUI);
Vue.use(heliosRX, {
  devMode: true,
  models: models,
  userApi: {},
  db: rtdb,
})

Vue.config.productionTip = false

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app')


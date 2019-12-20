import Vue from "vue"
import App from "./App"
import moment from 'heliosrx/src/moment.js'
import db from "@/generic_api/config";

/* -------------------- Global CSS imports ---------------------------------- */
import './styles/element-ui/elements-ui-mods.css';
import './styles/helios/helios.scss';

/* ------------------------ Import Resource Loader -------------------------- */
let loader = require("@/resource-loader.js").default;
loader.beforeAppStartsLoading();

let router = require("@/router").default;
require("@/generic_api/firebase/auth.js");
loader.connectRouter( router )

/* ---------------------------- Vue Config ---------------------------------- */

/* mount vue */
let rootInstance = new Vue({
  db: db,
  store: store,
  el: "#app",
  render: h => h(App)
}).$mount('#app');

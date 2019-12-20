import Vue from 'vue'
import VueLoader from "@/generic_api/lib"
import models from "@/models"
import GenericStore from './lib/generic_store/GenericStore'
import rtdb1 from './firebase/rtdb'
import db from "@/global_api"
import registry from "@/generic_api/lib/generic_store/loader/registry"
import api from '@/api'

GenericStore.setDefaultDB( rtdb1 );
// GenericStore.registerDB( 'NAME1', db1 )
// GenericStore.registerDB( 'NAME2', db2 )

Vue.use(VueLoader, { models: models, api: api });

if ( process.env.VUE_APP_PRODUCTION === 'false' ) {
  window.$db = db;
  window.$registry = registry;
}

// TODO: Integrate in generic store?
export const ALLOWED_GLOBAL_READY_FLAGS = [
  'auth',
  'user',
  'tasklists',
  'tasklists:*',
  'tasks',
];

export const setDefaultDB = GenericStore.setDefaultDB;
export default db

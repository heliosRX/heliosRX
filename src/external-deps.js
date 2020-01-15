// TODO: Make sure it's the same 'Vue'
// Has to be imported as external dependency!

// These are replaced by "{}" for commonJS (see rollup config) !!
import Vue from 'vue';
import Vuex from 'vuex';

// bind on install
export let _Vue = Vue;
export let _Vuex = Vuex;
export let _Firebase;
export let _registry;
export let _models = {};
export let _db = {};

export default function setup( options ) {
  if ( options.Vue ) _Vue = options.Vue;
  if ( options.Vuex ) _Vuex = options.Vuex;
  if ( options.Firebase ) _Firebase = options.Firebase;
  if ( options.registry ) _registry = options.registry;
  if ( options.models ) _models = options.models;
  if ( options.db ) _db = options.db;
}

export function getRegistry() {
  return _registry;
}

import Vue from 'vue';
import {
  VUEXFIRE_INIT_VALUE,
  VUEXFIRE_UNSET_VALUE,
  VUEXFIRE_ARRAY_ADD,
  VUEXFIRE_ARRAY_REMOVE,
  VUEXFIRE_ARRAY_SET,
  VUEXFIRE_SET,
} from './types'

import { walkSetAndMerge, deepMergeVue } from './utils'

const log = (...args) => { /* console.log('[REGISTRY]', ...args) */ };

export default {

  [VUEXFIRE_INIT_VALUE] (state, { path, data }) {
    log('[VUEXFIRE_INIT_VALUE]', { path, data });
    // TODO: will this delete children?

    return walkSetAndMerge( state, path, data )
  },

  [VUEXFIRE_UNSET_VALUE] (state, { path }) {
    log('[VUEXFIRE_UNSET_VALUE]', { path });

    return walkSetAndMerge( state, path, { '.value': null } )
  },

  [VUEXFIRE_ARRAY_ADD] (state, { target, newId, data }) {
    log('[VUEXFIRE_ARRAY_ADD]', { target, newId, data });
    Vue.set( target, newId, data )
  },

  [VUEXFIRE_ARRAY_REMOVE] (state, { target, oldId }) {
    log('[VUEXFIRE_ARRAY_REMOVE]', { target, oldId });
    Vue.delete( target, oldId )
  },

  [VUEXFIRE_ARRAY_SET] (state, { target, currentId, data, performMerge = false }) {
    if (target[ currentId ]) {
      deepMergeVue( target[ currentId ], data, !performMerge )
    } else {
      target[ currentId ] = data
    }
  },

  [VUEXFIRE_SET] (state, { target, data, performMerge = false }) {
    log('[VUEXFIRE_SET]', { target, data });
    deepMergeVue( target, data, !performMerge )
  },
}

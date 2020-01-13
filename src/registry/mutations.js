import { _Vue as Vue } from '../external-deps'

import {
  HELIOSRX_INIT_VALUE,
  HELIOSRX_UNSET_VALUE,
  HELIOSRX_ARRAY_ADD,
  HELIOSRX_ARRAY_REMOVE,
  HELIOSRX_ARRAY_SET,
  HELIOSRX_SET,
} from './types'

import { walkSetAndMerge, deepMergeVue } from './utils'

const log = (...args) => { /* console.log('[REGISTRY]', ...args) */ };
// const log = (...args) => { console.log('[REGISTRY]', ...args) };

export default {

  [HELIOSRX_INIT_VALUE] (state, { path, data }) {
    log('[HELIOSRX_INIT_VALUE]', { path, data });
    // TODO: will this delete children?

    return walkSetAndMerge( state, path, data )
  },

  [HELIOSRX_UNSET_VALUE] (state, { path }) {
    log('[HELIOSRX_UNSET_VALUE]', { path });

    return walkSetAndMerge( state, path, { '.value': null } )
  },

  [HELIOSRX_ARRAY_ADD] (state, { target, newId, data }) {
    log('[HELIOSRX_ARRAY_ADD]', { target, newId, data });
    Vue.set( target, newId, data )
  },

  [HELIOSRX_ARRAY_REMOVE] (state, { target, oldId }) {
    log('[HELIOSRX_ARRAY_REMOVE]', { target, oldId });
    Vue.delete( target, oldId )
  },

  [HELIOSRX_ARRAY_SET] (state, { target, currentId, data, performMerge = false }) {
    if (target[ currentId ]) {
      deepMergeVue( target[ currentId ], data, !performMerge )
    } else {
      target[ currentId ] = data
    }
  },

  [HELIOSRX_SET] (state, { target, data, performMerge = false }) {
    log('[HELIOSRX_SET]', { target, data, performMerge });
    deepMergeVue( target, data, !performMerge )
  },
}

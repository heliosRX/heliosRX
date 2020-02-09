import { _Vue as Vue } from '../external-deps'
import { trace, INFO_REGISTRY } from "../util/log"

import {
  HELIOSRX_INIT_VALUE,
  HELIOSRX_UNSET_VALUE,
  HELIOSRX_ARRAY_ADD,
  HELIOSRX_ARRAY_REMOVE,
  HELIOSRX_ARRAY_SET,
  HELIOSRX_SET,
} from './types'

import { walkSetAndMerge, deepMergeVue } from './utils'

export default {

  [HELIOSRX_INIT_VALUE] (state, { path, data }) {
    trace(INFO_REGISTRY, '[HELIOSRX_INIT_VALUE]', { path, data });
    // TODO: will this delete children?

    return walkSetAndMerge( state, path, data )
  },

  [HELIOSRX_UNSET_VALUE] (state, { path }) {
    trace(INFO_REGISTRY, '[HELIOSRX_UNSET_VALUE]', { path });

    return walkSetAndMerge( state, path, { '.value': null } )
  },

  [HELIOSRX_ARRAY_ADD] (state, { target, newId, data }) {
    trace(INFO_REGISTRY, '[HELIOSRX_ARRAY_ADD]', { target, newId, data });
    Vue.set( target, newId, data )
  },

  [HELIOSRX_ARRAY_REMOVE] (state, { target, oldId }) {
    trace(INFO_REGISTRY, '[HELIOSRX_ARRAY_REMOVE]', { target, oldId });
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
    trace(INFO_REGISTRY, '[HELIOSRX_SET]', { target, data, performMerge });
    deepMergeVue( target, data, !performMerge )
  },
}

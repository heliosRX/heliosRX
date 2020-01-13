// TODO: MOVE TO OWN LIB

import moment from '../moment'
import { _registry as $registry } from "../install"
// import { ALLOWED_GLOBAL_READY_FLAGS } from '../config'

/* =========================== Helper functions ============================= */

// TODO: Move to helios/lib

const ALLOWED_GLOBAL_READY_FLAGS = [];

// ALLOWED_GLOBAL_READY_FLAGS < TODO

// -----------------------------------------------------------------------------
export function set_ready( name, ready = true) {

  if ( ALLOWED_GLOBAL_READY_FLAGS.includes( name ) ) {

    $registry.commit('SET_GLOBAL_READY_STATE', {
      name: name,
      value: ready
    })

  } else {
    throw new Error('set_ready: name not allowed ' + name)
  }
}

// -----------------------------------------------------------------------------
export function rem_ready( name ) {
  $registry.commit('REM_GLOBAL_READY_STATE', { name: name })
}

// -----------------------------------------------------------------------------
export function mapReady( ...args ) {
  let map = {}
  args.forEach(name => {
    map['$ready_' + name] = function mappedGetter () {
      return $registry.getters.is_ready( name )
    }
  })
  return map
}

// -----------------------------------------------------------------------------
export function get_ready(name, id = null) {
  if ( id ) {
    name = name + ':' + id
  }
  return $registry.getters.is_ready(name);
}

// -----------------------------------------------------------------------------
export function get_ready_count(name) {
  return Object.keys($registry.state.ready).filter(entry => {
    return entry.startsWith( name + ':' )
  }).length
}

// -----------------------------------------------------------------------------
export function get_registry() {
  return $registry;
}

// -----------------------------------------------------------------------------
export function get_registry_state() {
  return $registry.state;
}

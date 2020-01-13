import { _Vue as Vue } from '../external-deps'

// -----------------------------------------------------------------------------
export function add_custom_getters( context, target, getters ) {

  if ( target.getters ) {
    console.warn(`Name conflict: property getters already exists`);
  } else {
    target.getters = {}
  }

  const computed = {}
  for ( let key in getters ) {

    let fn = getters[key]
    // computed[ key ] = () => fn( context )
    // computed[ key ] = () => fn( ...context )
    // computed[ key ] = () => fn.apply(target, Object.values(context))
    computed[ key ] = () => fn.apply(target, context) // TODO: Test if works with reactivty

    /*
    if ( Object.prototype.hasOwnProperty.call( target, key ) ) {
      let name = context.store.name;
      console.warn(`Name conflict: property "${key}" has same name as an existing class property "${key}" in ${name}`);
      continue
    }
    */

    // TODO: Assign to target.getters ?

    // Object.defineProperty( target.getters.prototype, key, {
    Object.defineProperty( target.getters, key, {
      get: () => _vm[key],
      // get: function() { return _vm[key].apply( target ) }, // Does not work
      // enumerable: false
      enumerable: true // schon ok
    })
  }

  const _vm = new Vue({
    computed
  })

  return _vm;
}

// -----------------------------------------------------------------------------
export function add_custom_actions( context, target, actions, reset ) {
  for ( let key in actions ) {
    let action = actions[ key ];
    if ( reset ) {
      delete target[ key ]
    }
    if ( Object.prototype.hasOwnProperty.call( target, key ) ) {
      let name = context.$store.name;
      console.warn(`Name conflict: action "${key}" has same name as another property "${key}" in ${name}`);
      continue
    }
    // Object.defineProperty( target, key, { value: () => action(context) } )
    Object.defineProperty( target, key, {
      value: (...args) => action.apply(target, [context, ...args] ),
      enumerable: true // otherwise not cloned
    })
  }
}

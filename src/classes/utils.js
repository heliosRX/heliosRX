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
    computed[ key ] = () => fn.apply(target, context)

    /*
    if ( Object.prototype.hasOwnProperty.call( target, key ) ) {
      let name = context.$model.name;
      console.warn(`Name conflict: property "${key}" has same name as an existing class property "${key}" in ${name}`);
      continue
    }
    */

    Object.defineProperty( target.getters, key, {
      get: () => _vm[key],
      enumerable: true
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
      let name = context.$model.name;
      console.warn(`Name conflict: action "${key}" has same name as another method or property "${key}" in ${name}`);
      continue
    }
    Object.defineProperty( target, key, {
      value: (...args) => {
        // Assign $models at run time
        if ( context.$modelsGetter ) {
          context.$models = context.$modelsGetter();
        }
        return action.apply(target, [context, ...args] );
      },
      enumerable: true // otherwise not cloned
    })
  }
}

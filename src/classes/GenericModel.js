import { _Vue as Vue } from '../external-deps'
import clonedeep from 'lodash.clonedeep'
// import { _models } from '../external-deps'
import { add_custom_getters } from '../classes/utils'
import moment from '../moment'
import { walkGetPropSave, walkGetObjectSave, walkSetVueProp } from '../registry/utils'

const externalVMStore = new WeakMap(); // Exclude vm from instance, so it can be serialized
const externalModelStore = new WeakMap(); // Stores generic store references

const SERVER_TIMESTAMP_ALIASES = [
  'ServerTimestamp',
  'CurrentTimestamp',
  'InitialTimestamp'
]

export default class GenericModel {

  // ---------------------------------------------------------------------------
  constructor( schema, data, name ) {

    // TODO: Hide internal data from user
    this.$ready       = false;
    /* This promise will resolve once the data is ready */
    this.$promise     = Promise.resolve();
    this.$state       = {};
    this.$dirty       = {};
    this.$invalid     = {};
    this.$id          = null;
    this.$idx         = null;
    this.$noaccess    = null;
    this._store_name  = name;

    Vue.observable( this.$state ); // TODO: Check if we get an error here
    // Vue.observable( this.$ready );
    // this.$state = Vue.oberservable({});
  }

  // ---------------------------------------------------------------------------
  _update_data( data, schema, make_dirty = false ) {
    this.$state = data; // otherwise no reactivity

    if ( make_dirty ) {
      for ( var key in data ) {
        this.$dirty[ key ] = true;
      }
    }

    /*schema.forEach(field => {
      let propName = field.model;
      if ( propName in data ) {
        this.$state[ propName ] = data[ propName ];
      }
    })*/
  }

  // ---------------------------------------------------------------------------
  clone() {
    const copy = Object.assign( Object.create( Object.getPrototypeOf(this)), this);
    copy.$state = clonedeep( copy.$state );
    copy.$dirty = clonedeep( copy.$dirty );
    copy.$invalid = clonedeep( copy.$invalid );
    copy._autogenerate_props( this.$model.modelDefinition.schema.fields, copy.$state, false )
    copy._set_generic_store( this.$model )
    externalVMStore.set( copy, this.$vm );
    return copy;
  }

  // ---------------------------------------------------------------------------
  /* _write_field(key, value) {
    // TODO: We should not alter the state here!!!
    // Create a copy!
    this.$state[ key ] = value;
    this.$dirty[ key ] = true;
  } */

  setValidationBehaviour( value ) {
    // TODO: Use enum
    if ( ['ERROR', 'WARNING', 'ELEMENT_VALIDATION', 'NONE'].includes( value ) ) {
      this._validation_behaviour = value
    }
  }

  _update_field( propName, value, field ) {
    let validation_behaviour = this._validation_behaviour || 'WARNING';

    const prop_set = field.is_nested
                   ? () => walkSetVueProp( this.$state, propName, value )
                   : () => Vue.set( this.$state, propName, value );

    if ( moment.isMoment( value ) ) {
      /* Handle moment object as input */
      if ( !moment.isValidDate( value ) ) {
        console.warn("Got invalid e-moment object", value, "for prop", propName);
      }
      value = value.toRealtimeDB() /* convert to internal timestamp */
      delete this.$invalid[ propName ];
      this.$dirty[ propName ] = true;
      prop_set()
      return
    }

    if ( !field.validator ) {
      /* No validate callback found */

      /* Fixes bug where non existing fields are assigned */
      // Vue.set( this.$state, propName, value );
      prop_set()
      // this.$state[ propName ] = value;

      this.$dirty[ propName ] = true;
      return
    }

    // TODO: bolt type validation

    if ( field.validator( value ) ) {
      // this._write_field( propName, value );
      // this.$state[ propName ] = value;
      delete this.$invalid[ propName ];
      this.$dirty[ propName ] = true;
      prop_set()
    } else {
      // this._write_field( propName, value );
      // this.$state[ propName ] = value;
      this.$invalid[ propName ] = true;
      this.$dirty[ propName ] = true;
      prop_set()

      if ( validation_behaviour === 'ERROR' ) {
        throw new Error(`Validation failed for field '${propName}' with value ${value}.`);
      }
      if ( validation_behaviour === 'WARNING' ) {
        console.warn(`Validation failed for field '${propName}' with value ${value}.`);
      }
      if ( validation_behaviour === 'ELEMENT_VALIDATION' ) {
        // Validation failed, but that's ok - element ui will take care
      }
    }
  }

  // ---------------------------------------------------------------------------
  _on_remove() {
    this.$deleted = true; // TODO
    // This is called when the item is going to be removed
    //  - maybe allow subscribers and call them here
  }

  // ---------------------------------------------------------------------------
  $isValid() {
    return Object.keys( this.$invalid ).length === 0;
  }

  // ---------------------------------------------------------------------------
  get $key() {
    return 'KEY-' + this._store_name + '-' + this.$id;
  }

  // ---------------------------------------------------------------------------
  get $vm() {
    return externalVMStore.get( this )
  }

  // ---------------------------------------------------------------------------
  get $model() {
    return externalModelStore.get( this )
  }

  // ---------------------------------------------------------------------------
  get $exists() {
    return this.$state[ '.exists' ] !== false;
  }

  // ---------------------------------------------------------------------------
  _autogenerate_props( schema, data, is_dirty = false ) { // TODO: move to util

    if ( !Array.isArray( schema ) ) {
      schema = Object.keys(schema).map(key => {
        return { model: key, ...schema[key] }
      });
    }

    schema.forEach(field => {
      let propName = field.model;
      // console.log("[_autogenerate_props]", field, propName, data)

      if ( data && propName in data ) {
        this.$state[ propName ] = data[ propName ];
      }
      /* else {
        this.$state[ propName ] = field.placeholder;
      } */

      if ( is_dirty ) {
        this.$dirty[ propName ] = true;
      }

      if ( Object.prototype.hasOwnProperty.call(this, propName ) ) {
        console.warn(`Name conflict: property "${propName}" has same name as global action/global getter "${propName}" in ${this._store_name}`);
        return
      }

      let prop_getter = () => {};
      let prop_path = '';

      if ( propName.includes('/') || propName.includes('.') ) {
        prop_path = propName.replace(/\//g, '.')
        let prop_keys = prop_path.split('.')
        let prop_last_key = prop_keys.pop()
        prop_keys = prop_keys.join('.')

        prop_getter = () => {
          // return walkGetPropSave( this.$state, prop_path )
          let parent = walkGetObjectSave( this.$state, prop_keys )
          return parent[ prop_last_key ]
        }
        field.is_nested = true
      } else {
        prop_path = propName
        prop_getter = () => {
          return this.$state[ propName ];
        }
        field.is_nested = false
      }

      if ( field.type ) {

        const validate_timestamp = (value, moment_conversion_func, min_date, max_date) => {
          if ( value === 0 || value === null ) {
            return value // TODO: Allow null instead of 0
          } else if ( moment.isMoment( value ) ) {
            console.error("Do not assign moment objects directly.");
          } else if ( isFinite( value ) && value > min_date && value < max_date ) {
            return moment_conversion_func( value );
          } else if ( value === undefined ) {
            return moment_conversion_func(); // TODO: This is potentially dangerous, since it returns the current time
          } else {
            console.warn("Schema defined", propName, "as Timestamp, but got invalid data:", value);
            return value
          }
        }

        let prop_getter_original = prop_getter;

        if ( field.type === 'Timestamp' ) {

          prop_getter = () => {
            const min_date =   200000000 // '1976-05-03'
            const max_date = 30000000000 // '2065-01-24'
            return validate_timestamp(
              prop_getter_original(),
              moment.fromRealtimeDB,
              min_date,
              max_date)
          }
        } else if ( SERVER_TIMESTAMP_ALIASES.includes( field.type ) ) {
          prop_getter = () => {
            const min_date =   200000000 * 1000 // '1976-05-03'
            const max_date = 30000000000 * 1000 // '2065-01-24'
            return validate_timestamp(
              prop_getter_original(),
              moment.fromRealtimeServerTime,
              min_date,
              max_date)
          }
        } else if ( field.type.includes( 'Timestamp' ) ) {
          console.warn(
            "Found validation type that contains 'Timestamp' but is not recognized:",
            field.type
          );
        }

        // TODO: Also validate other types
      }

      Object.defineProperty(this, prop_path, {
        set: value => this._update_field( prop_path, value, field ),
        get: prop_getter
      });
    });
  }

  // ---------------------------------------------------------------------------
  _decorate_actions( modelActions, context ) { // TODO: move to util
    if ( !modelActions ) {
      return
    }
    context.model = this; // HACK
    for ( let key in modelActions ) {
      let action = modelActions[ key ];
      if ( Object.prototype.hasOwnProperty.call( this, key ) ) {
        console.warn(`Name conflict: action "${key}" has same name as property/global action/global getter "${key}" in ${this._store_name}`);
        continue
      }
      Object.defineProperty( this, key, { value: () => action(context) } ) // TODO: bind this?
    }
  }

  // ---------------------------------------------------------------------------
  _decorate_getters( modelGetters, context ) { // TODO: move to util
    if ( !modelGetters ) {
      return
    }

    for ( let key in modelGetters ) {
      if ( Object.prototype.hasOwnProperty.call( this, key ) ) {
        console.warn(`Name conflict: getter "${key}" has same name as property/custom action/global action/global getter "${key}" in ${this._store_name}`);
        delete modelGetters[ key ] // ?
        continue
      }
    }

    /* Embed getter in vue instance */
    context.model = this; // HACK
    let vm = add_custom_getters( context, this, modelGetters );
    externalVMStore.set( this, vm );
  }

  // ---------------------------------------------------------------------------
  _set_generic_store( store ) {
    externalModelStore.set( this, store );
  }

  // ---------------------------------------------------------------------------
  write() {
    // TODO: Nested data

    console.log("Writing $dirty fields", JSON.stringify(this.$dirty));

    let payload = {}
    for ( let prop in this.$dirty ) {
      let value
      let prop_path
      if ( prop.includes('.') ) {
        prop_path = prop.replace(/\./g, '/')
        value = walkGetPropSave( this.$state, prop );
      } else {
        prop_path = prop
        value = this.$state[ prop ];
      }
      if ( typeof value === 'undefined' ) {
        console.warn("Trying to write undefined for prop", prop);
        continue
      }
      payload[ prop_path ] = value;
    }

    let model = this.$model;
    if ( !model ) {
      throw new Error('Model reference not set with _set_generic_store');
    }

    let is_update = true;
    let temp_id = this.$id;
    if ( !temp_id ) {
      temp_id = model._get_uid();
      is_update = false;
    }

    /* Check if all required fields are present */
    if ( model.modelDefinition && model.modelDefinition.schema ) {
      model._validate_schema( payload, is_update ) // DOPPELT ?
    } else {
      console.warn("No schema found to validate input", );
    }

    return model.update( temp_id, payload ).then(() => {
      this.$id = temp_id;
      this.$dirty = {}
      return temp_id;
    });

    /* 'store.add' would call 'create' - not what we want here */
    // TODO: Alternative { directWrite: true }
  }

  /* ------------------------------------------------------------------------ */
  _get_model_for_write() {
    if ( !this.$id ) {
      throw new Error('Write operations are not allowed for new models.');
    }

    let model = this.$model;
    if ( !model ) {
      throw new Error('Model reference not set with _set_generic_store');
    }
    return model
  }

  /* ------------------------------------------------------------------------ */
  update( payload ) {
    let model = this._get_model_for_write();
    return model.update( this.$id, payload ).then(() => {
      for ( var propName in payload ) {
        delete this.$dirty[ propName ]
      }
      return this.$id;
    });
  }

  /* ------------------------------------------------------------------------ */
  remove(soft_delete = true) {
    let model = this._get_model_for_write();
    return model.remove( this.$id, soft_delete ).then(() => {
      if ( soft_delete ) {
        delete this.$dirty[ 'deleted' ] // ?
      }
      // TODO Mark model as deleted?
    })
  }

  /* ------------------------------------------------------------------------ */
  restore() {
    let model = this._get_model_for_write();
    return model.restore( this.$id ).then(() => {
      delete this.$dirty[ 'deleted' ] // ?
    })
  }

  // ---------------------------------------------------------------------------
  // hotUpdate() {}

  // -----------------------------------------------------------------------------
  reset() {
    // console.log("[GENS] Reset Model -> NOT IMPLEMENTED")
    // ....
  }

  // ===========================================================================
  /*
  customActionExample() {
    console.log("custom action 1");
  }
  */
}

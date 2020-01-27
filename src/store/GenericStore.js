/*******************************************************************************

// TODO: Everything should return a promise

*******************************************************************************/

// import { _Vue as Vue } from '../external-deps'
import {
  isString,
  isNumeric,
  isBoolean,
  isValue,
  isObject,
  isArray,
  isValidId,
  isFunction } from '../util/types.js'
import moment from '../moment/moment-enhanced.js'
import { UIDMethod, DeleteMode } from './enums'

import { parseTpl, analyzeTpl } from '../util/template.js'
import { rtdbBindAsArray,
         rtdbBindAsObject,
         rtdbFetchAsArray,
         rtdbFetchAsObject } from '../backends/firebase-rtdb/rtdb'

import factory from '../classes/factory'
import GenericModel from '../classes/GenericModel'
import GenericList from '../classes/GenericList'

import ReadMixin from './ReadMixin'
import WriteMixin from './WriteMixin'

const slugid = require('slugid');

const log = (...args) => { console.log(...args) };
const log2 = (...args) => {};

const subscriptions = new WeakMap()

let defaultDB = null;
let _Vue;
let _firebase = null; // TODO: Getter with not init warn

// let _userId = null; // This is not stateless !!! also this is NOT reactive !!!
// let genericStoreGlobalState = _Vue.observable({ userId: null })
let genericStoreGlobalState = { userId: null }

export function setup({ Vue, firebase }) {
  _Vue = Vue;

  genericStoreGlobalState = _Vue.observable(genericStoreGlobalState)
  /* In Vue 2.x, _Vue.observable directly mutates the object passed to it, so that it
  is equivalent to the object returned, as demonstrated here. In Vue 3.x, a reactive
  proxy will be returned instead, leaving the original object non-reactive if mutated
  directly. Therefore, for future compatibility, we recommend always working with the
  object returned by _Vue.observable, rather than the object originally passed to it. */

  factory.configure({ GenericModel, GenericList });

  _firebase = firebase;
}

const USE_READ_MIXIN = true;
const USE_WRITE_MIXIN = true;

/**
 * Sync-Implementation is bashed on:
 * https://github.com/vuejs/vuefire/blob/master/packages/vuexfire/src/index.js
 *
 */
export default class GenericStore {

  /**
   * Creates generic store.
   * @param {string} templatePath - Path where the ressouce is stored.
   * @param {TypeDefinition} modelDefinition - Type definition.
   * @param {object} options - options.
   * @param {string} options.uidMethod - One of 'SLUGID' (default), 'PUSHID', 'TIMESTAMP', custom callback.
   * @param {string} options.defaultDeleteMode - One of deleteMode.SOFT (default) or deleteMode.HARD
   *
   * @example <caption>Create store with different UID method.</caption>
   * new GenericStore( "/path/to/{otherId}/data/*",
   *  myTypeDef,
   *  { uidMethod: uidMethods.SLUGID })
   *
   *
   * @example <caption>Examples:</caption>
   *
   * Normal list:
   * challenge = new GenericStore('[DB1]:/challenge/*', ChallengeTypeDefinition, { custom_key: timestamp });
   *
   * Segmented list:
   * task_session_list = new GenericStore('/goal/{goalId}/user_list/{uid}/task_session_list/{taskId}/*', TaskSessionTypeDefinition)
   *
   * let task_session_list_defined = task_session_list.define({
   *   goalId: 'KrZPg8N6THOisFz_T992Zg',
   *   uid: 'l1X8FPc7YtbftlC31frciInV3PU2'
   * })
   *
   * Updating data:
   *
   * challenge.add({ title: 'Name' })
   * challenge.add(overwrite_data)
   *
   * challenge.update(id, { key: value })
   * challenge.update(id, [{ key1: value1 }, { key2: value2 }, ...]) // --> QUATSCh!!
   * challenge.reorder(...)
   * challenge.remove(id)
   * challenge.remove(id, true) // Soft delete
   *
   * Retrieving data:
   *
   * challenge.sync_list( target )
   * challenge.unsync()
   * challenge.once( target )
   *
   * let syncId1 = task_session_list.sync_add(target, { taskId: '123' })
   * let syncId2 = task_session_list.sync_add(target, { taskId: '234' })
   *
   * task_session_list.sync_rem(syncId1)
   *
   * Suffixed paths
   * goal_meta = new GenericStore('/goal/*_/meta', GoalMetaTypeDefinition)
   * goal_meta.add() // -> creates a new goal at /goal/<newId>/meta
   *
   * goal_deadline_list = new GenericStore('/goal/{goalId}/meta/deadlines/*', GoalMetaTypeDefinition)
   * goal_deadline_list.define({ goalId: 'KrZPg8N6THOisFz_T992Zg' })
   * goal_deadline_list.add({ title: 'My deadline' })
   */
  constructor( templatePath, modelDefinition, options = {} ) {

    // TODO: Parse templatePath for "[DBName]:", set LOCAL_PATH_PREFIX

    if ( modelDefinition && ( modelDefinition.abstract_store || options.isAbstract ) ) {
      this.isAbstract = true;

      this.templatePath = templatePath;
      this.modelDefinition = modelDefinition;
      this.definedProps = {};
      this.name = 'unnamed abstract';
    } else {
      this.isAbstract = false;
      this.name = 'unnamed';

      if ( !templatePath || templatePath.length < 2 ) {
        throw new Error('Invalid template path:' + templatePath )
      }

      if ( templatePath[0] !== '/' ) {
        throw new Error('Template path has to start with /, got: ' + templatePath )
      }

      if ( (templatePath.match(/\*/g) || []).length !== 1 ) {
        throw new Error('Template path must contain exactly one *, got:' + templatePath )
      }

      /*
      let strIsInvalid = !str.match(/^(\/[a-zA-Z_0-9-_$]+)+$/);
      if ( strIsInvalid ) {
        throw new Error('Invalid template string ' + this.PREFIX +
                        ' with options ' + JSON.stringify(options))
      }
      */

      this.isSuffixed = ( templatePath.indexOf('*') !== templatePath.length - 1 );
        // this.isSuffixed = this.path.substr(-1) !== '*';

      if ( isFunction( options.uidMethod ) ) {
        this.uidMethod = UIDMethod.CUSTOM;
        this.uidMethodCallback = options.uidMethod;
      } else {
        this.uidMethod = options.uidMethod || UIDMethod.PUSHID;
      }
      this.additionalProps = options.additionalProps || [];

      this.defaultDeleteMode = options.defaultDeleteMode || DeleteMode.HARD;
    }

    this.enableTypeValidation = 'enableTypeValidation' in options
      ? options.enableTypeValidation
      : true;

    this.isReadonly = options.isReadonly;
    this.templatePath = templatePath;
    this.modelDefinition = modelDefinition;
    // this.path = templatePath;
    this.definedProps = {};
    this._localDB = null;
    this._clones = [];

    this.global_store_path_array = [];
    if ( !this.isSuffixed ) {
      this.global_store_path = '';
    }

    if ( this.isAbstract  ) {

      // Only execute mixin inits, but don't attach methods
      Object.assign(this, {
        read_mixin_init: ReadMixin.read_mixin_init,
        write_mixin_init: WriteMixin.write_mixin_init
      });
      this.read_mixin_init();
      this.write_mixin_init();

    } else {
      if ( USE_READ_MIXIN ) {
        Object.assign(this, ReadMixin);
        this.read_mixin_init();
      }

      if ( USE_WRITE_MIXIN && !this.isReadonly ) {
        Object.assign(this, WriteMixin);
        this.write_mixin_init();
      }
    }

    // delete this.read_mixin_init
    // delete this.write_mixin_init
  }

  /**
   * _clone -
   */
  _clone() {
    // INFO: Here we could easly make a copy of items that are meant to be
    // singletons (like caches)

    // INFO: This will evaluate all getters!

    // (all static getters from model definition -> fixed)
    // - Only because they are not in the prototype
    // get _db
    // get _template_path_field_names
    // get _schema_fields
    // get path
    // get parentRef
    // get rootRef
    // get schema_required_fields
    // get schema_optional_fields
    // get schema_all_fields
    // get subscriptions
    // get rules

    // CAREFUL: $store inside getters will still point to old instance!

    const prototype = Object.getPrototypeOf( this )
    const instance = Object.create( prototype )
    const clone = Object.assign( instance, this )

    const REDEFINE_GETTERS_AFTER_CLONE = true;
    const REDEFINE_ACTIONS_AFTER_CLONE = true;

    if ( REDEFINE_GETTERS_AFTER_CLONE ) {
      delete clone.getters
      delete clone._vm // !!!
      clone.read_mixin_init();
    }

    if ( !this.isReadonly && REDEFINE_ACTIONS_AFTER_CLONE ) {
      clone.write_mixin_init(true);
    }

    // Keep track of clones
    clone._clones = []
    this._clones.push(clone);

    return clone
  }

  /**
   * setName - Set stores name
   */
  setName( name ) {
    this.name = name;
  }

  /**
   * _get_uid - Generates a new unique identifier based on the selected method in the constructor
   * @returns Unique ID
   */
   // TODO: Public, uid -> id
  generateId() { return this._get_uid() }

  _get_uid() {
    switch ( this.uidMethod ) {
      case UIDMethod.SLUGID:
        return slugid.nice();

      case UIDMethod.PUSHID:
        // var ref = this.parentRef;
        var ref = this.rootRef;
        // Generate a reference to a new location and add some data using push()
        var newItemRef = ref.push();
        // Get the unique key generated by push()
        return newItemRef.key;
        // return this.ref.push().key;

      case UIDMethod.TIMESTAMP:
        return _firebase.database.ServerValue.TIMESTAMP;

      case UIDMethod.LOCAL_TIMESTAMP:
        return moment.currentTime().unix();

      case UIDMethod.DATE:
        /* !!! This is the local time, not the server time !!! */
        return moment.currentDate().format('DD-MM-YYYY');

      case UIDMethod.OTHER_USER_ID:
        throw new Error('Please provide id through id override')

      case UIDMethod.MY_USER_ID:
        if ( !GenericStore.defaultUserId ) {
          throw new Error('User ID is not set, but a store uses USER_ID as key')
        }
        return GenericStore.defaultUserId;

      case UIDMethod.ARRAY:
        return 0; // TODO

      case UIDMethod.EMAIL:
        // TODO: let email = atob(key)
        // TODO: let key = btoa(email)
        throw new Error('Only email addresses allowed as key')

      case UIDMethod.CUSTOM:
        let customId = this.uidMethodCallback( this.definedProps )
        if ( !customId ) {
          throw new Error( 'An ID was not defined. Check custom UID Callback.' );
        }
        return customId

      default: throw new Error('Unknown UID Method: ' + this.uidMethod)
    }
  }

  /**
   * @static setDefaultDB - Sets the default DB
   *
   * @param  {type} db description
   */
  static setDefaultDB( db ) {
    defaultDB = db;
  }

  /**
   * get _db - Get reference to db (this will allow other then default databases in the future)
   *
   * @return {type}  Firebase.db
   */
  get _db() {
    return this._localDB || defaultDB;
  }

  /**
   * _validateId - Checks if a given id is valid
   *
   * @return {type}    true or false
   */
  _validateId( id ) {
    if ( this.uidMethod === UIDMethod.SLUGID ) {
      if ( !isValidId(id) ) {
        return false;
      }
    }
    if ( id === -1 || !id ) {
      return false;
    }
    return true;
  }

  /**
   * _defineUser - Define user (userId/uid) based on default value
   */
  _defineUser() {
    if ( GenericStore.defaultUserId ) {
      this.definedProps[ 'uid' ] = GenericStore.defaultUserId;
    }
  }

  /**
   * @static get - Returns the default default UserId for all stores
   *
   * @return {type}  description
   */
  static get defaultUserId() { return genericStoreGlobalState.userId; }

  /* Non static version */
  get defaultUserId() { return genericStoreGlobalState.userId; }

  /**
   * @static set - Set the default default UserId for all all stores
   *
   * @param  {type} id description
   * @return {type}    description
   */
  static set defaultUserId(id) {

    // TODO: Throw error if called before Vue.use(heliosRX)

    /* When changing the user id we have to DELETE the 'uid' prop,
       otherwise the user uid will be stored in definedProps,
       and is still used. This is especially dangerous in Cloud Functions,
       since a call of most GenericStore methods will define uid.
       The next call of the CF will then still remember the old user,
       even when setting a new user with setDefaultUser(). This will happen
       for all paths that look like /user/{uid}/etc */

    /* INFO: In the future this should be refactored to be completly stateless! */

    log("[GENS] settings default user id to: uid =", id);
    _Vue.set( genericStoreGlobalState, 'userId', id)
    // _userId = id;
  }

  /**
   *
   *
   */
  static resetState() {
    // genericStoreGlobalState.reset();
    log("[GENS] reset state");
    _Vue.set( genericStoreGlobalState, 'userId', null)
  }

  /**
   * get path - Returns a firebase reference based on the template string
   * Automatically sets user if not defined
   */
  get path() { // TODO: rename this to path and this.path to this.uninterpolatedPath

    if ( !( 'uid' in this.definedProps ) ) {
      this._defineUser();
    }

    let path = parseTpl(this.templatePath, this.definedProps)

    let undefinedFields = analyzeTpl( path );

    if ( undefinedFields.length > 0 ) { // this might be ok in some cases?
      throw new Error('Not all template id\'s are defined. Required fields are ' + undefinedFields.join(', '))
    }

    /* remove * if it is the last character, otherwise replace * by {id} so it
       can be interpolated by this.define. */
    /*
    if ( !this.isSuffixed  ) {
      return path.slice(0, -1)
    } else {
      return path.replace(/\*----/, '{id}')
    }*/

    return path.replace(/\*/g, '{id}')
  }

  /**
   * _previewPath - Generate a path preview for a given it
   *
   * @param  {type} id description
   */
  _previewPath( id ) {

    // TODO: Should this be called during preview?
    if ( !( 'uid' in this.definedProps ) ) {
      this._defineUser();
    }

    let path = parseTpl(this.templatePath, this.definedProps)
    if ( id ) {
      path = path.replace(/\*/g, id);
    } else {
      path = path.replace(/\*/, '{id}');
    }
    return path;
  }

  /**
   * childRef(id) - Returns reference to a specific child of the collection
   */
  childRef(id) {
    /* replace {id} with id */
    return this._db.ref( this.path.replace(/\{id\}/g, id) );
  }

  /**
   * get parentRef - Returns reference to collection that contains all items
   */
  get parentRef() {
    /* get string before {id} */
    return this._db.ref( this.path.split('{id}').shift() );
    // return this._db.ref( this.path ).parent < should work too?
  }

  /**
   * get rootRef - Return reference to root of database
   */
  get rootRef() {
    return this._db.ref();
  }

  /**
   * _define - Defines id's in the template string (INTERNAL)
   *
   * @param {GenericStore} target - Target of replacement (usually this)
   * @param {object} props - Id's that should be replaced.
   * @example <caption>Example usage of method1.</caption>
   * task_session_list = new GenericStore('/goal/{goalId}/user_list/{uid}/task_session_list/{taskId}/*', TaskSessionTypeDefinition)
   *
   * task_session_list.define({
   *   goalId: 'KrZPg8N6THOisFz_T992Zg',
   *   uid: 'l1X8FPc7YtbftlC31frciInV3PU2'
   * })
   *
   * @returns {nothing}
   */
  _define( target, props ) {
    /* Merge new props with previous props */
    target.definedProps = Object.assign({}, this.definedProps, props)

    let known_field_names = [].concat( this._template_path_field_names, this.additionalProps );
    for ( var prop in props ) {
      if ( !known_field_names.includes( prop ) ) {
        console.warn("Prop", prop, "not found in template path. Known fields are", known_field_names);
      }
    }
    return target; // Allow chaining
  }

  define( props ) {
    return this._define( this, props );
  }

  with( props ) {
    // Synax: store.with({ prop1: 'value' }).add({...}) - store is not mutated
    let new_this = this._clone();
    return this._define( new_this, props );
  }

  /**
   * get _template_path_field_names - Returns all fields in the template path that need to be defined
   *
   * @return {type}  description
   */
  get _template_path_field_names() {
    let known_field_names = analyzeTpl( this.templatePath );
    return known_field_names;
  }

  /**
   * Resets the template path to it's initial state, without substitutions.
   */
  reset(level = 1) {
    if ( level === 1 ) {
      log2("[GENS] resetting", this.name, "with", this._clones.length, "clones")
    }

    // console.log("[GENS] RESET ", level, ":", this.name, " -> Found", this._clones.length, "clones")
    this.definedProps = {}
    if ( level > 3 ) {
      console.warn("[GENS] RESET - Stop at recursion level 3", this._clones)
      return
    }
    this._clones.forEach(clone => {
      clone.reset( level + 1 );
    })
  }

  /**
   *
   */
  get _schema_fields() {
    let schema = ( ( this.modelDefinition || {} ).schema || {} ).fields
    if ( typeof schema === 'undefined' ) {
      return [];
    }
    if ( !Array.isArray( schema ) ) {
      schema = Object.keys(schema).map(key => {
        return { model: key, ...schema[key] }
      });
    }
    return schema;
  }

  /**
   * get schema_optional_fields - Returns all required fields defined in the schema
   *
   * @return {type}  description
   */
  get schema_required_fields() {
    return this._schema_fields
          .filter( field => field.required )
          .map( field => field.model );
  }

  /**
   * get schema_optional_fields - Returns all optional fields defined in the schema
   *
   * @return {type}  description
   */
  get schema_optional_fields() {
    return this._schema_fields
          .filter( field => !( field.required || false )  )
          .map( field => field.model );
  }

  /**
   * get schema_all_fields - Returns all fields that are defined in the schema
   *
   * @return {type}  description
   */
  get schema_all_fields() {
    return this._schema_fields.map( field => field.model );
  }

  /**
   * _check_required_fields - Check if all required fields exists according to schema
   *
   * @param  {type} data data to check
   */
  _check_required_fields( data ) {
    this.schema_required_fields.forEach(required_field => {
      if ( !( required_field in data ) ) {
        throw new Error('Required field <' + required_field + '> not present.')
      }
    })
  }

  /**
   * _check_required_fields - Check if create inputs are present
   *                          Required by user is not the same a required by DB!
   *
   * @param  {type} data data to check
   */
  _check_required_create_arg( data ) {
    // TODO: Convert object to array
    let schema = ( ( this.modelDefinition || {} ).schema || {} );
    (schema.create_required || []).forEach(required_create_arg => {
      if ( !( required_create_arg in data )) {
        throw new Error('Required create argument <' + required_create_arg + '> not present.')
      }
    })
  }

  /**
   * _validate_schema - Validates against the current schema
   *
   * @param  {type} data      data to validate
   * @param  {type} is_update is the data used for updating and existing item?
   */
  _validate_schema( data, is_update ) {

    if ( this.modelDefinition
      && this.modelDefinition.schema
      && this.modelDefinition.schema.unsafe_disable_validation ) {
      return;
    }

    // TODO: Convert object to array
    let schema = this._schema_fields
    if ( schema && schema.length >= 0 ) {
      /* Check 1: Are required fields present (Disabled for updates) */
      if ( !is_update ) {
        this._check_required_fields( data )
        /*
        schema.fields.forEach(required_field => {
          if ( ( required_field.required || false ) && !( required_field.model in data ) ) {
            throw new Error('Required field <' + required_field.model + '> not present.')
          }
        });
        */
      }

      // Regexes to match special bolt types
      const mapRegex = /Map\s*<(?<key>\w+),\s*(?<val>\w+)>/i;
      const typeRegex = /(?<val>\w+)\s*\[\]/;

      /* Check 2: Are provided fields within schema? */
      let allowed_field_names = this.schema_all_fields;
      let allowed_field_regex = [];
      let allowed_field_map = {}

      if ( schema.length === 0 ) {
        console.warn('Schema for "' + this.name + '" is empty.');
      } else {
        allowed_field_map = Object.assign(...allowed_field_names.map((k, i) => {
          if ( k.startsWith('/') && k.endsWith('/') ) {
            allowed_field_regex.push( k )
          }
          return { [k]: this._schema_fields[i] }
        }));

        Object.keys(allowed_field_map).forEach((key, i) => {

          let type = allowed_field_map[ key ].validate_bolt_type || ''

          if ( mapRegex.test( type ) ) {
            // See: https://github.com/firebase/firebase-js-sdk/blob/master/packages/database/src/core/util/validation.ts
            let regex = "/^" + key + "\\/((?![\\/\\[\\]\\.\\#\\$\\/\\u0000-\\u001F\\u007F]).)*$/";
            allowed_field_regex.push( regex )
            allowed_field_map[ regex ] = this._schema_fields[i];
          }
        })
      }

      Object.keys( data ).forEach(key => {

        let matchedRegex = allowed_field_regex.find(regex => {
          const flags = regex.includes('\\u00') ? '' : 'u' // Unicode
          let rx = new RegExp( regex.substring( 1, regex.length - 1 ), flags )
          return rx.test( key )
        })

        if ( !matchedRegex && !allowed_field_names.includes(key) ) {
          throw new Error('Field <' + key + '> is not allowed by schema.')
        }

        /* Check 3: Execute validator if present */
        let field = allowed_field_map[ matchedRegex || key ]
        if ( field.validator ) {

          // TODO: Try-catch
          // TODO: see https://vue-generators.gitbook.io/vue-generators/validation/custom-validators
          let result = field.validator(
            /* value */ data[ key ],
            /* field */ field,
            /* model */ null
          );

          if ( !result || ( result.length && result.length === 0 ) ) {
            throw new Error('User-defined schema validation failed for key "' + key + '" with error: ' + result)
          }
        }

        if ( this.enableTypeValidation ) {

          // TODO: Also support Generic types (MyTime<A,B>)

          let type_list = (field.validate_bolt_type || "").split("|");
          let check = type_list.some(typeRaw => {

            let type = typeRaw.trim()
            let typeInfo = {};

            if ( typeRegex.test( type ) ) {
              typeInfo = typeRegex.exec( type ).groups;
              type = 'Array';
            }

            if ( mapRegex.test( type ) ) {
              typeInfo = mapRegex.exec( type ).groups;
              type = 'Map';
            }

            return this._validate_bolt_type(
              data[ key ],
              type,
              typeInfo
            );
          })

          if ( !check ) {
            throw new Error('Type-based schema validation failed for key "' + key + '" with error.')
          }
        }
      })
    } else {
      throw new Error('No schema found for "' + this.name + '", please provide one.')
    }
  }

  /**
   * _validate_bolt_type - Returns true if the value is a valid type of a give type
   *
   * @return {boolean} is value of type 'type'?
   */
  _validate_bolt_type( value, type, typeInfo = {} ) {
    switch ( type.toLowerCase() ) {
      case 'string':  return isString( value );
      case 'number':  return isNumeric( value );
      case 'boolean': return isBoolean( value );
      case 'object':  return isValue( value ) && isObject( value ) && !isArray( value );
      case 'any':     return isValue( value );
      case 'null':    return value === null;
      case 'map':
        // Map<Key, Value> -> Map + { key, val }
        return isObject( value )
          && !isArray( value )
          && Object.entries( value ).every(([ k, v ]) => {

            // JS-Array keys are always strings!
            let hasValidKey = isString( k );
            let hasValidValue = this._validate_bolt_type( v, typeInfo.val );
            // let hasValidKey = this._validate_bolt_type( k, typeInfo.key );

            return hasValidKey && hasValidValue;
          });
      case 'array':
        // Type[] = Map<Number, Type>
        let entries = [];
        if ( isArray( value ) ) {
          entries = value;
        } else if ( isObject( value ) ) {
          entries = Object.values( value );
        } else {
          return false;
        }
        return entries.every( (v) => {
          let hasValidType = this._validate_bolt_type( v, typeInfo.val );
          return hasValidType;
        });
      default:
        console.warn("Can not validate type '" + type + "'");
        return true;
    }
  }

  /**
   * get subscriptions - Returns subscriptions that were create by this store
   *
   * @return {list} list of subscriptions
   */
  get subscriptions() {
    return subscriptions.get( this );
  }

  /**
   * _bind_rtdb - Firebase binding
   *
   * Adapted from:
   * see: https://github.com/vuejs/vuefire/blob/feat/rtdb/packages/vuexfire/src/rtdb/index.js
   *
   * @param {{ key, ref, ops, bindAsArray }} obj - config
   * @param {string} obj.key                - Key where the data is stored locally
   * @param {firebase.database.ref} obj.ref - Firebase Realtime Database reference
   * @param {type} obj.ops                  - operations {init, add, remove, set, set_sync}
   * @param {boolean} obj.bindAsArray.      - bind as list (true), bind as document (false)
   */
  _bind_rtdb({ key, ref, ops, bindAsArray }) {
    // TODO check ref is valid
    // TODO check defined in vm

    // TODO: Why do we need subscriptions? isn't that the same as the instance cache and the registry?
    // subscritions is a liittle bit more fundamental = real listeners
    // registry = reactive data (but used where?)
    // instance cache = cached subscriptions (real and 'simulated') as generic models

    let sub = subscriptions.get(this)
    if (!sub) {
      sub = Object.create(null)
      subscriptions.set(this, sub)
    }

    // unbind if ref is already bound
    if (key in sub) {
      this._unbind_rtdb(key)
    }

    // if ( subscriptions.get(key) ) { }

    return new Promise((resolve, reject) => {
      sub[ key ] = bindAsArray
        ? rtdbBindAsArray({ key, collection: ref, ops, resolve, reject })
        : rtdbBindAsObject({ key, document: ref, ops, resolve, reject })
      // subscriptions.set(key, unsubscribe)
    })
  }

  /**
   * _fetch_rtdb - Firebase binding
   *
   */
  _fetch_rtdb({ key, ref, ops, bindAsArray }) {
    return new Promise((resolve, reject) => {
      bindAsArray
        ? rtdbFetchAsArray({ key, collection: ref, ops, resolve, reject })
        : rtdbFetchAsObject({ key, document: ref, ops, resolve, reject })
    })
  }

  /**
   * _unbind_rtdb - Unbind firebase from location
   *
   * @param  {type} { key } description
   */
  _unbind_rtdb({ key }) {
    const sub = subscriptions.get(this)
    if (!sub || !sub[key]) return

    // subscriptions.delete( key );
    // const sub = subscriptions.get(key)

    sub[key]()
    delete sub[key]
  }

  // ---------------------------------------------------------------------------
  /**
   * rules - Return custom validation rules for elements
   * See: https://element.eleme.io/#/en-US/component/form#custom-validation-rules
   */
  get rules() {
    let schema = this.modelDefinition.schema.fields;

    if ( !Array.isArray( schema ) ) {
      schema = Object.keys(schema).map(key => {
        return { model: key, ...schema[key] }
      });
    }

    let rules = {};
    schema.forEach(field => {
      // TODO: Allow multiple rules
      // TODO: Allow UI-rules AND DB-rules
      // TODO: Allow custom message
      // TODO: Allow to set blur
      rules[ field.model ] = [{
        validator: (rule, value, callback) => {
          if ( field.validator( value ) ) {
            callback();
          } else {
            callback(new Error('Invalid input'));
          }
        },
        trigger: 'blur'
      }];
    });
    return rules;
  }
}

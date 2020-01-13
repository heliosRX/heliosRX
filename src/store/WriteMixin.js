/*******************************************************************************

- TODO: [ ] ...

*******************************************************************************/

import isEqual from 'lodash.isequal'
import { DeleteMode } from './GenericStore'
import { _models } from '../install'
import { _registry as registry } from '../install'
import { parseTpl, analyzeTpl } from '../util/template'
import { add_custom_actions, make_reactive_model } from '../classes/utils'
import moment from '../moment'

const BACKEND = 'REALTIMEDB';
const log = (...args) => { console.log(...args) };

// -----------------------------------------------------------------------------
export default {

  // ---------------------------------------------------------------------------
  write_mixin_init( reset = false ) {
    if ( this.modelDefinition ) {
      if ( this.modelDefinition.staticActions ) {

        const context = {
          $store: this,
          $models: _models,
          $registry: registry,
          // state: registry.state,
          // TODO
          // state,      // same as `store.state`, or local state if in modules
          // rootState,  // same as `store.state`, only in modules
          // commit,     // same as `store.commit`
          // dispatch,   // same as `store.dispatch`
          // getters,    // same as `store.getters`, or local getters if in modules
          // rootGetters // same as `store.getters`, only in modules
        }
        add_custom_actions( context, this, this.modelDefinition.staticActions, reset )
      }
    }
  },

  // ---------------------------------------------------------------------------
  /**
  * @example <caption>Add a new item</caption>
  * challenge.add({ title: 'Name' })
  *
  * @returns {Promise} - Promise that returns the new id when resolved
  */
  add( overwrite_data, new_id, options ) {
    /* if ( this.isSuffixed ) {
      console.warn('Suffixed stores can not create new items, use unsuffixed'
                    + ' store instead (e.g. goal instead of goalMeta).')
    } */

    let payload = null;
    if ( !new_id ) {
      new_id = this._get_uid();
    }

    if ( !new_id['.sv'] && !this._validateId( new_id ) ) { // only validate if not a server variable
      throw new Error('Got invalid id:' + new_id)
    }

    let useTemplateFunction = true;
    if ( options && options.directWrite ) {
      useTemplateFunction = false;
    }

    if ( this.modelDefinition ) {

      if ( useTemplateFunction ) {
        if ( this.modelDefinition.schema && this.modelDefinition.schema.create ) {
          /* Check if required input args are present */
          this._check_required_create_arg( overwrite_data );

          /* Execute create function */
          payload = this.modelDefinition.schema.create(
            overwrite_data,
            overwrite_data,
            BACKEND )
        } else {
          console.warn("No create function found in type definition, using overwrite data as payload.");
          payload = overwrite_data;
        }
      } else {
        payload = overwrite_data;
      }

      /* Validate created data against it's schema. This is not 100% necessary,
         but just checks if the data coming from create() is consistent with
         the schema. */
      if ( this.modelDefinition.schema ) {
        this._validate_schema( payload, false )
      } else {
        console.warn("No schema found to validate input");
      }
    } else {
      console.warn("No type definition found, using UNVALIDATED overwrite data as payload.");
      payload = overwrite_data;
    }

    this._convert_moment_objects( payload )

    log("[GENS] Creating at", this._previewPath(new_id), "with payload", payload);
    // return this.ref.set(payload).then(() => new_id);
    // return this._db.ref( this.interpolatedPath ).set(payload).then(() => new_id); <<<<< FALSCH!!!
    // return this.childRef( new_id ).update({ [new_id]: payload }).then(() => new_id);
    /*console.log('new id: ', new_id)
    if ('.sv' in new_id) { // server value in key
      console.log('server value in id detected')
      return this.parentRef.update({ [newPostKey]: payload }).then(() => new_id);
    } else {*/
    if ( this.isSuffixed ) {
      return this.childRef( new_id ).update(payload).then(() => new_id);
    } else {
      return this.parentRef.update({ [new_id]: payload }).then(() => new_id);
    }
  },

  // ---------------------------------------------------------------------------
  /**
  * @example <caption>Update single field</caption>
  * challenge.update(id, { key: value })
  * goal_user_settings.update({ 'kanbanSettings/showFinishedTasks': 1 })
  *
  * @example <caption>Update multiple fields</caption>
  * challenge.update(id, { key1: value1, key2: value2 })
  * challenge.update([{ key1: value1 }, { key2: value2 }, ...]) -- ????
  *
  */
  update(id, data) {
    // if ( !util.isArray( data ) ) {
    //   data = [ data ];
    // }
    // data.forEach((value, key) => {
    //   payload
    // });

    if ( !id || !data ) {
      throw new Error('Either id or data is missing.')
    }

    if ( !this._validateId(id) ) {
      if ( (this.modelDefinition.schema || {}).unsafe_disable_validation ) {
        console.warn("Got invalid id <" + id + ">, but validation is disabled.");
      } else {
        throw new Error('Got invalid id in update')
      }
    }

    // TODO: Replace '/' with '.' to be consistent with schema --> .replace(/\//g, '.')

    if ( this.modelDefinition.schema ) {
      this._validate_schema( data, true );
    } else {
      console.warn("No schema found to validate input");
    }

    // let path = this.interpolatedPath;
    let payload = data;
    this._convert_moment_objects( payload )

    log("[GENS] Updating at", this._previewPath(id), "with payload", payload);
    return this.childRef( id ).update(payload);
  },

  // ---------------------------------------------------------------------------
  /**
  *
  * @param {object/array} sortidxList - Batch should be an array or array of objects
  * @example
  * store.reorder([id1, id2, ...])
  * store.reoder([{ id: id1, sortidx: 1 }, { id: id2 sortidx: 2 }, ...])
  *
  * The second version can also be used to pass the entire collection
  * store.reoder(updated_commitment_list)
  */
  reorder(sortidxList, options = {}) {

    if ( this.isSuffixed ) {
      throw new Error('Suffixed store does not support reorder')
    }

    let sortkey = options.overwriteSortIdxKey || 'sortidx'

    if ( sortidxList.length > 0 && typeof sortidxList[0] !== 'object' ) {
      let sortidx = 0;
      sortidxList = sortidxList.map((id) => {
        sortidx = sortidx + 100; // ???
        return { id: id, sortidx: sortidx }
        // TODO: Why not $id ?
      })
    }

    let batchData = {};
    sortidxList.forEach(item => {
      let sortidx = item.sortidx;

      // Support 'id' and '$id' as key
      item.id = item.id || item.$id;

      if (typeof sortidx !== "number") {
        sortidx = parseFloat(sortidx);
      }

      if (isNaN(sortidx)) {
        throw new Error("Got invalid sortidx", sortidx);
      }

      if (!this._validateId(item.id)) {
        throw new Error("Got invalid id", item.id);
      }

      // payload[`tasks.${item.id}.sortidx`] = sortidx;
      batchData[item.id] = { [sortkey]: sortidx };
    });

    let payload = {};
    Object.keys(batchData).forEach(id => {
      let data = batchData[id];
      Object.keys(data).forEach( prop => {
        /* Allow to update multiple fields. This is not required here, but maybe in the future */
        // data[path + '/' + subset_name + '/' + id + '/' + prop] = data[prop];
        // "/goal/{goalId}/user_list/{uid}/task_names/"

        payload[ this._previewPath(id) + '/' + prop ] = data[prop];
      })
    });

    // TODO: Check schema if sortidx is allowed

    log("[GENS] update at", this._previewPath(), "with payload", payload);
    return this.rootRef.update(payload)
  },

  // ---------------------------------------------------------------------------
  /**
  * Deletes one or many an entry at the data location
  * @param {UUID} id - id the item or arrary of ids of items that should be deleted
  * @param {bool=} soft_delete - optional: Overwrite default behaviour for delete mode
  * @example
  * challenge.remove(id)
  * challenge.remove(id, true) // Soft delete
  * challenge.remove([id1, id2, id3], true) // List mode
  */
  remove(id, soft_delete) {

    // TODO: Check in schema if soft delete is supported

    soft_delete = soft_delete === undefined
                ? this.defaultDeleteMode === DeleteMode.SOFT
                : soft_delete;

    if ( Array.isArray( id ) ) {

      const id_list = id;
      const payload = {};
      id_list.forEach(id => {
        if ( !this._validateId(id) ) {
          throw new Error('Got invalid id in remove')
        }

        if ( soft_delete ) {
          payload[ id + '/deleted' ] = true
        } else {
          payload[ id ] = null
        }
      })

      log("[GENS] batch deleting at", this.path, "with payload", payload);
      return this.parentRef.update(payload);
    }

    if ( !this._validateId(id) ) {
      throw new Error('Got invalid id in remove')
    }

    // TODO: Check in schema if soft delete is supported

    if ( soft_delete ) {
      log("[GENS] soft deleting at", this.path, "with", { deleted: true });
      return this.update(id, { deleted: true })
      // return this.childRef( id ).update({ deleted: true  });
    }

    // TODO: automatically remove listener !!!

    log("[GENS] hard deleting at", this.path);
    return this.childRef( id ).remove();
  },

  // ---------------------------------------------------------------------------
  /**
  * Restores a deleted entry at the data location
  */
  restore( id ) {
    return this.update(id, { deleted: false }) // ... or null
  },

  // ---------------------------------------------------------------------------
  /**
   * copy - Copy data between nodes (same as move, but keeps original
   *        and generates new id)
   * @param {id} id - id of source object
   * @param {object} contextA - props of the source path
   * @param {object} contextB - props of the destination path
   *
   */
  copy(id, contextA, contextB) {
    return this.move(id, contextA, contextB, { keepOriginal: true, keepId: false });
  },

  // ---------------------------------------------------------------------------
  /**
  * Move data between nodes
  * @params {UUID} id - Id of the object that should be moved
  * @param {object} contextA - props of the source path
  * @param {object} contextB - props of the destination path
  *
  * @example
  *   store.move(234, { uid: 'A' }, { uid: 'B' })
  *
  *   store.move(id, { uid: 'A', taskId: 234 }, { uid: 'B', taskId: 234 })
  *
  * @todo support batch move (as transaction!):
  *   storeA = GenericStore('/goal/{goalId}/user_list/{uid}/task_names/*')
  *   storeB = GenericStore('/goal/{goalId}/user_list/{uid}/task_details/*')
  *   storeC = GenericStore('/goal/{goalId}/user_list/{uid}/task_end_dates/*')
  *   let superStore = SuperStore([storeA, storeB, storeC])
  *   superStore.batchMove( id, contextA, contextB )
  *
  */
  move(id, contextA, contextB, { keepOriginal = false, keepId = true } = {}) {

    if ( this.isSuffixed ) {
      throw new Error('Suffixed store does not support move')
      // TODO: It probably does - test and remove this check
    }

    if ( !this._validateId(id) ) {
      throw new Error('Got invalid id in remove')
    }

    let keysContextA = Object.keys( contextA ).sort();
    let keysContextB = Object.keys( contextB ).sort();

    if ( !isEqual(keysContextA, keysContextB) ) {
      throw new Error('Context A and context B do not have equal keys')
    }

    // TODO: Validate each id in keys

    /* Example
       path = '/goal/{goalId}/user_list/{uid}/task_session_list/{taskId}/*'

       define({
         goalId: 'KrZPg8N6THOisFz_T992Zg',
         uid: 'l1X8FPc7YtbftlC31frciInV3PU2'
       })

       path = '/goal/KrZPg8N6THOisFz_T992Zg/user_list/l1X8FPc7YtbftlC31frciInV3PU2/task_session_list/{taskId}/{id}'

       move(123, { uid: 'A', taskId: 234 }, { uid: 'B', taskId: 234 })

       pathA = '/goal/KrZPg8N6THOisFz_T992Zg/user_list/A/task_session_list/234/123'
       pathB = '/goal/KrZPg8N6THOisFz_T992Zg/user_list/B/task_session_list/234/123'
    */

    let propsA = Object.assign({}, this.definedProps, contextA, { id: id })
    let propsB = Object.assign({}, this.definedProps, contextB, { id: id })

    if ( !keepId ) {
      propsB['id'] = this._get_uid(); // TODO: allow to set new id ?
    }

    /* Replace * with {id} in template string (see interpolatedPath)*/
    let templatePath = this.templatePath.replace(/\*/, '{id}');

    let pathA = parseTpl(templatePath, propsA)
    let pathB = parseTpl(templatePath, propsB)

    // if( !this.isSuffixed ) {
    //   pathA = pathA.slice(0, -1)
    //   pathB = pathB.slice(0, -1)
    // }

    /* No need to check pathB, since we ensure that they have the same keys */
    let undefinedFields = analyzeTpl( pathA )
    if ( undefinedFields.length > 0 ) {
      throw new Error('Not all template id\'s are defined. Required fields are ' + undefinedFields.join(', '))
    }

    // 1. Read at A
    return this._db.ref(pathA).once('value').then(snapshot => {
      var objectA = snapshot.val();
      // TODO: check if we got data
      return objectA
    }).then(objectA => {

      // 2. Write A to B
      // 3. Delete A (as a transaction with 2.)
      let payload = {
        [pathA]: null,
        [pathB]: objectA
      };

      if ( keepOriginal ) {
        payload = { [pathB]: objectA };
      }

      log("[GENS] moving data from ", pathA, "to", pathB, "with payload", payload);
      return this.rootRef.update(payload).then(() => propsB['id'])
    });
  },

  /**
  * transaction - perform transaction on RTDB
  *
  * @example:
  * $models.example.transaction( <childId>, <prop>, <transaction> )
  * $models.example.transaction( id, 'coins', coins => coins * 2 )
  * $models.example.transaction( id, 'coins', 'inc', 100 )
  * $models.example.transaction( id, 'coins', 'inc' ) // defaul: increment by 1
  *
  */
  transaction( id, prop, transaction, value = 1 ) {

    if ( !this._validateId(id) ) {
      throw new Error('Got invalid id in remove')
    }

    let targetRef = this.childRef( id )
    if ( prop ) {
      this._validate_schema({ [prop]: 1 }) // HACK: Using numeric dummy value to check schema
      targetRef = targetRef.ref.child(prop)
    }

    if ( typeof transaction === 'string' ) {
      switch ( transaction ) {
        case 'inc': transaction = (v) => ( v || 0 ) + value; break;
        case 'dec': transaction = (v) => ( v || 0 ) - value; break;
      }
    }

    if ( typeof transaction !== 'function' ) {
      throw new Error('Transacton must be a function')
    }

    log("[GENS] tranaction on ", targetRef.path.toString() /*, "with", transaction*/);
    return targetRef.transaction(transaction).then((result) => {
      if ( result.committed ) {
        console.log("[GENS] Transacton successfully committed")
        return true
      }
      console.log("[GENS] Transacton aborted") // To abort transaction return undefined
      return false
    });
  },

  // ---------------------------------------------------------------------------
  /**
   * new - Create empty model from schema (without calling create function)
   *
   * new + write = new_id + update
   *
   * @return {type}  description
   */
  new() {
    let model = make_reactive_model( this.modelDefinition, null, this._create_context(), false );
    return model;
  },

  /**
   * new_from_template - Create empty model from create function
   *
   * new_from_template + write = add
   *
   * @return {type}  description
   */
  new_from_template( data = {}, optional_data = null ) {
    let generated_data = this.empty( data, optional_data )
    let model = make_reactive_model( this.modelDefinition, data, this._create_context(), false );
    model._update_data( generated_data, null, true ); // doppelt
    return model
  },
  /**
   * new_from_template - Create empty model from create function
   *
   * new_from_template + write = add
   */
  new_from_data( data = {}, make_dirty = false ) {
    let model = make_reactive_model( this.modelDefinition, data, this._create_context(), false );
    // model._update_data( generated_data, null, true );
    return model
  },

  /**
   * empty - Create empty payload from schema.create()
   *         This method WILL only create an JS-Object, not a GenericModel
   *         In most cases, you want to use new_from_template_instead
   */
  empty( data = {}, optional_data = null ) {
    if ( !this.modelDefinition ) {
      return null
    }

    if ( !( this.modelDefinition.schema && this.modelDefinition.schema.create ) ) {
      return null
    }

    this._check_required_create_arg( data );

    let payload = this.modelDefinition.schema.create( data, optional_data || data /*HACK*/, BACKEND )

    /* Validate created data against it's schema. */
    if ( this.modelDefinition.schema ) {
      this._validate_schema( payload, false )
    } else {
      console.warn("No schema found to validate input");
    }

    return payload;
  },

  /**
   * _convert_moment_objects - Convert all moment objects
   *
   */
  _convert_moment_objects( payload ) {
    if ( typeof payload !== 'object' ) {
      console.log("Got payload", payload, typeof payload);
      throw new Error('Expected object, got ' + payload);
    }
    /* payload can either be array or object */
    for ( let prop in payload ) {
      if ( moment.isMoment( payload[ prop ] ) ) {
        if ( payload[ prop ].toRealtimeDB ) {
          payload[ prop ] = payload[ prop ].toRealtimeDB();
        } else {
          throw new Error('Moment object passed to add/update must be enhanced moment objects.')
        }
      } else if ( Array.isArray( payload[ prop ] ) ) {
        this._convert_moment_objects( payload[ prop ] );
      } else if ( typeof payload[ prop ] === 'object' ) {
        // TODO: Detect circular structures
        this._convert_moment_objects( payload[ prop ] );
      }
    }
  }
}

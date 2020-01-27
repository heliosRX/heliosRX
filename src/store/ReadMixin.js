/*******************************************************************************

- xTODO: status should be stores in root.status or delete 'sync' / 'status'
- xTODO: reg.*.data should be created "on-the-fly" without storing it in the db
- xTODO: Return classes instead of object (tested - works with observable)
- TODO: sharding support

*******************************************************************************/

import { _registry as registry } from '../external-deps' // TODO ???
import { _models } from '../external-deps'
import { walkGet, walkGetObjectSave } from '../registry/utils'
import joint from '../util/joint'
// import { UIDMethod, DeleteMode } from './enums'
import { HELIOSRX_INIT_VALUE,
         HELIOSRX_UNSET_VALUE,
         HELIOSRX_ARRAY_SET,
         HELIOSRX_ARRAY_ADD,
         HELIOSRX_ARRAY_REMOVE,
         HELIOSRX_SET } from '../registry/types'

import { add_custom_getters } from '../classes/utils'
import factory from '../classes/factory'

// import util from '../util/types'
import defer from '../util/defer'
import { arrayDiffTwoWay } from '../util/array'

const LOCAL_PATH_PREFIX = 'res.';

/* Log levels */
const _no_log = () => {};
// eslint-disable-next-line
const _log = (name, ...args) => {
  // Enable logging per store instance
  /*
  if ( !name.includes('commitmentDailySettings') ) {
    return
  }
  */
  console.log("[GENS:READ:" + name + "]", ...args)
};
// eslint-disable-next-line
const _log_group = (name, id, ...args) => {
  console.groupCollapsed('[GENS:READ:' + name + '] ' + ( id ? '{' + id + '}' : '*'));
  args.forEach(arg => console.log('INFO:', arg));
  console.trace();
  console.groupEnd();
}

const log0 = _no_log;
const log1 = _no_log;
const log2 = _no_log;
const log3 = _no_log;
const log4 = _no_log;
const SHOW_SYNCING_INDIVIDUAL_WARNING = false;

// const log_stringify = (v) => JSON.stringify(v)
const log_stringify = (v) => null;

const _resultInstanceCache = new Map();
const _resultListCache = new Map();

if ( String(process.env.VUE_APP_PRODUCTION) === 'false' ) {
  window.helioRxDev = window.helioRxDev || {};
  window.helioRxDev._resultInstanceCache = _resultInstanceCache
  window.helioRxDev._resultListCache = _resultListCache
}

// -----------------------------------------------------------------------------
export default {

  // ---------------------------------------------------------------------------
  read_mixin_init() {
    log2(this.name, "[GENS:LOADER] init");

    if ( this.modelDefinition ) {
      if ( this.modelDefinition.staticGetters ) {
        // const context = {
        //   state:   registry.state,
        //   getters: registry.staticGetters,
        //   model:   this,
          // $models: _models, can be imported directly
          // TODO
          // state,       // will be module local state if defined in a module.
          // getters,     // module local getters of the current module
          // rootState,   // global state
          // rootGetters  // all getters
        // }

        // Syntax: getter: ( $models, $registry, $UIStore?, $store ) => {...}
        // Careful: $store will point to the root instance not a with/clone-instance!

        const context = [ _models, registry, this ];
        this._vm = add_custom_getters( context, this, this.modelDefinition.staticGetters );
      }
    }
  },

  // ---------------------------------------------------------------------------
  /**
   * _infer_local_path_from_ref - Converts a firebase ref into a "walkable" path
   *
   * @param  {type} ref description
   * @return {type}     description
   *
   *   Converts
   *   "/goal/{goalId}/user_list/{uid}/task_details/ * /task_subscription",
   *   to
   *   "goal.{goalId}.user_list.{uid}.task_details.{id}.task_subscription",
   *   which refers to
   *   state.res.goal[ goalId ].user_list[ uid ].task_details[ ].task_subscription
   *
   *   TODO:
   *   state.res.goal[ goalId ].children.user_list[ uid ].children.task_details[ ].task_subscription.data
   *
   */
  _infer_local_path_from_ref( ref ) {
    let path = ref.path.toString()
    // return path.replace(/\//g, '.')
    return path.split('/').filter(p => p).join('.');
  },

  // ---------------------------------------------------------------------------
  /**
   * unsync - Stop syncing.
   *
   * @param  {type} id = null                 description
   * @param  {type} { clean_up = false } = {} description
   */
  unsync( id = null, { clean_up = false } = {} ) {
    log2(this.name, "[GENS] unsync", id, clean_up);

    // TODO: Document difference between unsync( without id ) and unsync_all()

    let key = id !== null
            ? this.global_store_path_array[ id ]
            : this.global_store_path;

    if ( key ) {
      this._unbind_rtdb({ key })
    }

    if ( id !== null && !( id in this.global_store_path_array ) ) {
      // This is the case, when we do unsync with id, even though
      // a data was synced with subscribeList().

      if ( this.isSuffixed ) {
        throw new Error('Unsync with id for data retrieved via subscribeList() is not supported.')
      }

      key = this.global_store_path + '.' + id;
    }

    if ( clean_up ) {
      log4(this.name, "unsync: clean up state. id:", id, "path:", key)

      // Find entry in GenericList and delete model
      if ( id !== null && _resultListCache.has( this.path ) ) {
        let list = _resultListCache.get( this.path );
        list._rem_child( id );
      }

      /*
      // TODO: Use this._match_existing_synced_nodes?
      let existing_path = id !== null
          ? this._previewPath( id )
          : this.path

      if ( _resultInstanceCache.has( existing_path ) ) {
        let model = _resultInstanceCache.get( existing_path )
        model.reset();
        model.$noaccess = true;
      }
      */

      registry.commit(
        HELIOSRX_UNSET_VALUE,
        { path: key },
        { root: true }
      );
    }
  },

  // ---------------------------------------------------------------------------
  /**
   * unsync_all - Stop sycning all subscriptions of this store.
   *
   * @param  {type} { clean_up = false } = {} description
   */
  unsync_all({ clean_up = false } = {}) {
    log2(this.name, "[GENS] unsync_all", clean_up);

    // Make sure there is only one sync per store
    // Currently it is possible to sync, then change prop, then sync again - but never unsync

    const sub = this.subscriptions
    if (!sub) return

    // TODO: Testen!
    if ( clean_up && _resultListCache.has( this.path ) ) {
      let list = _resultListCache.get( this.path );
      list.$id_list.forEach(id => list._rem_child( id ));
      list.reset(); // ?/
    }

    Object.keys(sub).forEach(key => {

      this._unbind_rtdb({ key })

      // TODO: Testen!
      if ( clean_up ) {
        registry.commit(
          HELIOSRX_UNSET_VALUE,
          { path: key },
          { root: true }
        );
      }
    });
  },

  // ---------------------------------------------------------------------------
  /**
   * fetch_individual - fetch an individual item of the collection
   *
   * @param  {type} id                            description
   * @param  {type} { overwriteKey = false } = {} description
   */
  fetch_individual( id, { overwriteKey = false, customOps = {} } = {} ) {
    return this.sync_individual(id, { overwriteKey, customOps, fetchOnce: true })
  },

  // ---------------------------------------------------------------------------
  /**
   * fetch - fetch all items in this collection
   *
   * @param  {type} { overwriteKey = false } = {} description
   */
  fetch_list( { overwriteKey = false, customOps = {}, customRef = null } = {} ) {
    return this.sync_list({ overwriteKey, customOps, customRef, fetchOnce: true })
  },

  // ---------------------------------------------------------------------------
  /**
   * sync_individual - sync an individual item of the collection
   *
   * @param  {type} id                        description
   * @param  {type} { overwriteKey = false    description
   * @param  {type} fetchOnce = false }  = {} description
   */
  sync_individual( id, { overwriteKey = false, fetchOnce = false, customOps = {} }  = {} ) {
    if ( !this.isSuffixed && !fetchOnce && SHOW_SYNCING_INDIVIDUAL_WARNING ) {
      console.warn("Syncing individually in " + this.name + ", even though list would be supported");
    }

    const ref          = this.childRef( id )
    const key_from_ref = this._infer_local_path_from_ref( ref )
    const key          = LOCAL_PATH_PREFIX + key_from_ref

    this.global_store_path_array[ id ] = key;

    log1(this.name, "sync_individual:", this.name, key, overwriteKey, fetchOnce);
    log2(this.name, "[GENS] - sync ref", ref.path.toString());
    log2(this.name, "[GENS] - sync key", key);
    log2(this.name, "[GENS] - sync target", this.global_store_path_array[ id ]);

    let ops = {
      init: () => {
        /* We have to make sure, we don't trigger init here and 'set' of a list at the same time */
        let data = {}
        log2(this.name, '[OPS:INIT (individual)]', data)
        registry.commit(HELIOSRX_INIT_VALUE,
          { path: this.global_store_path_array[ id ], data },
          { root: true })
        return { target: data }
      },
      set: ( target, data ) => {
        /* When using Server.TIMESTAMP this will get triggered twice.
         * Throtteling this function by approx 100ms should avoid unnecessary updates. */
        log2(this.name, '[OPS:SET (individual)]', target, log_stringify(data))

        // Check if data[.exists] = false ?
        registry.commit(HELIOSRX_SET,
          { target, data },
          { root: true })
      }
    }

    if ( fetchOnce ) {
      ops = {
        init: () => {
          log3(this.name, '[OPS:INIT] (fetch, individial)');
          let data = {}
          return { target: data }
        },
        set: (target, data) => {
          log3(this.name, '[OPS:SET] (fetch, individial)', target, log_stringify(data));
        }
      }
    }

    /* Join custom ops and regular ops together */
    Object.keys(customOps).forEach(op => {
      ops[ op ] = joint([ ops[ op ], customOps[ op ] ]);
    });

    return fetchOnce
      ? this._fetch_rtdb({ key, ref, ops, bindAsArray: false })
      : this._bind_rtdb({ key, ref, ops, bindAsArray: false })
  },

  // ---------------------------------------------------------------------------
  /**
   * sync - sync entire collection (also track child added, child removed)
   *
   * @param  {type} { overwriteKey = false    description
   * @param  {type} fetchOnce = false }  = {} description
   *
   *  Returns a promise, that will resolve, when all items are ready
   *
   */
  sync_list( { overwriteKey = false, fetchOnce = false, customOps = {}, customRef = null }  = {} ) {

    if ( this.isSuffixed ) {
      throw new Error('Suffixed store does not support bind to array')
    }

    const ref          = customRef || this.parentRef;
    const key_from_ref = overwriteKey || this._infer_local_path_from_ref( ref )
    const key          = LOCAL_PATH_PREFIX + key_from_ref

    log1(this.name, "sync:", this.name, key, overwriteKey, fetchOnce);
    log2(this.name, "[GENS] - ref", this.parentRef);
    log2(this.name, "[GENS] - key", key);

    this.global_store_path = key // ??

    const commitOptions = { root: true } // TODO: move to factory in vuefire
    let ops = {
      init: () => {
        /* This is ANNOTIATION#1, see subscribeNode for more information. */
        // log2(this.name, "[GENS-ops] init", registry.commit, HELIOSRX_INIT_VALUE, { path: this.global_store_path, data }, commitOptions);
        log2(this.name, '[OPS:INIT]', this.global_store_path, registry.state)

        let data = {}

        /* Check if there is existing data, if yes it means sync_individual already synced data, which we should keep. */
        let existing_data = walkGetObjectSave( registry.state, this.global_store_path )
        if ( Object.keys(existing_data).length > 0 ) {
          log2(this.name, "[OPS:INIT] existing_data", existing_data);
          data = existing_data;
        }

        log2(this.name, "[OPS:INIT] data", log_stringify(data));
        registry.commit(HELIOSRX_INIT_VALUE, { path: this.global_store_path, data }, commitOptions)
        return { target: data }
      },
      add: (target, newId, data) => {
        log2(this.name, '[OPS:ADD]', target, newId, data, log_stringify(data))
        registry.commit(HELIOSRX_ARRAY_ADD, { target, newId, data }, commitOptions)
      },
      remove: (target, oldId) => {

        let deleted_item = target[ oldId ];

        // Check if this data is still needed by another query
        let synced_queries = this._match_all_existing_synced_queries( this.path )

        log4(this.name, '[OPS:REMOVE]', target, oldId)
        log4(this.name, "entry_name", this.path )
        log4(this.name, "deleted_item", deleted_item )
        log4(this.name, "_match_existing_synced_nodes", synced_queries )

        for ( let idx in synced_queries ) {
          let query = synced_queries[idx].query

          if ( this._itemMatchesQuery( query, deleted_item ) ) {
            log4(this.name, "ITEM STILL IN USE", oldId, deleted_item)
            return // Cancel deletion of entry
          }
        }

        registry.commit(HELIOSRX_ARRAY_REMOVE, { target, oldId }, commitOptions)
        // return [ target[ oldId ] ]
      },
      set: (target, currentId, data) => {
        log2(this.name, '[OPS:SET]', target, currentId, data)
        registry.commit(HELIOSRX_ARRAY_SET, { target, currentId, data }, commitOptions)
      },
      once: (target, data, exists) => {
        log2("[OPS:ONCE]", data, exists)
      }
      // set_sync: (target, path, value ) => {
      //   registry.commit(HELIOSRX_SET_SYNC_STATE, { target, path, value }, commitOptions)
      // }
    }

    if ( fetchOnce ) {
      ops = {
        init: () => {
          log3(this.name, '[OPS:INIT] (fetch)', key)
          let data = {}
          return { target: data }
        },
        once: (target, data, exists) => {
          log3(this.name, "[OPS:ONCE] (fetch)", data, exists)
        }
      }
    }

    /* Join custom ops and regular ops together */
    Object.keys(customOps).forEach(op => {
      ops[ op ] = joint([ ops[ op ], customOps[ op ] ]);
    });

    log2(this.name, "[GENS] - ops", ops);
    log2(this.name, "[GENS] - payload", { key, ref, ops, bindAsArray: true });

    return fetchOnce
      ? this._fetch_rtdb({ key, ref, ops, bindAsArray: true })
      : this._bind_rtdb({ key, ref, ops, bindAsArray: true })
  },

  // ---------------------------------------------------------------------------
  _itemMatchesQuery(query, item) {
    console.log("[itemMatchesQuery]", query, item)
    // TODO: Implement this function
    return true;
  },

  // ---------------------------------------------------------------------------
  _create_context() {
    return {
      registry: registry,
      store: this
    }
  },

  // ---------------------------------------------------------------------------
  _match_all_existing_synced_queries( requested_path, only_active = true ) {
    // INFO: Returns all nodes that

    if ( requested_path.includes('#') ) {
      requested_path = requested_path.split('#').shift()
    }

    let match_list = [];
    for ( var existing_path in registry.state.sync ) {

      let existing_path_without_query = existing_path.split('#').shift()
      if ( requested_path.startsWith( existing_path_without_query ) ) {

        let existing_query = registry.state.sync[ existing_path ];
        if ( !( only_active && (
            existing_query.status === 'Ready' ||
            existing_query.status === 'Loading' ) ) ) {
          continue;
        }

        match_list.push({
          path: existing_path,
          path_without_query: existing_path_without_query,
          ...existing_query
        })
      }
    }

    return match_list;
  },

  // ---------------------------------------------------------------------------
  _match_existing_synced_nodes( requested_path,
    subnodes_can_match_lists = false) {

    // INFO: This functions is not meant to match list paths, when requesting a
    //       child node (e.g. /test/123 wont match for existing node /test/{id}).
    //       Instead this case is covered by the GenericModel-Cache
    //       and GenercList-Cache.

    /* Remove hash key, since subscribeList has a wider scope then subscribeQuery
     * ( e.g. /test/{id}#---2-- should therefor match /test/{id})
     *
     * Example:
     * existing_path  = /goal/BWpG75DcRs-kqVPPdRbxzg/meta#hashkey
     * requested_path = /goal/BWpG75DcRs-kqVPPdRbxzg/meta/commitment_meta/{id}
     */

    if ( requested_path.includes('#') ) {
      requested_path = requested_path.split('#').shift()
    }
    for ( var existing_path in registry.state.sync ) {
      // if ( requested_path === existing_path ) {
      //   /* This is fine, just means we found the same node */
      //   continue
      // }

      let existing_path_unmodified = existing_path

      // Check if path is covered by query cache (e.g. id > limit)
      if ( existing_path.includes('#') ) {
        let existing_path_without_query = existing_path.split('#').shift()
        if ( requested_path.startsWith( existing_path_without_query ) ) {
          console.warn("You're trying to sync a path that has already been synced by a query. This is not supported.",
            "requested_path", requested_path,
            "existing_path", existing_path);
        }
      }

      if ( subnodes_can_match_lists && existing_path.includes('{id}') ) {
        existing_path = existing_path.replace('{id}', '')
        // TODO: Does not work for suffixed stores
        // e.g. syncing: /goal/{id}/meta
        //      lookup:  /goal/18479723/meta/abc
      }

      if ( requested_path.startsWith( existing_path ) ) {
        if ( registry.state.sync[ existing_path_unmodified ].status === 'Ready' ||
             registry.state.sync[ existing_path_unmodified ].status === 'Loading' ) {
          log1(this.name, "Found node of higher hierarchy that is already syncing:",
            existing_path, "vs.", requested_path);
          return existing_path_unmodified
        }
      }
    }
    return false;
  },

  // ---------------------------------------------------------------------------
  _get_sync_state( path  ) {
    return (registry.state.sync[ path ] || {}).status || null
  },

  // ---------------------------------------------------------------------------
  getList( idList, { noReactiveGetter = false } = {} ) {
    log1(this.name, "getList", idList || '*');
    return this.subscribeList( idList, {
      noSync: true,
      createModelFromExistingCache: true,
      noReactiveGetter
    });
  },

  // ---------------------------------------------------------------------------
  getNode( id, { noReactiveGetter = false } = {} ) {
    log1(this.name, "getNode", id);
    if ( !id ) {
      throw new Error('getNode: got invalid id: ' + id )
    }
    return this.subscribeNode( id, {
      noSync: true,
      createModelFromExistingCache: true,
      noReactiveGetter
    })
  },

  /* --------------------------------------------------------- subscribe list */
  subscribeList(idList = [], {
    noSync = false,
    noReactiveGetter = false,
    createModelFromExistingCache = false,
    queryParams = null
  } = {}) {
    // INFO: Different subscribeQuery's or mixing subscribeList with subscribeQuery
    //       on the same node is currently not allowed!!

    // TODO: Cache instance somewhere
    // TODO: Save idlist internally! and call subscribeNode for each item - but still return a GenericList

    let customRef = null;
    let queryHash = '';
    let entry_name = this.path;

    if ( queryParams ) {
      customRef  = this.buildQueryRef( queryParams )
      queryHash  = this.queryHash( queryParams );
      entry_name = entry_name + '#' + queryHash;

      log0(this.name, 'QUERYHASH:' + entry_name, "Using query hash in entry_name", entry_name);
    }

    log1(this.name, "subscribeList", entry_name);
    if ( _resultListCache.get(entry_name) ) {
      log1(this.name, "subscribeList - returning list cache");
      return _resultListCache.get(entry_name);
    }

    let registry_entry = registry.getters.get_registry_entry( entry_name );
    // TODO: Check if data is in 'res'

    if ( registry_entry ) {
      log1(this.name, "subscribeList - WARN - found registry entry, but no local cache!");
    }

    /*
    if ( registry_entry ) {
      if ( registry_entry.status === 'Loading' ) {
        return factory.make_reactive_list( this.modelDefinition, null );
      }
      if ( registry_entry.status === 'Ready' ) {
        return factory.make_reactive_list( this.modelDefinition, this.getData(), this._create_context() );
      }
    }*/

    /* Check if parent path exists */
    const existing_path = this._match_existing_synced_nodes( entry_name, true )

    if ( existing_path ) {
      if ( createModelFromExistingCache ) {
        /* Maybe we don't have an instance in the cache, but still the data is
         * already here. We can use the data to create a model */

        let existing_data = this.getData(); // Should automatically return the correct data node
        log1(this.name, "Found node in existing synced data making list model from existing data", existing_data);

        // TODO: This model is not reactive for some reason

        let list = factory.make_reactive_list(
          this.modelDefinition,
          existing_data,
          this._create_context(),
          noReactiveGetter );

        /* This promise will get resolved as soon as everything is loaded */
        list.$promise = defer() // new Deferer()

        let sync_state = this._get_sync_state( existing_path  );
        log1(this.name, "checking sync state - is data already fully synced?", sync_state );
        if ( sync_state === 'Ready' ) {
          list.$promise.resolve(true);
        }

        log4(this.name, "[Watcher] Registering Watcher")
        let unwatch = registry.watch(
          (state) => {
            log4(this.name, "[Watcher]  -- asking for value")
            // ONLY FOR TESTING:
            // log4(this.name, "[Watcher]  -- existing_data", existing_data)
            // log4(this.name, "[Watcher]  -- reference", state.res.goal["BWpG75DcRs-kqVPPdRbxzg"].meta.commitment_meta)
            // log4(this.name, "[Watcher]  -- this.getData()", this.getData())
            return this.getData(null, true) // should be safe, when unsyncing data of a higher hierachy node
          },
          (new_value, old_value) => {
            log4(this.name, "[Watcher]  -- watcher triggered", new_value, old_value)

            if ( new_value === undefined || new_value === null ) {
              /* This means the list was deleted */
              list.$id_list.forEach(old_id => {
                log4(this.name, "[Watcher]  -- ELIMINATIING LIST", old_id)
                list._rem_child( old_id );
              })
              list.$numReady = false;
              list.$readyAll = false;
              list.$readySome = false;
              // list.$deleted = true;
              list.$promise.resolve(true);
              return
            }

            let ids_new = Object.keys( new_value )
            let ids_old_via_watcher = old_value ? Object.keys( old_value ) : []
            let ids_old = list.$id_list;

            if ( ids_new.toString() === ids_old_via_watcher.toString() ) {
              log4(this.name, "[Watcher] Watcher values are the same? WHY? ", ids_new, ids_old_via_watcher);
            }

            let diff = arrayDiffTwoWay( ids_new, ids_old );
            log4(this.name, "[Watcher] DIFF", diff, ids_new, ids_old);
            diff.removed.forEach(id => {
              log4(this.name, "[Watcher]  -- REMOVED", id)
              list._rem_child( id );
              list.$numReady--;
            })
            diff.added.forEach(new_id => {
              log4(this.name, "[Watcher]  -- ADDED", new_id)

              /* Check instance cache */
              let child_entry_name = entry_name.split('#').shift().replace(/\{id\}/g, new_id)
              if ( _resultInstanceCache.has(child_entry_name) ) {
                console.warn("A new item was added, but there already exists a model instance in the cache for this item. This means the subscription management failed.");
              }
              // todo: also check list cache?

              let data_reactive = this.getData( new_id );
              let item = factory.make_reactive_model(
                   this.modelDefinition,
                   data_reactive,
                   this._create_context(),
                   false,
                   noReactiveGetter )

              item.$id = new_id;
              list._add_child( new_id, item );
              list.$numReady++;

              _resultInstanceCache.set(child_entry_name, item) // ?
            })
            list.$promise.resolve(true);
          }
        )

        /* Save unwatch callback in generic list */
        // this.list_watchers.push( unwatch );
        list._unwatch = unwatch;

        _resultListCache.set(entry_name, list)
        return list;
      } else {
        // TODO: This warning should also show, when using subscribeList to return a cached node
        console.warn("You're trying to sync data, that is already synced by a node higher up in the hierarchy. This will result in undefined behaviour. Try using getList() or getNode() instead! Sync path:", entry_name);
      }
    }

    /* todo: remove if this never happens */
    if ( this._match_existing_synced_nodes( entry_name ) === entry_name ) {
      // This will happen, when loading from persistent state
      console.log(">>>", entry_name, _resultListCache, _resultInstanceCache);
      throw new Error('Exact path found, but no cache hit. This should never happen')
    }

    if (noSync) {
      log1(this.name, "subscribeList - No Sync, returning");
      console.warn("You're trying to fetch data at " + entry_name + " that has not been synced yet.");
      return null;
    }

    log0(this.name, null, "*new* subscribeList", entry_name);

    // TODO: Move to sync?
    registry_entry = {
      query: queryParams,
      status: 'Loading',
    };
    registry.commit('ADD_ENTRY', { name: entry_name, data: registry_entry })
    // TODO: registry.add_entry( registry_entry)

    let result = factory.make_reactive_list( this.modelDefinition, null, this._create_context() );
    _resultListCache.set(entry_name, result)
    result.$promise = defer()

    log1(this.name, "subscribeList - Created reactive list, made registry entry, started sync request for", registry_entry, result);
    const customOps = {
      add: (target, newId, data) => {
        registry.commit('SET_ENTRY_STATUS', { name: entry_name, value: 'Ready' })
        log1(this.name, "subscribeList:add - Child ready", this.name, entry_name, newId );

        let child_entry_name = entry_name.split('#').shift().replace(/\{id\}/g, newId)
        if ( _resultInstanceCache.has(child_entry_name) ) {
          log1(this.name, "subscribeList:add - Reactive model already exists in instance cache")
        }

        // INFO: Data was not updated here with item._update_data() -> Why did it work?

        // INFO: There is no need to theck _resultListCache, because we will only
        //       get to this point, if there was not cache hit, meaning it would
        //       be the same as 'result'. However checking result.items[ id ]
        //       makes sense.

        if ( newId in result.items ) {
          console.warn("An existing item was added twice. This means the subscription management failed.");
        }

        let item = _resultInstanceCache.has(child_entry_name)
                 ? _resultInstanceCache.get(child_entry_name)
                 : factory.make_reactive_model(
                      this.modelDefinition,
                      data,
                      this._create_context(),
                      false,
                      noReactiveGetter )

        item.$id = newId;
        result._add_child( newId, item );

        if ( _resultInstanceCache.has(child_entry_name) ) {
          /* Update item */
          log1("subscribeList:add - Updating existing item (previously synced with subscribeNode) with", data )
          item._update_data( data )

          /* It is possible, that the node was already synced and is now waiting for results (see ANNOTATION#1).
             This means, subscribeList is now responsible */

          /* This will not happen! If a sub-node is already synced via sync_individual, child_added for this node
             will NOT be called. */

          /*
          item.$ready = true;
          registry.commit('SET_ENTRY_STATUS', { name: child_entry_name, value: 'Ready' })
          item.$promise.resolve()
          */

          // TODO: unsync individual node? sync() takes care of syncing now! Do we need to remove sync ops?
        } else {
          /* Also update instance cache! */
          _resultInstanceCache.set(child_entry_name, item)
        }
      },
      init: () => {
        log1(this.name, "subscribeList:init")
        return {}
      },
      remove: (target, oldId) => {
        log4(this.name, "subscribeList:remove", oldId)
        result._rem_child( oldId );
      },
      set: (target, currentId, data) => {
        log1(this.name, "subscribeList:set", currentId, data)

        /* Not 100% clear why we need to update here -
           for some reason dependencies are not triggered when
           HELIOSRX_ARRAY_SET is fired.
           */
        /* if ( currentId in this._resultInstanceCache ) {

          let item = this._resultInstanceCache[ currentId ]
          let data_reactive = this.getData( currentId );
          log1(this.name, "subscribeList:set [A] - updating model", data_reactive)
          item._update_data( data_reactive, this.modelDefinition.schema.fields )

        } else */
        if ( _resultListCache.get(entry_name)
          && currentId in _resultListCache.get(entry_name).items ) {

          let item = _resultListCache.get(entry_name).items[ currentId ]

          let data_reactive = this.getData( currentId );
          /* BUG: At this point data_reactive is outdated ! */
          item._update_data( data_reactive, this.modelDefinition.schema.fields )
          log1(this.name, "subscribeList:set [B] - updating model", data_reactive)

          /*
          log1(this.name, "subscribeList:set [B] - updating model", data)
          item._update_data( data, this.modelDefinition.schema.fields )
          */

        } else {
          log1(this.name, "subscribeList:set - WARNING - not found in cache!", currentId, _resultListCache.get(entry_name))
        }
      },
    }

    this.sync_list({ customOps, customRef }).then(() => {
      /* This promise is resolved when data is first fetched */
      result.$readyAll = true;
      result.$promise.resolve(true);
    }).catch(e => {

      if ( e.code === 'PERMISSION_DENIED' ) {

        console.warn(e.message)
        console.log("======================================")
        console.log(`PERMISSION_DENIED [${this.name}.subscribeList()]`)
        console.log("queryParams:", queryParams)
        console.log("======================================")

        result.$readyAll = true;
        result.$readySome = true;
        result.$noaccess = true;

        /* TODO ? -> probably not
        result.$id_list.forEach(old_id => {
          registry.commit('SET_ENTRY_STATUS', { name: entry_name_child, value: 'NoAccess' })
          let data_reactive = this.getData( id );
          data_reactive[ '.noaccess' ] = true;
          result._update_data( data_reactive, this.modelDefinition.schema.fields )
        })
        */

        result.$promise.reject(e);

      } else {
        throw e;
      }
    });

    return result;
  },

  /* --------------------------------------------------------- subscribe node */
  // noSync = Return from cache
  subscribeNode( id, {
    noSync = false,
    noReactiveGetter = false,
    createModelFromExistingCache = false
  } = {} ) {

    if ( !id ) {
      throw new Error('subscribeNode: got invalid id: ')
    }

    // TODO: This might now always yield the expected result, when defined is used
    // TODO: Figure out if list is loading or item

    /* 1. Check if data already exists */
    let entry_name_child = this._previewPath( id ); // HACK
    let entry_name_list = this.path;

    log1(this.name, "subscribeNode", entry_name_child);

    /* Check if item already exists in list cache. */
    if ( _resultListCache.get(entry_name_list) ) {
      if ( id in _resultListCache.get(entry_name_list).items ) {
        log1(this.name, "subscribeNode - returning from list cache");
        return _resultListCache.get(entry_name_list).items[ id ];
      }
    }

    if ( _resultInstanceCache.has(entry_name_child) ) {
      log1(this.name, "subscribeNode - returning from instance cache");
      return _resultInstanceCache.get(entry_name_child);
    }

    // TODO: This does not check if the parent path exists! It checks if this
    //       particular child is already synced, which can happen if subscribeNode
    //       is triggered while subscribeList is still waiting for OPS:ADD

    if ( this._match_existing_synced_nodes( entry_name_list ) ) {
      log0(this.name, "======================================= (FIXME)",
        { 'entry_name_child': entry_name_child },
        { 'entry_name_list':  entry_name_list },
        { 'has:node':         _resultInstanceCache.has(entry_name_child) },
        { 'get:list':         _resultInstanceCache.get(entry_name_list) }
      );

      // TODO: For some reason this also get's called, when an instance should
      //       already be in the instance cache

      // In this case we could do the following:
      // 1. check if list is "loading"
      // 2. create a GenericModel that is not $ready
      // 3. check if results are already at path
      // 4. if not, call OPS:INIT
      // 5. return generic model and write to instance cache
      // *6. when data is ready in subscribe list, get model from instance cache
      // *7. set model to Ready
      // *8. set data with commit()
    }

    /* Check if parent path exists */
    if ( this._match_existing_synced_nodes( entry_name_child ) ) {
      if ( createModelFromExistingCache ) {
        let existing_data = this.getData( id ); // Should automatically return the correct data node
        log1(this.name, "Found node in existing synced data making model from existing data", existing_data);

        let model = factory.make_reactive_model(
          this.modelDefinition,
          existing_data,
          this._create_context(),
          false,
          noReactiveGetter );

        model.$id = id;
        model.$ready = true;
        // model._update_data( existing_data, this.modelDefinition.schema.fields )

        _resultInstanceCache.set( entry_name_child, model )
        log1(this.name, "made model", model);
        return model;

      } else {
        console.warn("You're trying to sync data, that is already synced by a node higher up in the hierarchy. This will result in undefined behaviour. Try using getNode() instead! Sync path:", entry_name_child);
      }
    }

    /* todo: remove if this never happens */
    if ( this._match_existing_synced_nodes( entry_name_child ) === entry_name_child ) {
      // This will happen, when loading from persistent state
      console.log(">>>", entry_name_child, _resultListCache, _resultInstanceCache);
      throw new Error('Exact path found, but no cache hit. This should never happen')
    }

    if (noSync) {
      //console.warn("You're trying to fetch at " + entry_name_child + " that has not been synced yet.");
      return null;
    }

    log0(this.name, id, "*new* subscribeNode", entry_name_child);

    /* 2. Create empty model that is updated later when data is ready */
    let load_result = factory.make_reactive_model(
      this.modelDefinition,
      null,
      this._create_context(),
      false,
      noReactiveGetter );

    load_result.$id = id
    load_result.$promise = defer()
    _resultInstanceCache.set( entry_name_child, load_result )

    /* 3. Create registry entry */
    let registry_entry = {
      id: id,
      status: 'Loading',
    };
    registry.commit('ADD_ENTRY', { name: entry_name_child, data: registry_entry })
    // TODO: registry.add_entry( registry_entry)
    log1(this.name, "subscribeNode - Made registry entry and started at", entry_name_child, registry_entry);

    const customOps = {
      init: (data) => {
        log1(this.name, "subscribeNode:init", data)
        return {}
      },

      set: (target, data) => {
        log1(this.name, "subscribeNode:set", target, data)
      },
    }

    /* 4. Start syncing */
    this.sync_individual( id, { customOps } ).then( (data) => {

      let data_reactive = this.getData( id );
      log1(this.name, "subscribeNode - data ready", entry_name_child, data, data_reactive);

      if ( data_reactive === undefined ) {
        /* This case will not occur anymore
        /* In some cases, when a node is subscribing and while waiting for the results the list,
           that contains the node is synced as well, it can happen that the list is resetted
           in $registry.state.res (See. ANNOTIATION#1 ) */
        console.warn(this.name, "subscribeNode - subscribeList took over, while waiting for sync_individual. subscribeList will handle instance now.")

        /* We need to wait now, until the list is synced, so we can return reactive data. This
           is (hopefully) handled by subscribe List, when picking up 'load_result' from the instance cache */

        /* ...but this only works if the node really exists in the list */

        return

        /* if ( _resultInstanceCache.has(child_entry_name) ) {
          return  _resultInstanceCache.get(child_entry_name)
        } else {
          throw new Error('THIS IS BAD');
        } */
      }

      load_result._update_data( data_reactive, this.modelDefinition.schema.fields )
      load_result.$ready = true;
      load_result.$noaccess = false;

      // INFO: this is only called once, maybe thats why we have problem here

      // Vue.observable( registry.state.res.goal[ id ].meta )
      // load_result.$state = registry.state.res.goal[ id ].meta
      // Vue.observable( load_result.$state )

      registry.commit('SET_ENTRY_STATUS', { name: entry_name_child, value: 'Ready' })
      // TODO: registry.set_entry_status( entry_name, 'Ready' )

      log1(this.name, "subscribeNode - created reactive model", load_result);
      load_result.$promise.resolve(true);
    }).catch(e => {

      if ( e.code === 'PERMISSION_DENIED' ) {

        // !!! TODO: Also implement for fetchNode, fetchList !!!

        console.warn(e.message)
        console.log("======================================")
        console.log(`PERMISSION_DENIED [${this.name}.subscribeNode( ${id} )]`)
        // Query parameter for *List
        console.log("======================================")

        registry.commit('SET_ENTRY_STATUS', { name: entry_name_child, value: 'NoAccess' })

        let data_reactive = this.getData( id ); // maybe we should remove everything...
        data_reactive[ '.noaccess' ] = true;
        load_result._update_data( data_reactive, this.modelDefinition.schema.fields )
        load_result.$ready = true;
        load_result.$noaccess = true;

        load_result.$promise.reject(e);

      } else {
        throw e;
      }
    })

    return load_result
  },

  // ---------------------------------------------------------------------------
  buildQueryRef({
    key = undefined,
    value = undefined,
    limit = undefined,
    startAt = undefined,
    endAt = undefined,
  }) {

    let customRef = this.parentRef
    if ( key === '*' ) {
      // Don't forget to add indexOn( [ '.value' ] )
      customRef = customRef.orderByValue()
    } else if ( key === undefined ) {
      // No index needed. Key is always indexed
      customRef = customRef.orderByKey()
    } else {
      // Don't forget to add indexOn( [ key ] )
      customRef = customRef.orderByChild(key)
    }
    if ( value !== undefined ) {
      customRef = customRef.equalTo(value)
    }
    if ( startAt !== undefined ) {
      customRef = customRef.startAt(startAt)
    }
    if ( endAt !== undefined ) {
      customRef = customRef.endAt(endAt)
    }
    if ( limit !== undefined ) {
      if ( limit > 0 ) {
        customRef = customRef.limitToFirst(limit)
      } else {
        customRef = customRef.limitToLast(-limit)
      }
    }

    return customRef
  },

  // ---------------------------------------------------------------------------
  queryHash( query ) {
    let queryHash = [ query.key, query.value, query.limit, query.startAt, query.endAt ].join('_')
    return queryHash;
  },

  // ---------------------------------------------------------------------------
  /*
  query:
    - key = key, '*' or undefined
    - value
    - limit
    - startAt
    - endAt
  options:
    - noSync = false
    - noReactiveGetter = false
    - createModelFromExistingCache = false
    @example
      this.$models.example.subscribeQuery({
        key: 'createdAt',
        startAt: 123456789,
        limit: 100
      });
  */
  subscribeQuery(query, options = {}) {
    // TODO: alternative syntax subscribeQuery({ key: value }, 100)
    return this.subscribeList( null, { ...options, queryParams: query } )
  },

  // ---------------------------------------------------------------------------
  fetchNode(id, { noReactiveGetter = false } = {}) {
    // TODO: in state schreiben?
    // TODO: Simplify by using ref directly
    // TODO: ['.exists'] wird nicht gesetzt! -> Actually not possible, once('value') won't trigger

    /* 2. Create empty model that is updated later when data is ready */
    let load_result = factory.make_reactive_model(
      this.modelDefinition,
      null,
      this._create_context(),
      false,
      noReactiveGetter );

    load_result.$id = id
    load_result.$promise = defer()

    /* 3. Create registry entry */
    /*
    let registry_entry = {
      name: entry_name_child,
      status: 'Loading',
      fetch: true
    };
    registry.commit('ADD_ENTRY', {...})
    */

    const customOps = {
      init: () => {
        log3(this.name, "fetchNode:init")
        return {}
      },

      set: (target, data) => {
        log3(this.name, "fetchNode:set", target, data)
      },
    }

    this.fetch_individual( id, { customOps } ).then( data => {
      log3(this.name, "fetchNode - data ready", data);
      // TODO: make data reactive
      load_result._update_data( data, this.modelDefinition.schema.fields )
      load_result.$ready = true;
      /*
      registry_entry.status = 'Ready'
      registry.commit('SET_ENTRY_STATUS', registry_entry)
      */
      load_result.$promise.resolve(true);
    });

    return load_result
  },

  // ---------------------------------------------------------------------------
  fetchList({
    noReactiveGetter = false,
    // customRef = null,
    queryParams = null,
  } = {}) {
    // TODO: Simplify by using ref directly

    let customRef = queryParams ? this.buildQueryRef( queryParams ) : null;

    /* 1. Create empty model list */
    let list = factory.make_reactive_list(
      this.modelDefinition,
      null,
      this._create_context(),
      noReactiveGetter );

    /* This promise will get resolved as soon as everything is loaded */
    list.$promise = defer()

    const customOps = {
      init: () => {
        log3(this.name, "fetchList:init")
        return {}
      },
      once: (target, data, exists) => {
        log3(this.name, "fetchList:once", data)
      }
    }

    /* 2. Start fetching and update list when data is ready */
    this.fetch_list({ customOps, customRef }).then(data => {
      log3(this.name, "fetchList:resolve", data)

      let id_list = Object.keys( data || [] )

      id_list.forEach(new_id => {

        let item_data = data[ new_id ]
        let item = factory.make_reactive_model(
             this.modelDefinition,
             item_data,
             this._create_context(),
             false,
             noReactiveGetter )

        item.$id = new_id;

        list._add_child( new_id, item );
        list.$numReady++;
      })

      list.$readyAll = true;
      list.$promise.resolve(true);
    });

    return list;
  },

  // ---------------------------------------------------------------------------
  fetchQuery(query, options) {
    // let customRef = this.buildQueryRef(query)
    return this.fetchList({ ...options, queryParams: query })
  },

  /* ------------------------------------------------------------------------ */
  getRegistryState() {
    return registry.state;
  },

  /* ------------------------------------------------------------------------ */
  getAllSyncedPaths() {
    let list = {};
    Object.keys( registry.state.sync ).forEach(path => {
      list[ path ] = registry.state.sync[ path ].status;
    })
    return list;
  },

  // ---------------------------------------------------------------------------
  /* Syntax:
   * getData() -> get reference to list of data
   * getData(child_id) -> get reference to an item in the list
   *
   * TODO: Move redudant?
   *
   * */
  getData(id = null, safe = false) {
    const USE_NESTED_DATA = true;
    let item_path = '';
    if ( this.isSuffixed || id ) {
      if ( !id ) {
        throw new Error('getData: id required for suffixed stores')
      }
      item_path = this.path.replace(/\{id\}/g, id)
    } else {
      item_path = this.path.split('{id}').shift()
    }

    let data_path = LOCAL_PATH_PREFIX + item_path.split('/').filter(p => p).join('.');

    if ( !registry.state.initialized ) {
      return null
    }

    // console.log("[GENS] getData data_path", data_path);
    if ( USE_NESTED_DATA ) {
      return safe
        ? walkGetObjectSave( registry.state, data_path )
        : walkGet( registry.state, data_path )
    } else {
      return registry.state.res[ data_path ];
    }
  },

  // ---------------------------------------------------------------------------
  /* INFO: Currently not use, there is better methods
  exists(id = null) {
    // Only for the following use case:
    // - Data has been synced at /path/*
    // - We want to know if /path/{id}/bla/bla exists
    // Example:
    // $models.timeslotWeekdayPref.with({ timeslotCollectionId: tscId }).exists()

    let existing_path = id
        ? this._match_existing_synced_nodes( this._previewPath( id ), true )
        : this._match_existing_synced_nodes( this.path, true )

    // This does not work in all cases!
    if ( existing_path ) {
      return !!this.getData(id)
    }

    return false;
  },
  */

  // ---------------------------------------------------------------------------

  reset_global_instance_cache() {
    try {
      _resultInstanceCache.forEach(instance => {
        instance.reset()
      });
      _resultListCache.forEach(instance => {
        instance.reset()
      });
    } catch ( e ) {
      console.warn("Reseting instances failed", e)
    }
    _resultInstanceCache.clear()
    _resultListCache.clear()
  },

  // ---------------------------------------------------------------------------

  // hotUpdate() {
    // TODO
  // },

  // ---------------------------------------------------------------------------
  /*
  syncNode(id) {
    // Changes are directly written to the database
    throw new Error('NOT_IMPLEMENTED')
  },

  // ---------------------------------------------------------------------------
  syncList() {
    throw new Error('NOT_IMPLEMENTED')
  },
  */

  // ---------------------------------------------------------------------------

  // DEPRECATED: See "getData"
  /*
  getters () {
    // Getter --> Resources -> newIndex

    // Generic Store Getter:
    // - Nach sortidx sortieren
    // - moment objekte konvertieren
    // - readiness
    // - item by all known id's --> get_task_by_goal_id_and_task_id
    // - make iterable (!)

    // Ressource Getter: (Besser alles als ressource getter, weil dann klar ist ob Ressource geladen ist)
    // - "Deleted" filtern
    // - Object-Array auf arrays mappen -> komplett raus
    // - "Joins"
    // - index erstellen
    // - readiness

    return {
      by_ids(id) {
        return walkSet( this.global_store_path );
      },
      all() {
        // const key = _infer_local_path_from_ref( ref )

        return walkSet( this.global_store_path );

        // 1. access data in through a generic getter
        // 2. sort by sortidx
        // 3. timestamps replace with moment objects (moment.fromRealtimeDB)
        // 4. make iterable
        // 5. include readiness -> return promise ?

        return Object.keys(task.checklist)
          .map((checklist_item_id) => {
            return { id: checklist_item_id, ...task.checklist[checklist_item_id] };
          })
          .sort(util.sorter.by_sortidx);
      }
    }
  },
  */
}

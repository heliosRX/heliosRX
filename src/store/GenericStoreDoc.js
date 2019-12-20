export const UIDMethod = {
  CUSTOM:          1,
  SLUGID:          2, // R0qHTeS8TyWfV2_thfFn5w (Default)
  PUSHID:          3, // -JhLeOlGIEjaIOFHR0xd
  TIMESTAMP:       4, // 1548573128294 (unix?)
  LOCAL_TIMESTAMP: 5, // 1553700866
  DATE:            6, // DDMMYYYY / 01032019
  OTHER_USER_ID:   7,
  MY_USER_ID:      8, // fOjaiwtyxoQdOGe6Z2zULK18ggv2
  ARRAY:           9, // 0,1,2,3,...
  EMAIL:          10, // test@test.de
}

export const DeleteMode = {
  SOFT: 0,
  HARD: 1
}

/**
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
   * // --- Creating a generic store:
   *
   * // Normal list:
   * challenge = new GenericStore('[DB1]:/challenge/*', ChallengeTypeDefinition, { custom_key: timestamp });
   *
   * // Nested list:
   * task_session_list = new GenericStore(
   *  '/goal/{goalId}/user_list/{uid}/task_session_list/{taskId}/*',
   *  TaskSessionTypeDefinition
   * )
   *
   * // -- Defining the path
   * let task_session_list_defined = task_session_list.with({
   *   goalId: 'KrZPg8N6THOisFz_T992Zg',
   *   uid: 'l1X8FPc7YtbftlC31frciInV3PU2'
   * })
   *
   * // --- Writing data:
   *
   * // Add items
   * challenge.add({ title: 'Name' })
   * challenge.add(overwrite_data)
   *
   * // Update items
   * challenge.update(id, { key: value })
   * challenge.update(id, [{ key1: value1 }, { key2: value2 }, ...])
   *
   * // Reorder items
   * challenge.reorder(...)
   *
   * // Remove items
   * challenge.remove(id)
   * challenge.remove(id, true) // Soft delete
   *
   * // --- Retrieving data:
   *
   * // Lists
   * challenge.subscribeList()       // Subscribe to list at path and listen for changes
   * challenge.subscribeQuery({...}) // Subscribe using a query
   * challenge.fetchList()           // Get GenericLists from Cache
   * challenge.getList()             // Fetch GenericLists once
   *
   * // Nodes
   * challenge.subscribeNode(id) // Subscribe to node at path and listen for changes
   * challenge.getNode(id)       // Get GenericModel from Cache
   * challenge.fetchNode(id)     // Fetch GenericModel once
   *
   * let syncId1 = task_session_list.sync(target, { taskId: '123' })
   * let syncId2 = task_session_list.sync_add(target, { taskId: '234' })
   * task_session_list.sync_rem(syncId1)
   *
   * @example <caption>Example: Suffixed paths</caption>
   * goal_meta = new GenericStore('/goal/ * /meta', GoalMetaTypeDefinition)
   * goal_meta.add() // -> creates a new goal at /goal/<newId>/meta
   *
   * @example <caption>Example: Non suffixed paths</caption>
   * goal_deadline_list = new GenericStore('/goal/{goalId}/meta/deadlines/*', GoalMetaTypeDefinition)
   * goal_deadline_list
   *   .with({ goalId: 'KrZPg8N6THOisFz_T992Zg' })
   *   .add({ title: 'My deadline' })
   *
   * @info
   * Sync-Implementation is based on:
   * https://github.com/vuejs/vuefire/blob/master/packages/vuexfire/src/index.js
   */
  constructor( templatePath, modelDefinition, options = {} ) {
    this.templatePath = templatePath;
  }

  /**
   * _clone -
   */
  _clone() {

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
  generateId() {

  }

  _get_uid() {
  }

  /**
   * @static setDefaultDB - Sets the default DB
   *
   * @param  {type} db description
   */
  static setDefaultDB( db ) {
  }

  /**
   * get _db - Get reference to db (this will allow other then default databases in the future)
   *
   * @return {type}  Firebase.db
   */
  get _db() {
    return this._localDB;
  }

  /**
   * _validateId - Checks if a given id is valid
   *
   * @return {type}    true or false
   */
  _validateId( id ) {
  }

  /**
   * _defineUser - Define user (userId/uid) based on default value
   */
  _defineUser() {
  }

  /**
   * @static get - Returns the default default UserId for all stores
   *
   * @return {type}  description
   */
  static get defaultUserId() { return 'userId'; }

  /* Non static version */
  get defaultUserId() { return 'userId'; }

  /**
   * @static set - Set the default default UserId for all all stores
   *
   * @param  {type} id description
   * @return {type}    description
   */
  static set defaultUserId(id) {
  }

  /**
   * get path - Returns a firestore reference based on the template string
   * Automatically sets user if not defined
   */
  get path() { // TODO: rename this to path and this.path to this.uninterpolatedPath
  }

  /**
   * _previewPath - Generate a path preview for a given it
   *
   * @param  {type} id description
   */
  _previewPath( id ) {
  }

  /**
   * get parentRef - Returns reference to a specific child of the collection
   */
  childRef(id) {
  }

  /**
   * get parentRef - Returns reference to collection that contains all items
   */
  get parentRef() {
    /* get string before {id} */
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
  }

  define( props ) {
  }

  /**
   * @info
   *   store.with({ prop1: 'value' }).add({...}) - store is not mutated
   */
  with( props ) {
  }

  /**
   * get _template_path_field_names - Returns all fields in the template path that need to be defined
   *
   * @return {type}  description
   */
  get _template_path_field_names() {
  }

  /**
   * Resets the template path to it's initial state, without substitutions.
   */
  reset(level = 1) {
  }

  /**
   *
   */
  get _schema_fields() {
  }

  /**
   * get schema_required_fields - Returns all required fields defined in the schema
   *
   * @return {type}  description
   */
  get schema_required_fields() {
  }

  /**
   * get schema_optional_fields - Returns all optional fields defined in the schema
   *
   * @return {type}  description
   */
  get schema_optional_fields() {
  }

  /**
   * get schema_all_fields - Returns all fields that are defined in the schema
   *
   * @return {type}  description
   */
  get schema_all_fields() {
  }

  /**
   * _check_required_fields - Check if all required fields exists according to schema
   *
   * @param  {type} data data to check
   */
  _check_required_fields( data ) {
  }

  /**
   * _check_required_fields - Check if create inputs are present
   *                          Required by user is not the same a required by DB!
   *
   * @param  {type} data data to check
   */
  _check_required_create_arg( data ) {
  }

  /**
   * _validate_schema - Validates against the current schema
   *
   * @param  {type} data      data to validate
   * @param  {type} is_update is the data used for updating and existing item?
   */
  _validate_schema( data, is_update ) {
  }

  /**
   * get subscriptions - Returns subscriptions that were create by this store
   *
   * @return {list} list of subscriptions
   */
  get subscriptions() {
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
  }

  /**
   * _fetch_rtdb - Firebase binding
   *
   * @param {{ key, ref, ops, bindAsArray }} obj - config
   */
  _fetch_rtdb({ key, ref, ops, bindAsArray }) {
  }

  /**
   * _unbind_rtdb - Unbind firebase from location
   *
   * @param  {{ key }} obj description
   */
  _unbind_rtdb({ key }) {
  }

  /**
   * rules - Return custom validation rules for elements
   * See: https://element.eleme.io/#/en-US/component/form#custom-validation-rules
   */
  get rules() {
  }

  /**
   * _infer_local_path_from_ref - Converts a firebase ref into a "walkable" path
   *
   * @param  {type} ref description
   *
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
    return 'path'
  }

  /**
   * unsync - Stop syncing.
   *
   * @param {uuid} id - Id
   * @param {{ clean_up }} obj  description
   * @param {Boolean} obj.clean_up - Clean up?
   */
  unsync( id = null, { clean_up = false } = {} ) {
  }

  /**
   * unsync_all - Stop sycning all subscriptions of this store.
   *
   * @param {{ clean_up }} obj
   * @param {Boolean} obj.clean_up - Clean up?
   */
  unsync_all({ clean_up = false } = {}) {
  }

  /**
   * fetch_individual - fetch an individual item of the collection
   *
   * @param  {uuid} id                            description
   * @param  {{ overwriteKey, customOps }} obj
   * @param  {Boolean} obj.overwriteKey - description
   * @param  {Object} obj.customOps - description
   */
  fetch_individual( id, { overwriteKey = false, customOps = {} } = {} ) {
  }

  /**
   * fetch - fetch all items in this collection
   *
   * @param  {{ overwriteKey, customOps, customRef }} obj - description
   * @param  {Boolean} obj.overwriteKey - description
   * @param  {Object} obj.customOps - description
   * @param  {Object} obj.customRef - null
   */
  fetch_list( { overwriteKey = false, customOps = {}, customRef = null } = {} ) {
  }

  /**
   * sync_individual - sync an individual item of the collection
   *
   * @param  {type} id - id of node
   * @param  {{ overwriteKey, fetchOnce, customOps obj
   * @param  {Boolean} obj.overwriteKey - description
   * @param  {Boolean} obj.fetchOnce - description
   * @param  {Object} obj.customOps - description
   */
  sync_individual( id, { overwriteKey = false, fetchOnce = false, customOps = {} }  = {} ) {
  }

  /**
   * sync - sync entire collection (also track child added, child removed)
   *
   * @param  {{ overwriteKey, fetchOnce, customOps, customRef }} obj
   * @param  {Boolean} obj.overwriteKey  - false
   * @param  {Boolean} obj.fetchOnce - false
   * @param  {Object} obj.customOps - {}
   * @param  {Object} obj.customRef - null
   *
   *  Returns a promise, that will resolve, when all items are ready
   *
   */
  sync_list( { overwriteKey = false, fetchOnce = false, customOps = {}, customRef = null }  = {} ) {
  }

  _create_context() {
  }

  _match_existing_synced_nodes( requested_path, subnodes_can_match_lists = false ) {
    // INFO: This functions is not meant to match list path when requesting a
    //       child node (e.g. /test/123 wont match for existing node /test/{id}).
    //       Instead this case is covered by the GenericModel-Cache
    //       and GenercList-Cache.
  }

  _get_sync_state( path  ) {
  }

  getList( idList, { noReactiveGetter = false } = {} ) {
  }

  getNode( id, { noReactiveGetter = false } = {} ) {
  }

  /**
  *
  */
  subscribeList(idList = [], {
    noSync = false,
    noReactiveGetter = false,
    createModelFromExistingCache = false,
    customRef = null,
    queryHash = null
  } = {}) {
  }

  /**
  *
  * noSync = Return from cache
  */
  subscribeNode( id, {
    noSync = false,
    noReactiveGetter = false,
    createModelFromExistingCache = false
  } = {} ) {
  }

  buildQueryRef({
    key = undefined,
    value = undefined,
    limit = undefined,
    startAt = undefined,
    endAt = undefined,
  }) {
  }

  /**
  *
  * @param {object} query
  * @param {object} query.key = key, '*' or undefined
  * @param {object} query.value
  * @param {object} query.limit
  * @param {object} query.startAt
  * @param {object} query.endAt
  *
  * @param {object} options
  * @param {object} options.noSync = false
  * @param {object} options.noReactiveGetter = false
  * @param {object} options.createModelFromExistingCache = false
  *
  * @example
  * this.$models.example.subscribeQuery({
  *   key: 'createdAt',
  *   startAt: 123456789,
  *   limit: 100
  * });
  */
  subscribeQuery(query, options = {}) {
  }

  fetchNode(id, { noReactiveGetter = false } = {}) {
  }

  fetchList({
    noReactiveGetter = false,
    customRef = null
  } = {}) {
  }

  fetchQuery(query, options) {
  }

  getRegistryState() {
  }

  getAllSyncedPaths() {
  }

  /* Syntax:
   * getData() -> get reference to list of data
   * getData(child_id) -> get reference to an item in the list
   *
   * TODO: Move redudant?
   *
   * */
  getData(id = null, safe = false) {
  }

  exists(id = null) {
  }

  reset_global_instance_cache() {
  }

  /**
  * @example <caption>Add a new item</caption>
  * challenge.add({ title: 'Name' })
  *
  * @returns {Promise} - Promise that returns the new id when resolved
  */
  add( overwrite_data, new_id, options ) {
  }

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
  }

  /**
  *
  * @param {object|array} sortidxList - Batch should be an array or array of objects
  * @param {object} options
  *
  * @example
  * store.reorder([id1, id2, ...])
  * store.reoder([{ id: id1, sortidx: 1 }, { id: id2 sortidx: 2 }, ...])
  *
  * The second version can also be used to pass the entire collection
  * store.reoder(updated_commitment_list)
  */
  reorder(sortidxList, options = {}) {
  }

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
  }

  /**
  * Restores a deleted entry at the data location
  */
  restore( id ) {
  }

  /**
   * copy - Copy data between nodes (same as move, but keeps original
   *        and generates new id)
   * @param {id} id - id of source object
   * @param {object} contextA - props of the source path
   * @param {object} contextB - props of the destination path
   *
   */
  copy(id, contextA, contextB) {
  }

  /**
  * Move data between nodes
  * @param {UUID} id - Id of the object that should be moved
  * @param {object} contextA - props of the source path
  * @param {object} contextB - props of the destination path
  * @param {{ keepOriginal, keepId }} obj - desc
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
  }

  /**
  * transaction - perform transaction on RTDB
  *
  * @example
  *   $models.example.transaction( <childId>, <prop>, <transaction> )
  *   $models.example.transaction( id, 'coins', coins => coins * 2 )
  *   $models.example.transaction( id, 'coins', 'inc', 100 )
  *   $models.example.transaction( id, 'coins', 'inc' ) // defaul: increment by 1
  *
  */
  transaction( id, prop, transaction, value = 1 ) {
  }

  /**
   * new - Create empty model from schema (without calling create function)
   *
   * new + write = new_id + update
   *
   * @return {type}  description
   */
  new() {
  }

  /**
   * new_from_template - Create empty model from create function
   *
   * new_from_template + write = add
   *
   * @return {type}  description
   */
  new_from_template( data = {}, optional_data = null ) {
  }

  /**
   * new_from_template - Create empty model from create function
   *
   * new_from_template + write = add
   */
  new_from_data( data = {}, make_dirty = false ) {
  }

  /**
   * empty - Create empty payload from schema.create()
   *         This method WILL only create an JS-Object, not a GenericModel
   *         In most cases, you want to use new_from_template_instead
   */
  empty( data = {}, optional_data = null ) {
  }

  /**
   * _convert_moment_objects - Convert all moment objects
   *
   */
  _convert_moment_objects( payload ) {
  }
}
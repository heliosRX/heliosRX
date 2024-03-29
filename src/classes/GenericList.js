import { _Vue as Vue } from '../external-deps'
import { add_custom_getters, add_custom_actions } from '../classes/utils'
import { warn, info, INFO_COLLECTION, WARNING_NAME_CONFLICT } from "../util/log"

function sortidx_sorter(a, b) {
  if (a.sortidx < b.sortidx) return -1;
  if (a.sortidx > b.sortidx) return 1;
  // if (a.$state.sortidx < b.$state.sortidx) return -1;
  // if (a.$state.sortidx > b.$state.sortidx) return 1;
  return 0;
}

function make_property_sorter(prop) {
  let sorter = null;
  if ( prop[0] === '-' ) {
    prop = prop.slice(1)
     sorter = (a, b) => {
      if (a[prop] < b[prop]) return 1;
      if (a[prop] > b[prop]) return -1;
      return 0;
    }
  } else {
    sorter = (a, b) => {
      if (a[prop] < b[prop]) return -1;
      if (a[prop] > b[prop]) return 1;
      return 0;
    }
  }
  return sorter;
}

const externalVMStore = new WeakMap(); // Exclude vm from instance, so it can be serialized

// TODO: Always save items as array, but keep index {id to idx} for quick access via id
//       This is rather an exception, since we would normally use getNode instead

export default class GenericList {

  // -----------------------------------------------------------------------------
  constructor( name ) {
    this.items        = {}; // $items?
    this.$readyAll    = false;
    this.$readySome   = false;
    /* This promise will resolve once ALL the data is ready */
    this.$promise     = Promise.resolve();
    this.$numReady    = 0; // TODO
    this.$noaccess    = null;
    this.$numChildren = 0;
    this._store_name  = name;
    this._unwatch     = null;
    // this.$lastUpdated = null;
  }

  // -----------------------------------------------------------------------------
  _clone() {
    // --> this needs more work
    return Object.assign( Object.create( Object.getPrototypeOf(this)), this);
  }

  // -----------------------------------------------------------------------------
  _add_child( id, child ) {
    // TODO: Check if this.items is an array
    this.$readySome = true;
    // this.$lastUpdated = Date.now();
    Vue.set( this.items, id, child )
    this.$numChildren += 1;
    this.items[ id ].$idx = this.$numChildren;
  }

  // -----------------------------------------------------------------------------
  _rem_child( id ) {
    // TODO: Check if this.items is an array
    if ( id in this.items ) {
      this.items[ id ]._on_remove();
    }
    Vue.delete( this.items, id );
    this.$numChildren -= 1;
  }

  // ---------------------------------------------------------------------------
  get $vm() {
    return externalVMStore.get( this )
  }

  // -----------------------------------------------------------------------------
  _decorate_actions( listActions, context ) {
    if ( !listActions ) {
      return
    }

    /*
    context.model = this; // HACK
    for ( let key in listActions ) {
      let action = listActions[ key ];
      if ( Object.prototype.hasOwnProperty.call( this, key ) ) {
        warn(WARNING_NAME_CONFLICT, `Name conflict: list action "${key}" has same name as existing method "${key}" in ${this._store_name}`);
        continue
      }
      Object.defineProperty( this, key, { value: () => action(context) } ) // TODO: bind this?
    }
    */

    const action_context = {
      $instance: this,
      $model: context.model,
      $models: context.models,
    }

    add_custom_actions( action_context, this, listActions, false )
  }

  // -----------------------------------------------------------------------------
  _decorate_getters( listGetters, context ) { // TODO: move to util
    if ( !listGetters ) {
      return
    }

    for ( let key in listGetters ) {
      if ( Object.prototype.hasOwnProperty.call( this, key ) ) {
        warn(WARNING_NAME_CONFLICT, `Name conflict: list getter "${key}" has same name as existing property getter "${key}" in ${this._store_name}`);
        delete listGetters[ key ] // ?
        continue
      }
    }

    /* Embed getter in vue instance */
    const getter_context = [ this, context.model, context.models ]
    let vm = add_custom_getters( getter_context, this, listGetters );
    externalVMStore.set( this, vm )

    // "Self destroy"
  }

  // -----------------------------------------------------------------------------
  getItemByIdx( idx ) {
    for ( let id in this.items ) {
      if ( this.items[ id ].$idx === idx) {
        return this.items[ id ]
      }
    }
    return null;
  }

  // -----------------------------------------------------------------------------
  asArraySorted() {
    // TODO: This should not mutate item!!!
    let new_this = this._clone();
    new_this.items = this.itemsAsArray();
    new_this.items.sort(sortidx_sorter);
    return new_this;

    // let items = this.asArray();
    // return items.sort(sortidx_sorter);
  }

  // -----------------------------------------------------------------------------
  asArraySortedBy(prop) {
    let new_this = this._clone();
    new_this.items = this.itemsAsArray();
    new_this.items.sort(make_property_sorter( prop ));
    return new_this;

    // let items = this.asArray();
    // return items.sort(make_property_sorter( prop ));
  }

  // -----------------------------------------------------------------------------
  asArrayFilteredBy(prop, value) {
    let new_this = this._clone();
    new_this.items = this.itemsAsArray();
    new_this.items = new_this.items.filter((item) => {
      return ( item[ prop ] === value )
    });
    return new_this;

    // let items = this.asArray();
    // return items.filter((item) => {
    //   return ( item.prop === value )
    // });
  }

  // -----------------------------------------------------------------------------
  // Nicht sortiert!!, Why not a getter?
  itemsAsArray() {
    if ( Array.isArray( this.items ) ) {
      return this.items;
    }
    return Object.keys( this.items ).map( id => {
      return this.items[ id ];
    })
  }

  // -----------------------------------------------------------------------------
  get itemsSorted() {
    return this.itemsAsArray().sort(sortidx_sorter);
  }

  // -----------------------------------------------------------------------------
  itemsAsArrayWithoutDeleted( custom_sortidx ) {
    // otherwise no reactivity
    return this.itemsAsArray().filter((item) => {
      return item.deleted === false || item.deleted === undefined
    }).sort( custom_sortidx ? make_property_sorter(custom_sortidx) : sortidx_sorter);
  }

  // -----------------------------------------------------------------------------
  itemsAsArrayOnlyDeleted( custom_sortidx ) {
    return this.itemsAsArray().filter((item) => {
      return item.deleted === true
    }).sort( custom_sortidx ? make_property_sorter(custom_sortidx) : sortidx_sorter);
  }

  // -----------------------------------------------------------------------------
  get $idList() {
    // TODO: Here or static in $models.example?
    return Object.keys( this.items );
  }

  // -----------------------------------------------------------------------------
  reset() {
    if ( this._unwatch ) {
      info(INFO_COLLECTION, "Found local un-watcher in", this._store_name)
      this._unwatch();
    }
  }
}

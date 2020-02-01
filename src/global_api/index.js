import { _models } from '../external-deps'

function check_model( model ) {
  // TODO: These are dev message, hide in production
  if ( typeof model === 'undefined' ) {
    throw new Error('Model does not exists - Did you provide a valid model from $models?')
  }
  // TODO: THIS DOES NOT WORK WITH MINIFICATION !!!
  if ( model.constructor && model.constructor.name !== 'GenericStore' ) {
    throw new Error('Model is not a GenericStore - Did you provide a valid model from $models?');
  }
  if ( !model ) {
    throw new Error('Model is invalid - Did you provide a valid model from $models?');
  }
}

export default {

  /* ------------------------------------------------------------------------ */
  subscribeList( model, ...args ) {
    check_model( model )
    return model.subscribeList(...args);
  },

  /* ------------------------------------------------------------------------ */
  subscribeNode( model, ...args ) {
    /*
    return this.$db.subscribeNode(this.$models.goalMeta, this.goalId );

    Model is not a GenericStore - Did you provide a valid model from $models?
    */
    check_model( model )
    return model.subscribeNode(...args);
  },

  /* ------------------------------------------------------------------------ */
  fetchPage( model, ...args ) {
    check_model( model )
    return model.fetchPage(...args);
  },

  /* ------------------------------------------------------------------------ */
  new( model, ...args ) {
    check_model( model )
    return model.new(...args);
  },

  /* ------------------------------------------------------------------------ */
  newFromTemplate( model, ...args ) {
    check_model( model )
    return model.newFromTemplate(...args);
  },

  /* ------------------------------------------------------------------------ */
  getter( model, getter_name, ...args ) {
    check_model( model )
    return model[getter_name](...args);
  },

  /* ------------------------------------------------------------------------ */
  remove( model, ...args ) {
    check_model( model )
    return model.remove(...args);
  },

  /* ------------------------------------------------------------------------ */
  restore( model, ...args ) {
    check_model( model )
    return model.restore(...args);
  },

  /* ------------------------------------------------------------------------ */
  add( model, ...args ) {
    check_model( model )
    return model.add(...args);
  },

  /* ------------------------------------------------------------------------ */
  update( model, ...args ) {
    check_model( model )
    return model.update(...args);
  },

  /* ------------------------------------------------------------------------ */
  batch() {
    // TODO: implement + docs
    return {
      _writes: [],
      add( list ) {
        this._writes.push( list )
      },
      run() {
        console.log("Batch writing", this._writes);
        this._writes = [];
      }
    }
  },

  /* ------------------------------------------------------------------------ */
  getGlobalSubscriptionList() {
    if ( !_models ) {
      throw new Error('Subscription list can not be generated. Did you install Vue-Loader?')
    }
    let subscriptionList = {}
    Object.keys( _models ).map(store_key => {
      // TODO: maybe return sync state instead of unsubscribe calback
      subscriptionList[ store_key ] = _models[ store_key ].subscriptions || null
    })
    return subscriptionList
  },

  /* ------------------------------------------------------------------------ */
  help() {
    console.log("TODO");
  }
}

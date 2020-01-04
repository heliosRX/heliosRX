export default {

  /* *NEW* Sub path based getter */
  example: ( $models, $registry, $store ) => {
    // Use like: $models.example.with({ myId: '123' }).getters.example

    if ( !( 'myId' in $store.definedProps ) ) {
      throw new Error('Please define myId in "with".')
    }

    let myId = $store.definedProps[ 'myId' ]

    console.log( $store.definedProps )
    console.log( $store.path )
    console.log( myId )
  },

  // myGetter1: ({ state, getters }, model) => { /* no this, but model */ }

  // myGetter1({ state, getters }) => { /* access to this */ }

  aggregated_timeslot_collection_hours: ( $models ) => {

    console.log("[GETTER] my_global_getter test");

    let example_list = $models.example.getList()

    if ( !example_list.$readySome ) {
      return 'Loading...'
    }

    let list = [];
    for ( var id in example_list.items ) {
      list.push( example_list.items[ id ].name );
    }
    if ( list.length > 0 ) {
      return list.join('#');
    } else {
      return '<empty>'
    }
  }
}

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
}

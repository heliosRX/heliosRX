
function useCreateFolder() {
}

export default {
  name: 'Simple',
  path: '/user/{userId}/task/*',
  shard: 'DB1',
  shard() {
    return 'DB1'
  },
  fields: {
    title:     { validate_bolt_type: 'String', required: true },
    createdAt: { validate_bolt_type: 'ServerTimestamp' },
    isDone:    { validate_bolt_type: 'Boolean' },
  },
  computed: { // - instead of getter
    mygetter() {
      this.title.toUpperCase();
    }
  },
  methods: { // - instead of actions
    doAction({ $store, $models }) {

    }
  },
  modifiers: {
    last100() {

    }
  },
  setup({ $state }) {

    const createFolder = useCreateFolder()

    const mygetter = computed(() => {
      // ...
    })

    function doAction() {
      // ...
    }

    return {
      createFolder,
      mygetter,
      doAction,
    }
  },
  store: {
    getters: {
      mygetter( $models, $registry, $store ) {
        // becomes: $models.simple.getters.mygetter()
        // becomes: mapStoreGetters('simple', [ 'mygetter' ])
        // becomes: composite API?
        // becomes:   setup() { $store...  }
        // ...
      }
    },
    actions: {
      doSomethingFancy({ $store, $models }) { // becomes: $models.simple.doSomethingFancy()
        // ...
      },
      doAction({ $store, $models }, id) { // becomes: $models.simple.doAction( id )
        // ...
      },
    }
  },
  model: SimpleModel,
  model: {
    getters: {
      // becomes: model.getters.foobar
    },
    actions: {
      // becomes: model.doAction();
    }
  },
  list: {},
};

import Vue from 'vue';
import Vuex, { mapGetters } from 'vuex';

// Vue.use(Vuex);

let fake_models = null;

// TODO: Replace vuex store with vue instance

const registry = new Vuex.Store({
  strict: true,
  state: {
    reg: {},
    index: {},
    sync: {}
  },
  getters: {
    get_registry_entry: (state, getters, rootState, rootGetters) => (name) => {
      return state.reg[ name ];
    },
    /* -------------------------------------------------------- custom getter */
    my_global_getter: (state) => {
      console.log("[GETTER] my_global_getter");

      const $models = fake_models; // TODO
      // console.log("my_getter", $models);

      let goals = $models.goal_meta.requireAll()
      if ( !goals.$ready ) {
        return 'Loading...'
      }

      /*
      let goals = goal_entry.data;

      let goal_entry = state.reg[ 'goal_meta' ];
      if ( !goal_entry ) {
        return 'Loading...'
      }

      console.log("Goals", goal_entry.data);
      */

      let list = [];
      for ( var id in goals.items ) {
        list.push( goals.items[ id ].name );
      }
      if ( list.length > 0 ) {
        return list.join('#');
      } else {
        return '<empty>'
      }
    }
  },
  mutations: {
    ADD_ENTRY(state, data) {
      // state.reg[ data.name ] = data;
      Vue.set( state.reg, data.name, data )
    },
    SET_STATUS( state, { name, value } ) {
      state.reg[ name ].status = value;
      if ( value === 'Ready' ) {
        // state.reg[ name ].data.$ready = true;
        Vue.set( state.reg[ name ].data, '$ready', true )
      }
    },
    SET_DATA( state, { name, value } ) {
      // state.reg[ name ].data = value;
      Vue.set( state.reg[ name ], 'data', value )
    },
    SET_ITEMS( state, { name, value } ) {
      state.reg[ name ].data.items = value;
    },
    ADD_ITEM( state, { name, id, value } ) {
      // state.reg[ name ].data.items[ id ] = value;
      Vue.set( state.reg[ name ].data.items, id, value )
    },
    UPDATE_ITEM( state, { name, id, prop, value } ) {
      let item = state.reg[ name ].data.items[ id ];
      // item[ prop ] = value;
      Vue.set( item, prop, value )
    }
  },
});

function decorate(data) {
  for ( let prop in data ) {
    Object.defineProperty( data[prop], '$key', {
      get: () => {
        return "KEY-" + prop;
      }
    });
  }
}

function make_reactive_model( schema, is_dirty = false ) {
  let load_result = {
    _update_field(key, value) {
      // console.log("_update_field", key, value);
      this.$state[ key ] = value;
      // this.$dirty.push( key );
      this.$dirty[ key ] = true;
    },
    write() {
      console.log("Writing $dirty fields", JSON.stringify(this.$dirty));
      this.$dirty = {}
    },
    customAction: () => {
      console.log("custom action 1");
    },
    rules() {
      /* TODO: Return custom validation rules for elements
       * See: https://element.eleme.io/#/en-US/component/form#custom-validation-rules
       */
      let rules = {};
      schema.forEach(field => {
        rules[ field.name ] = { validator: field.validator, trigger: 'blur' };
      });
      return rules;
    },
    $isValid() {
      return Object.keys( this.$invalid ).length === 0;
    },
    $state: {},
    $ready: false,
    $dirty: {},
    $invalid: {}
  };

  // load_result = Vue.observable( load_result );
  schema.forEach(field => {
    load_result.$state[ field.name ] = field.placeholder;
    if ( is_dirty ) {
      load_result.$dirty[ field.name ] = true;
    }

    Object.defineProperty(load_result, field.name, {
      set: function( value ) {
        if ( field.validator && field.validator( value ) ) {
          delete this.$invalid[ field.name ];
          this._update_field( field.name, value );
        } else {
          this.$invalid[ field.name ] = true;
          this._update_field( field.name, value );
          console.warn(`Validation failed for field '${field.name}' with value ${value}.`);
        }
      },
      get: function() { return this.$state[ field.name ]; }
    });
  });

  Vue.observable( load_result.$state );
  // Vue.observable( load_result );
  return load_result;
}

// TODO: Nested data
const fake_schema = [
  { name: 'name', placeholder: 'Name', validator: () => true },
  { name: 'a',    placeholder: 'X',    validator: v => v.length < 30 },
  { name: 'b',    placeholder: 0,      validator: () => true }
]

fake_models = {
  goal_meta: {
    _registry: [],

    /* ----------------------------------------------------------- requireAll */
    requireAll() {

      /* Registry */
      let registry_entry = registry.getters.get_registry_entry( 'goal_meta' );

      if ( registry_entry ) {
        if ( registry_entry.status === 'Loading' ) {
          return registry_entry.data;
        }
        if ( registry_entry.status === 'Ready' ) {
          return registry_entry.data;
        }
      }

      let delayed_data = {
        $ready: false,
        items: {},
      };
      registry_entry = {
        name: 'goal_meta',
        param: '*',
        status: 'Loading',
        data: delayed_data
      };
      registry.commit('ADD_ENTRY', registry_entry)

      setTimeout(() => {
        console.log("data after 2s");
        const items = {
          'id1': make_reactive_model( fake_schema ),
          'id2': make_reactive_model( fake_schema ),
          'id3': make_reactive_model( fake_schema ),
        };
        decorate(items)

        registry.commit('SET_STATUS', { name: 'goal_meta', value: 'Ready' })
        registry.commit('SET_ITEMS', { name: 'goal_meta', value: items })

        setTimeout(() => {
          console.log("data update/add after 3s");
          registry.commit('UPDATE_ITEM', {
            name:  'goal_meta',
            id:    'id3',
            prop:  'name',
            value: 'BBB'
          });
          registry.commit('ADD_ITEM', {
            name:  'goal_meta',
            id:    'id4',
            value: { name: 'D' }
          })
        }, 1000)
      }, 2000);

      return registry.getters.get_registry_entry( 'goal_meta' ).data;
    },

    /* -------------------------------------------------------------- require */
    require({ goalId }) {
      console.log("Fetching goal with goalId", goalId);
      let load_result = make_reactive_model( fake_schema );

      console.log("load_result", load_result);

      setTimeout(() => {
        load_result.$state.b = 15;
        // load_result.b = 15; // Same, but triggers '$dirty'
        load_result.$ready = true;
        setTimeout(() => { load_result.$state.b = 125; }, 1000);
      }, 1000);

      return load_result
    },

    /* ------------------------------------------------------------------ new */
    new() {
      let model = make_reactive_model( fake_schema );
      // let model = make_reactive_model( fake_schema, true );
      model.customAction = function() {
        console.log("custom action 2", Object.keys( this.$dirty ) );
      }
      return model;
    }
  },

  /* ---------------------------------------------------------- custom getter */
  timeslot_collection: new Vue({
    store: registry,
    computed: {
      ...mapGetters({
        my_global_getter: "my_global_getter"
      }),
      aggregated_timeslot_collection_hours() {
        console.log("[GETTER] aggregated_timeslot_collection_hours - vue computed");

        let goals = registry.state.reg['goal_meta'];
        let list = [];
        for ( var id in goals.data.items ) {
          list.push( goals.data.items[ id ].name );
        }
        if ( list.length > 0 ) {
          return list.join('+');
        }
        return '+'
      }
    }
  }),

  foobar: {
    test_function_not_getter() {
      return 'ASDASD';
    }
  }
}

/* ------------------------------------------------------------ custom getter */
Object.defineProperty(
  fake_models.foobar,
  'test_getter2', {
    /* INFO: This getter is cached! */
    // get: () => registry.getters.my_global_getter

    /* INFO: This getter is cached! */
    get: () => fake_models.timeslot_collection.my_global_getter
  }
);

Object.defineProperty(
  fake_models.foobar,
  'test_getter',
  {
    get: () => {
      /* INFO: This getter is NOT cached! */

      console.log("[GETTER] test_getter");
      // let goals = registry.state.reg['goal_meta'].data;
      let goals = fake_models.goal_meta.requireAll()
      if ( !goals.$ready ) {
        return 'Loading...'
      }

      let list = [];
      for ( var id in goals.items ) {
        list.push( goals.items[ id ].name );
      }
      if ( list.length > 0 ) {
        return list.join('/');
      }
      return '/'
    }
  }
);

/*----------------------------------------------------- dynamic custom getter */

function dynamic_custom_getter( $models ) {
  /* INFO: This getter is cached! */
  console.log("[GETTER] dynamic_custom_getter");

  let goals = $models.goal_meta.requireAll()
  if ( !goals.$ready ) {
    return 0;
  }
  return Object.keys( goals.items ).length;
}

let customGetters = [
  { name: 'dynamic_custom_getter', func: dynamic_custom_getter }
];

function add_custom_getters( store, getters ) {

  const computed = {}

  getters.forEach( getter => {

    let key = getter.name
    let fn  = getter.func;

    computed[key] = () => fn( fake_models )

    fake_models[ store ] = {}

    Object.defineProperty(fake_models[ store ], key, {
      get: () => _vm[key],
      enumerable: true
    })

    // Object.defineProperty(
    //   registry.getters,
    //   getter.name, {
    //     get: getter.func,
    //   },
    // );

    // TODO: hotUpdate
  });

  const _vm = new Vue({
    computed
  })
}

add_custom_getters( 'magic_store', customGetters );

const fake_db = {}

if ( process.env.VUE_APP_PRODUCTION === 'false' ) {
  window.$fake_models = fake_models;
  window.$fake_db = fake_db;
  window.$fake_registry = registry;
}

// console.log("registry", registry);
// console.log("fake_models", fake_models);

export { fake_models, fake_db };

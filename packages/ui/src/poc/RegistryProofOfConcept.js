import Vue from 'vue';

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
          // throw new Error(`Validation failed for field '${field.name}' with value ${value}.`)
          // throw {
          //   msg: `Validation failed for field '${field.name}' with value ${value}.`,
          //   field: field
          // };
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

const fake_models = {
  goal_meta: {
    _registry: [],

    /* ----------------------------------------------------------- requireAll */
    requireAll() {

      /* Registry */
      let registry_entry = this._registry.find( entry => entry.name === 'goal_meta' )

      if ( registry_entry ) {
        if ( registry_entry.status === 'Loading' ) {
          return registry_entry.data;
        }
        if ( registry_entry.status === 'Ready' ) {
          registry_entry.$promise = Promise.resolve();
          return registry_entry.data;
        }
      }

      let delayed_data = {
        $ready: false,
        items: {},
        $promise: null
      };
      registry_entry = {
        name: 'goal_meta',
        param: '*',
        status: 'Loading',
        data: delayed_data
      };
      this._registry.push(registry_entry);

      delayed_data.$promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          registry_entry.status = 'Ready';
          registry_entry.data = delayed_data;
          resolve( registry_entry.data );
        }, 3000)
      })

      setTimeout(() => {
        console.log("data after 2s");
        delayed_data.$ready = true;
        const items = {
          'id1': make_reactive_model( fake_schema ),
          'id2': make_reactive_model( fake_schema ),
          'id3': make_reactive_model( fake_schema ),
        };
        decorate(items)

        delayed_data.items = items;

        setTimeout(() => {
          console.log("data update/add after 3s");
          delayed_data.items['id3'].name = 'BBB';
          Vue.set(delayed_data.items, 'id4', { name: 'D' })
        }, 1000)
      }, 2000);

      return Vue.observable( delayed_data );
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
    new() {
      let model = make_reactive_model( fake_schema );
      // let model = make_reactive_model( fake_schema, true );
      model.customAction = function() {
        console.log("custom action 2", Object.keys( this.$dirty ) );
      }
      return model;
    }
  },

  timeslot_collection: { }
}

/* -------------------------------------------------------- custom getter */
function my_getter( $models ) {
  console.log("aggregated_timeslot_collection_hours", $models);

  let goals = $models.goal_meta.requireAll()

  let delayed_data = {
    $ready: false,
    value: 'Loading...'
  };

  goals.$promise.then(() => {
    console.log("my_getter: promise resolved", delayed_data, goals);
    delayed_data.$ready = true;
    let list = [];
    for ( var id in goals.items ) {
      list.push( goals.items[ id ].name );
    }
    delayed_data.value = list.join('+');

    /* PROBLEM: We won't get notified, when goals change */
  })

  return Vue.observable( delayed_data );
}

let customGetters = [
  { name: 'aggregated_timeslot_collection_hours', func: () => my_getter( fake_models ) }
];
customGetters.forEach( getter => {
  Object.defineProperty(
    fake_models.timeslot_collection,
    getter.name,
    { get: getter.func }
  );
});

console.log("fake_models", fake_models);

/* -------------------------------------------------------- batch update */
const fake_db = {}

export { fake_models, fake_db };

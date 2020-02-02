# Model definition

## Schema definition

```js
export default {

  // Syntax: create( required, optional, BACKEND )
  create({ name }, data, BACKEND) {
    return {
      a:             0,
      b:             name,
    };
  },

  fields: [
    { model: 'a', type: 'Number' },
    { model: 'b', required: true },
    { model: 'long_name',  abbrv: 'ln' },
    { model: 'short_name', abbrv: 'sn' }
    ...
  ],

  // - or -

  fields: {
    createdAt: {
      type: 'ServerTimestamp',
    },
    name: {
      validator: () => true,
      type: 'String',
      required: true,
      abbrv: 'n'
    },
    a: {
      type: 'String',
      validate: v => v.length < 30
    },
    b: {
      type: 'Boolean',
      validator: () => true
    },
    someNumber: {
      type: 'Number',
      validator: () => true
    },
  },
};
```

## Field properties

### type

- **`validate: string`**

The validation type that is used for server-side validation.

The bolt built-in types are:

```
String            - Character strings
Number            - Integer or floating point
Boolean           - Values `true` or `false`
Object            - A structured object containing named properties.
Any               - Every non-null value is of type Any.
Null              - Value `null` (same as absence of a value, or deleted)
Map<Key, Value>   - A generic type - maps string valued keys to corresponding
                    values (similar to an Object type).
Type[]            - An "array-like" type (actually same as Map<String, Type>
                    where Type can be any other built-in or user-defined type.
```

On top of that heliosRX defines some additional types:

```bolt
type ServerTimestamp extends Number { ... }
type CurrentTimestamp extends ServerTimestamp { ... }
type InitialTimestamp extends ServerTimestamp { ... }
type Timestamp extends Number { ... }
type PastTimestamp extends Number { ... }
type FutureTimestamp extends Number { ... }
type AnyID extends String { ... }
type PushID extends String { ... }
type SlugID extends String { ... }
type UserID extends String { ... }
type ReasonableDate extends Number { ... }
type DDMMYYYYDate extends String { ... }
type YYMMDDDate extends String { ... }
type ISODate extends String { ... }
type ReasonableYear extends String { ... }
type Domain extends String { ... }
type EMail extends String { ... }
type JSON extends String { ... }
type Point2D { ... }
```

You can also define your own types, by creating a new file `rules/types.bolt`
and adding type defintions to this file. Learn more about the bolt model language
[here](https://github.com/FirebaseExtended/bolt/blob/master/docs/language.md).

### validate (optional)

- **`validate: function`**

A validation function used for client-side validation.

### required (optional)

- **`required: boolean`**

Indicates whether the field is required. For example, when creating a new
entry with `add` heliosRX will check if the required field was set.

### model (optional)

- **`validate: string`**

If the schema is defined as an array, `model` is the name of the field.
If the schema is defined as an object, it will be ignored.

## Custom Getters and Actions

Assuming you have a model or a list of models:

```js
let model = this.$models.example.subscribeNode(1)
let list = this.$models.example.subscribeList()
```

You can define the following type of custom actions:

- `model.myaction(customArg1, customArg2, ...)`
- `list.myaction(customArg1, customArg2, ...)`
- `this.$models.example.myaction(customArg1, customArg2, ...)`

And the following type of custom (reactive) getters:

- `model.getters.mygetter`
- `list.getters.mygetter`
- `this.$models.example.getters.mygetter`

Custom actions and getters are defined by adding them to the model defintion:

```js
const exampleModelDefinition = {

  schema: schema, // Define model schema

  // Define additional getters for model instances
  modelGetters: {
    mygetter(
      $instance, GenericModel,
      $model: GenricStore,
      $models: Moduel<GenericStore> ) {
      // Will become:
      // let model = this.$models.example.subscribeNode(1)
      // model.getters.mygetter
    }
  },

  // Define additional actions for model instances
  modelActions: {
    myaction({
      $instance, GenericModel,
      $model: GenericStore,
      $models: Module<GenericStore> }, customArg1, customArg2, ...) {
      // Will become:
      // let model = this.$models.example.subscribeNode(1)
      // model.myaction(customArg1, customArg2, ...)
    }
  },

  // Define additional getters for lists
  listGetters: {
    mygetter(
      $instance, GenericList,
      $model: GenricStore
      $models: Moduel<GenericStore>,
    ) {
      // Will become:
      // let list = this.$models.example.subscribeList()
      // list.getters.mygetter
    }
  },

  // Define additional actions for lists
  listActions: {
    myaction({
      $instance, GenericList,
      $model: GenricStore,
      $models: Module<GenericStore> }, customArg1, customArg2, ... ) {
      // Will become:
      // let list = this.$models.example.subscribeList()
      // list.myaction(customArg1, customArg2, ...)
    }
  },

  // Define global getters for the store
  staticGetters: {
    mygetter(
      $model: GenericStore
      $models: Module<GenericStore>,
    )) {
      // Will become:
      // this.$models.example.getters.mygetter
    }
  },

  // Define global actions for the store
  staticActions: {
    myaction({
      $models: Module<GenericStore>,
      $model: GenricStore }, customArg1, customArg2, ...) {
      // Will become:
      // this.$models.example.myaction(customArg1, customArg2, ...)
    }
  },
};

const example = GenricStore('/example/*', exampleModelDefinition);
```


## Misc


### modelDefinition.schema.unsafe_disable_validation

- **`schema.unsafe_disable_validation: boolean`**

Disabled the client side validation (useful for development)


### modelDefinition.abstract_store

- **`abstract_store: boolean`**

Declare stores that use the model definition as abstract stores.

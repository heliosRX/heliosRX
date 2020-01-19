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
    { model: 'a', validate_bolt_type: 'Number' },
    { model: 'b', required: true },
    { model: 'long_name',  abbrv: 'ln' },
    { model: 'short_name', abbrv: 'sn' }
    ...
  ],

  // - or -

  fields: {
    createdAt: {
      validate_bolt_type: 'ServerTimestamp',
    },
    name: {
      validate: () => true,
      validate_bolt_type: 'String',
      required: true,
      abbrv: 'n'
    },
    a: {
      validate_bolt_type: 'String',
      validate: v => v.length < 30
    },
    b: {
      validate_bolt_type: 'Boolean',
      validate: () => true
    },
    someNumber: {
      validate_bolt_type: 'Number',
      validate: () => true
    },
  },
};
```

## Field properties

### validate_bolt_type

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

## Store Getters and Actions

::: warning Work in Progress (11/1/2019)
This section is still a work in progress. It will be updated soon.
:::

## Model Getters and Actions

::: warning Work in Progress (11/1/2019)
This section is still a work in progress. It will be updated soon.
:::

## List Getters and actions

::: warning Work in Progress (11/1/2019)
This section is still a work in progress. It will be updated soon.
:::

# Defining a Model

Models are defined by a schema, getters, and actions. While the schema describes
which fields the model has, which type they have, if they're required or not,
actions and getters are optional extensions of the model's capabilities.
You may define as many models as your application requires.

To define a model, you have to do the following steps:

1. Create `schema.js` in `src/models` which exports a model definition
2. Create a `GenericStore` from the model definition in `src/models/config.js`
3. Update `rules.bolt` to grant access to the path, where the data is stored
4. Generate and deploy security rules
<!-- 4. Add custom functions `api/*.js` -->

## Create a new model

There are two ways to create a new model:

### Automatically creating a new model

First, create a new model with the CLI tool

```bash
helios gen-model <mymodel>
```

next edit `src/models/<mymodel>/schema.js`.

### Manually creating a new model

First, create a new folder for the model definition:

```bash
mkdir -p src/models/example/
```

Then add an `index.js`:

```js
// file: src/models/example/index.js
import schema from './schema'
export default {
  staticGetters: {},   // Define global getters for the store
  staticActions: {},   // Define global actions for the store
  schema: schema,      // Define model schema
};
```

Then create a `schema.js`:

```js
// file: src/model/example/schema.js
export default {
  create({ title }) {
    return {
      createdAt: NOW(),
      title: "Undefined title" || title,
      isDone: false,
    };
  },
  fields: {
    createdAt: { validate_bolt_type: 'ServerTimestamp' },
    title:     { validate_bolt_type: 'String', required: true },
    isDone:    { validate_bolt_type: 'Boolean' },
  },
};
```

## Defining a new Store and setting the Path Template

Create a new store in you `config.js`, like so:

```js
import exampleModelDefinition from  '@/models/example'
export const challenge = new GenericStore(
  '[DB1]:/user/{userId}/challenge/*',
  exampleModelDefinition,
  options
);
```

The first argument is the path where the schema is mapped to. `{userId}` is a
placeholder which can be set with `with({ userId: ... })`.
The asterisk `*` is a placeholder for the **primary key**.
`[DB1]:` is optional and can be used for database sharding.
If only one database is configured, it can be omitted,
otherwise, it refers to the identifier of the database as
configured when setting up heliosRX with `Vue.use(heliosRX, { ... })`.

The second argument is the model definition as defined in the previous section.

The third argument is an options object. Valid options are `isAbstract` or
`additionalProps`, see [API GenericStore](../../api/01-generic-store).

## Generate and deploy security rules

Verify everything is set up correctly with:

```bash
helios check
```

then run:

```js
helios rules --write database.rules.bolt
firebase-bolt database.rules.bolt
firebase deploy --only database
```

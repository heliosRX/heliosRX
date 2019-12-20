# Tutorial: Defining a model

## Schemata in heliosRX

## How to create a new model

1. Create schema.js in ```@/src/models```
2. Update path and model definition in ```@/src/models/config.js```
3. Update ```rules.bolt``` to grant access to path
4. Add custom functions ```api/*.js```
5. Add model to create_rules.js (needed to work with custom array data types )

## Defining a simple model

```jsx
# src/model/task/schema.js
export default {
  create({ title }) {
    return {
      createdAt: NOW(),
      title: "Undefined title" || title,
      isDone: false,
    };
  },
  fields: {
    createdAt: {
      validate_bolt_type: 'ServerTimestamp',
    },
    title: {
      validate_bolt_type: 'String',
      required: true,
    },
    isDone: {
      validate_bolt_type: 'Boolean',
    },
  },
};
```

## Generate schema

Run

```jsx
helios gen
firebase deploys --only rules
```



## Advanced model defintion with getters and actions

```
└── models              
    └── tasks
        ├── schema.js   -
        ├── getters.js  -
        └── actions.js  -
```

Verify everything is set up correctly with:

```bash
helios check
```

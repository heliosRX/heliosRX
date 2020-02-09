# Ideas

## API Design

- Idea: generate dependency tree directly from template paths (since {id}'s are known)

- Idea: Define type in path string
Instead of
```
/challenge/{challengeId}/internal/\*
```
we do
```
/challenge/{challengeId}/internal/{$taskId:UUID}      # (other UUID)
/challenge/{challengeId}/internal/{$taskId:MY_UUID}   #
/challenge/{challengeId}/internal/{$taskId:TIMESTAMP} #
/challenge/{challengeId}/internal/{$taskId:taskId}    # < ??
```

- Idea: Define depencies
```
export const cohorts = new GenericStore(
  "/challenge/{challengeId}/internal/cohorts/ * ",
  cohortTypeDefinition,
  { dependsOn: [ challenge, userId ] }
);
```

## Relation management

1. Allow writes on de-normalized data (batches)
2. Allow joins
3. Automatically detect “cached*”

## Features database

1. Become backend neutral
2. Support key compression (Rosetta-Stone)
3. Support DB sharding
4. Support pagination
5. Implement easy throttling / debouncing
6. Implement getter to retrieve sortidx automatically

## Offline support

1. Support offline caching
2. Provide interface for firebase feature keepSynced `scoresRef.keepSynced(true)`
3. Manage user persistence
4. Manage disk persistence
See: https://firebase.google.com/docs/database/android/offline-capabilities
5. Run in a Webworker / Serviceworker
See: https://github.com/pkaminski/fireworker

## Debug

1. DEBUG TOOL as overlay: Which subscribers are active, which stores are available

## Type definition and schema

1. Bolt: `.bolt => .rule transpiler`
2. [Bolt-Typescript-Transpiler](https://github.com/fny/firebase-bolt-transpiler): `.bolt => .ts`
3. [typescript-json-schema](https://github.com/YousefED/typescript-json-schema): `.ts => .json_schema`
4. avj: json-Schema validator

Alternative:

1. Use Bolt-Parser to get AST-Tree: .bolt => .symbols
2. Write to own schema file: .symbols => .json

- vue-vuelidate-jsonschema: Create vuelidate validation rules based on json schema
- Vee Element brings the simplicity of Vee Validate to Element UI forms.
- Automatically infer JSON Schema from schema: https://www.jsonschema.net/
- https://atom.io/packages/lang-bolt

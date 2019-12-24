## Type Definition

1. Bolt: .bolt => .rule transpiler
2. [Bolt-Typescript-Transpiler](https://github.com/fny/firebase-bolt-transpiler): .bolt => .ts
3. [typescript-json-schema](https://github.com/YousefED/typescript-json-schema): .ts => .json_schema
4. avj: json-Schema validator

Alternative:

1. Use Bolt-Parser to get AST-Tree: .bolt => .symbols
2. Write to own schema file: .symbols => .json

- vue-vuelidate-jsonschema: Create vuelidate validation rules based on json schema
- Vee Element brings the simplicity of Vee Validate to Element UI forms.
- Automatically infer JSON Schema from schema: https://www.jsonschema.net/
- https://atom.io/packages/lang-bolt

## API

Idea: generate dependency tree directly from template paths (since {id}'s are known)

Idea: Instead of
  "/challenge/{challengeId}/internal/\*",
  we do
  "/challenge/{challengeId}/internal/{$taskId:UUID}", (other UUID)
  "/challenge/{challengeId}/internal/{$taskId:MY_UUID}",
  "/challenge/{challengeId}/internal/{$taskId:TIMESTAMP}",
  "/challenge/{challengeId}/internal/{$taskId:taskId}", < ??

Idea:
export const cohorts = new GenericStore(
  "/challenge/{challengeId}/internal/cohorts/ * ",
  cohortTypeDefinition,
  { dependsOn: [ challenge, userId ] }
);

# IDEA
- Wire up based on definiton list not based on current run. Don't use dag at all. Just sent up all channels and let resources send whenever they are ready.
Still walk through DAG to find dependencies, but just load them, don't care about promises.


# IDEA:
Why not just pass promises to resources and then let them resolve them themself
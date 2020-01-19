# CLI

```
Usage: helios [global options] command

Options:
  -V, --version              output the version number
  -d, --dry                  Perform a dry run (nothing is changed)
  -v, --verbose              Be verbose
  -j, --print-json           Print output as JSON, not pretty tables
  -P, --project [projectId]  Firebase project
  -h, --help                 output usage information

Commands:
  rules|r [options]          Generate rules
  check|c [options]          Check schema for errors
  init|i                     Initialize helios config
  gen-model|m <name>         Generate a new model
```

## helios init

::: warning Work in Progress (11/1/2019)
This section is still a work in progress. It will be updated soon.
:::

## helios check

Automatically checks all model definitions for errors

```
helios check --models <model-path>
```

You might want to add an aliases to your `package.json`

```js
"scripts": {
  ...
  "rules:check": "helios check --models models/"
},
```

## helios rules

Autogenerates Security Rules for Firebase Realtime Databse (in the `.bolt` format):

```bash
helios rules --write <output-file>
```

Usualy the `.bolt` file is compiled to a `json` using the the bolt-compiler and then deployed:

```bash
helios rules --write database.rules.bolt
firebase-bolt database.rules.bolt
firebase deploy --only database
```

You might want to add a few aliases to your `package.json`
```js
"scripts": {
  ...
  "rules:make":   "helios rules --write database.rules.bolt && firebase-bolt database.rules.bolt"
  "rules:deploy": "firebase deploy --only database",
},
```

## helios gen-model

::: warning Work in Progress (11/1/2019)
This section is still a work in progress. It will be updated soon.
:::

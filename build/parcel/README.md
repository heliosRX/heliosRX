# How to cross compile Generic API for node

```bash
# Follow setup in ../README.md
n 8.15.1
yarn
yarn clean
yarn build
```

WARNING:
The local config will also be bundeled!

- Must use yarn!
- Parcel-bundler must be version 1.12.3 (custom plugin)


## Install locally for testing

```json
{
  "parcel-plugin-alias": "file:../../../parcel-plugin-alias"
}
```


# TODO

- Build to Dart / Flutter Interop

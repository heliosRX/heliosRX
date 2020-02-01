# Generic List

::: warning Work in Progress (20/1/2020)
This section is still a work in progress. It will be updated soon.
:::

## Properties

```
items        = {};
$readyAll    = false;
$readySome   = false;
/* This promise will resolve once ALL the data is ready */
$promise     = Promise.resolve();
$numReady    = 0;
$noaccess    = null;
$numChildren = 0;

_store_name  = name;
_unwatch     = null;
```

## Getters

#### $key
```js
get $key()
```

#### $vm
```js
get $vm()
```

#### $model
```js
get $model()
```

## Methods

#### constructor
```js
constructor( schema, data, name )
```

#### clone
```js
clone()
```

#### $isValid
```js
$isValid()
```

#### _autogenerate_props
```js
_autogenerate_props( schema, data, is_dirty = false )
```

#### _decorate_actions
```js
_decorate_actions( modelActions, context )
```

#### _decorate_getters
```js
_decorate_getters( modelGetters, context )
```

#### write
```js
write()
```

#### reset
```js
reset()
```

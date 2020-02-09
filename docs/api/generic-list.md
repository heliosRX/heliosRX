# Generic List

::: warning Work in Progress (06/02/2020)
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

#### $idList
- **`TODO`**
```js
get $idList()
```

#### itemsSorted
- **`TODO`**
```js
get itemsSorted()
```

## Methods

#### constructor
```js
constructor( name )
```

#### getItemByIdx
- **`TODO`**
```js
getItemByIdx( idx )
```

#### asArraySorted
- **`TODO`**
```js
asArraySorted()
```

#### asArraySortedBy
- **`TODO`**
```js
asArraySortedBy(prop)
```

#### asArrayFilteredBy
- **`TODO`**
```js
asArrayFilteredBy(prop, value)
```

#### itemsAsArrayWithoutDeleted
- **`TODO`**
```js
itemsAsArrayWithoutDeleted( custom_sortidx )
```

#### itemsAsArrayOnlyDeleted
- **`TODO`**
```js
itemsAsArrayOnlyDeleted( custom_sortidx )
```

#### reset
- **`TODO`**
```js
reset()
```

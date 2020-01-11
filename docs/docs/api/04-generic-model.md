# Generic Model

::: warning Work in Progress (11/1/2019)
This section is still a work in progress. It will be updated soon.
:::

## Properties

```
$ready       = false;
/* This promise will resolve once the data is ready */
$promise     = Promise.resolve();
$state       = {};
$dirty       = {};
$invalid     = {};
$id          = null;
$idx         = null;
$noaccess    = null;
_store_name  = name;
```

## Getters

#### $id_list
- **`TODO`**
```js
get $id_list()
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

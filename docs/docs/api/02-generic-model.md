# Generic Model

---
...

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
- X
```js
get $id_list()
```

#### itemsSorted
- X
```js
get itemsSorted()
```

## Methods

#### constructor
```js
constructor( name )
```

#### getItemByIdx
- X
```js
getItemByIdx( idx )
```

#### asArraySorted
- X
```js
asArraySorted()
```

#### asArraySortedBy
- X
```js
asArraySortedBy(prop)
```

#### asArrayFilteredBy
- X
```js
asArrayFilteredBy(prop, value)
```

#### itemsAsArrayWithoutDeleted
- X
```js
itemsAsArrayWithoutDeleted( custom_sortidx )
```

#### itemsAsArrayOnlyDeleted
- X
```js
itemsAsArrayOnlyDeleted( custom_sortidx )
```

#### reset
- X
```js
reset()
```

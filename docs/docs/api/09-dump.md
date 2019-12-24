```js
let user_signed_in = false;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User signed is or was authenticated during load
    user_signed_in = true;
    GenericStore.defaultUserId = user.uid;
  } else if ( user_signed_in ) {
    // User was signed in and now signed out
    GenericStore.defaultUserId = null;
    GenericStore.resetState();
    user_signed_in = false;
  } else {
    // User was not authenticated during load
    user_signed_in = false;
  }
});
```


<!--
::: tip
Sync-Implementation is based on:
https://github.com/vuejs/vuefire/blob/master/packages/vuexfire/src/index.js
:::
-->

<!--
| Param                     | Type                | Description  |
| ------------------------- | ------------------- | ------------ |
| templatePath              | `string`            | Path where the resource is stored.
| modelDefinition           | `ModelDefinition`    | Model definition.
| options.uidMethod         | `string`            | See [UIDMethod](./00-database#UIDMethod)
| options.defaultDeleteMode | `string`            | deleteMode.SOFT or deleteMode.HARD (default), see [deleteMode](./00-database#DeleteMode)
-->



<!--
```js
storeA = GenericStore('/goal/{goalId}/user_list/{uid}/task_names/*')
storeB = GenericStore('/goal/{goalId}/user_list/{uid}/task_details/*')
storeC = GenericStore('/goal/{goalId}/user_list/{uid}/task_end_dates/*')

let superStore = SuperStore([storeA, storeB, storeC])
superStore.batchMove( id, contextA, contextB )
```
-->


The generic store provides a unified API to the database.
Create store with different UID method.

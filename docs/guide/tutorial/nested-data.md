# Dealing with nested data

Imagine your data is nested like this:

```
/project/{projectId}/user/{userId}/task/{taskId}
```

heliosRX provides a straight forward way to deal with this:

```js
this.$models.task
  .with({
    projectId: '-Lw_jBKRh5qNcdCG-GYM'
    userId: 'Qz3p2fpvTyeje5As3WDfgQtTCEK2' // optional
  })
  .add({
    title: "My task"
  })
```

The `userId` is automatically inferred from the currently authenticated user,
if not given. So the example above is the same as (assuming the current user is
  `Qz3p2fpvTyeje5As3WDfgQtTCEK2`)


```js
this.$models.task
  .with({ projectId: '-Lw_jBKRh5qNcdCG-GYM' })
  .add({
    title: "My task"
  })
```


## Setting the default user Id

In order to set the default user id either the `setDefaultUser` helper can be called:

```js
import { setDefaultUser } from 'heliosrx'
setDefaultUser( user.uid )
```

or the static property defaultUserId is set to the user id:

```js
import { GenericStore } from 'heliosrx'
GenericStore.defaultUserId = user.uid;
```

A good place to set the default user id is in `onAuthStateChanged`:


```js
import { GenericStore } from 'heliosrx'

let user_signed_in = false;

firebase.auth().onAuthStateChanged( ( user ) => {

  if ( user ) {

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


::: warning Work in Progress (05/6/2020)
This section is still a work in progress. It will be updated soon.

This section will cover these use cases:

- Dot-paths
:::

# Database

Database is the object that holds all Models and Modules that registered to the Vuex ORM.
It is also responsible for generating the whole database relational schema
from registered models. This schema is used to "Normalize" data before persisting
to the Vuex Store.


## Enums

### Path syntax

`*` = main id
...

### UIDMethod

- **`UIDMethod`**

Describes different methods for creating unique ids.

::: tip
The `UIDMethod` defines by which method the `*` in the path is replaced.
:::

```js
export const UIDMethod = {
  CUSTOM:          1, // ( props ) => props[]
  SLUGID:          2, // R0qHTeS8TyWfV2_thfFn5w
  PUSHID:          3, // -JhLeOlGIEjaIOFHR0xd (default)
  TIMESTAMP:       4, // 1548573128294 (unix?)
  LOCAL_TIMESTAMP: 5, // 1553700866
  DATE:            6, // DDMMYYYY / 01032019
  OTHER_USER_ID:   7, // -> DEPRECATED
  MY_USER_ID:      8, // fOjaiwtyxoQdOGe6Z2zULK18ggv2
  ARRAY:           9, // 0,1,2,3,...
  EMAIL:          10, // test@test.de
}
```

The default unique Id method can be configured when a new Generic Store is defined:

**Example 1:**

```js
// Use current server timestamp as main id (not a push id)
const post = new GenericStore(
  '/post/*',
  postModelDefinition,
  { uidMethod: UIDMethod.TIMESTAMP }
);
```

**Example 2:**

```js
// Use my user id as main id
const settings = new GenericStore(
  "/user/*/settings",
  settingsModelDefinition,
  { uidMethod: UIDMethod.MY_USER_ID }
);

// TODO: settings.update({ ... })
```

**Example 3:**

```js
// Use a prop value as UID method, in this case an "additional prop"
const contact = new GenericStore(
  "/user/{myUserId}/contacts/*",
  contactModelDefinition,
  {
    additionalProps: ['otherUserId'],
    uidMethod: (props) => props['otherUserId']
  }
);

// This will create a new contact at /user/userA/contact/userA
contact.with({ myUserId: 'UserA', otherUserId: 'UserB' }).add({ ... })
```

### DeleteMode

- **`DeleteMode`**

Describes the mode how data is deleted. In `SOFT` mode instead of deleting an
entry from the database the field `deleted` is set to true. In `HARD` mode data
will be deleted permanently (default).

```js
export const DeleteMode = {
  SOFT: 0, // Sets `deleted` flat to true
  HARD: 1, // Deletes data permanently (default)
}
```

The default mode can be configured when a new Generic Store is defined.

```js
const example = new GenericStore(
  '/example/*',
  exampleModelDefinition,
  { defaultDeleteMode: DeleteMode.HARD }
);
```

or when removing entries:

```js
example.remove( '0123456789', DeleteMode.SOFT )
```

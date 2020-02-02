# Tips for writing Security Rules

::: tip Tip 01
If the type is defined in the schema (`bolt_validation_type: "ChildType[]"`),
then it can and should not be defined via path `/path/to/child`
:::

::: tip Tip 02
read/write rules can also be defined in `schema.bolt`.
In some cases, this might even be necessary! (see sequence)
:::

::: tip Tip 03
Path in `/path/xx` as `MyType[]` should never end with an {id}!
:::

::: tip Tip 04
Be careful when using **white spaces**. Tabs in `.bolt` files will cause errors and are very hard to find.
:::

::: tip Tip 05
Nested read/write rules are connected via "OR"
You cannot grant access to data, then revoke it later!
:::

::: tip Tip 06
No `read()/write() = false`
:::

::: tip Tip 07
`read() { false }` = `read() {}` = no read (same for write)
:::

::: tip Tip 08
`write = create + update + delete`
:::

::: tip Tip 09
Create overwrite write when write is false and create is true (?)
:::

::: tip Tip 10
Multiple `update()` are not allowed, use `||` instead.
:::

::: tip Tip 11
Validation rules do not cascade, so all relevant validation rules must evaluate
  to true in order for the write to be allowed.
:::

::: tip Tip 12
Object types are required to have at least one property when present.
:::

::: tip Tip 13
Map types can be empty collections (they don't have to contain any child keys).
:::

::: tip Tip 14
First letters of type definitions must be **uppercase** and should be **singular**.
:::

::: tip Tip 15
`index()` is the index for props of EVERY child, not the node itself!
```
path /x { index() ['prop'] }
```
means `/x/1/prop` will get indexed
:::

::: tip Tip 16
When using functions in:
`this` is not available in functions and must be passed to the function as a parameter
:::

::: tip Tip 17
If queries are used, the child-rules won't work! You have to define
`query.*` rules. <!-- (see sequence) -->
:::

::: tip Tip 18
If the bolt compiler complains about duplicate keys ("$taskId" and "$key18"),
the reason is probably that
`'path /path/task_meta is TaskMeta[]'` is used in combination with
`'path /path/task_meta/{idTaskMeta}/sub is SubItem[]'`, which is currently
not possible. TaskMeta type needs to be converted to something like
`'sub: { bolt_validation_type: "SubItem[]" }'`.
:::

::: tip Tip 19
```
path /a/b/c is Type[] { write, update, delete, create }
```
is most likely wrong,
you probably want to do
```
path /a/b/c { path /{id} is Type { write, update, ... } }
```
:::

::: tip Tip 20
This is most likely wrong:

```
  path /user/{uid}/notifications is Notification[] {
    read() { isUser(uid) }
    create() { false }
    update() { false }
    delete() { isUser(uid) }
  }
```
  correct:
```
  path /user/{uid}/notifications {
    read() { isUser(uid) }
    path /{notificationId} is Notification {
      create() { false }
      update() { false }
      delete() { isUser(uid) }
    }
  }
```

```
"outgoing_invitations": {
  "$invitationId": {
    ".validate": "newData.hasChildren()",
    ...
    ".write": "newData.val() == null"
  }
}
```

vs

```
"outgoing_invitations": {
  "$key12": {
    ".validate": "newData.hasChildren()",
    ...
  },
  ".validate": "newData.hasChildren()",
  ".write": "newData.val() == null"
}
```

but this works:

```
"incoming_invitations": {
  "$key12": {
    ...
  },
  ".validate": "newData.hasChildren()",
  ".write": "((data.val() == null && auth != null) || ((data.val() != null && newData.val() == null) && ((auth != null && auth.uid == $uid) || data.child('senderUserId').val() == auth.uid)))"
},
```
:::

::: tip Tip 21
If you only get `PERMISSION_DENIED` without any other information,
the reason can be found by looking at the socket comminucation with
Chrome DevTools (See corresponding request with same r-value as error frame).
:::

::: tip Tip 22
Shallower security rules override rules at deeper paths. Child rules can only grant
additional privileges to what parent nodes have already declared. They cannot revoke a
read or write privilege.
:::

::: tip Tip 23
Bolt function definitions can not contain spaces:
- **WRONG:**
```bolt
function isMeGroupMember (groupId) {}
function isMeGroupMember( groupId ) {}
```
- **RIGHT:**
```bolt
function isMeGroupMember(groupId) {}
```
:::


For more information see: [https://github.com/FirebaseExtended/bolt/blob/master/docs/language.md](https://github.com/FirebaseExtended/bolt/blob/master/docs/language.md).

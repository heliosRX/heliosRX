# Security Rules

## Syntax:

```
path /path/to/data [is Type] {
  read() { <true-iff-reading-this-path-is-allowed> }
  write() { <true-iff-writing-this-path-is-allowed> }
  validate() { <additional-validation-rules> }

  Alias:
  create() { exp }  write() { prior(this) == null && exp }
  update() { exp }  write() { prior(this) != null && this != null && exp }
  delete() { exp }  write() { prior(this) != null && this == null && exp }

  Index:
  index() { [ "prop", ... ] }
}
```

## Notes:

- If type is defined in the schema ( bolt_validation_type: "ChildType[]" ),
  then it can and should not be defined via path /path/to/child
- read/write rules can also be defined in schema.bolt
  In some cases this might even be necessary! (see sequence)
- Path in /path/xx as MyType[] should never end with an {id}!
- Careful using white spaces. Tabs in .bolt files will cause errors!
- Nested read/write rules are connected via "OR"
  You cannot grant access to data, then revoke it later!
- No read()/write() = false
- read() { false } = read() {} = no read (same for write)
- write = create + update + delete
- Create overwrite write when write is false and create is true (?)
- Multiple update() are not allowed
- Validation rules do not cascade, so all relevant validation rules must evaluate
  to true in order for the write to be allowed.
- Object types are required to have at least one property when present.
- Map types can be empty collections (they need not contain any child keys).
- First letter of type definitons must be uppsercase + always singular
- index() is the index for props of EVERY child, not the node itself!
  path /x { index() ['prop'] } means /x/1/prop will get indexed
- 'this' is not available in functions and must be passed to the function as a parameter
- If queries are used, the child-rules won't work! We have to define
  query.* rules (see sequence)
- If the bolt compiler complains about duplicate keys ("$taskId" and "$key18"),
  the reason is probably that
  'path /path/task_meta is TaskMeta[]' is used in combination with
  'path /path/task_meta/{idTaskMeta}/sub is SubItem[]', which is currently
  not possible. TaskMeta type needs to be converted to something like
  'sub: { bolt_validation_type: "SubItem[]" }'.
- "path /a/b/c is Type[] { write, update, delete, create }" is probably wrong,
  you probably want to do "path /a/b/c { path /{id} is Type { write, update, ... } }"
- This is probably wrong:
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

- If only PERMISSION_DENIED without any other information is shown,
  the reason can be found by looking at the socket comminucation with
  Chrome DevTools (See corresponding request with same r-value as error frame)

Docs: https://github.com/FirebaseExtended/bolt/blob/master/docs/language.md

Note: Shallower security rules override rules at deeper paths. Child rules can only grant
additional privileges to what parent nodes have already declared. They cannot revoke a
read or write privilege.

## How to debug:
  1. Look for [GENS] message, an copy path to simulator
  2. Double check if path is correct (!) - is it pointint to parent or child? Add child path if necessary
  3. Serialize payload with JSON.stringify(temp1, null, "  ") and copy to simulator
  4. Set user in simulator to this.$models.user.defaultUserId
  5. Check why permission was denied
  6. Check if check database.rules.json makes sense (and was correctly compiled)
  7. Check if check database.rules.bolt is correct

## Functions:
```
function isUser(uid) { auth != null && auth.uid == uid }
```

## String Methods:
```
s.length            - Number of characters in the string.
s.includes(sub)     - Returns true iff sub is a substring of s.
s.startsWith(sub)   - Returns true iff sub is a prefix of s.
s.endsWith(sub)     - Returns true iff sub is a suffix of s.
s.replace(old, new) - Returns a string where all occurances of string, `old`, are
                      replaced by `new`.
s.toLowerCase()     - Returns an all lower case version of s.
s.toUpperCase()     - Returns an all upper case version of s.
s.test(regexp)      - Returns true iff the string matches the regular expression.
```

## DB Refs:
```
ref.child           - Returns the property `child` of the reference.
ref[s]              - Return property referenced by the string, variable, `s`.
ref.parent()        - Returns the parent of the given refererence
                      (e.g., ref.prop.parent() is the same as ref).
prior(this)         - Value of `this` before the write is completed.
prior(this.prop)    - Value of a property before the write is completed.
key()               - The (text) value of the inner-most parent property of the current location.
```


# Lessons learned

## Question: Why does delete sometimes work and sometimes not?

How is it possible, that the following rules allow to delete
in one case and don't allow to delete in the other case?

```
path /user/{uid}/outgoing_invitations is UserOutgoingInvitation[] {
  delete(true)
}

path /user/{uid}/incoming_invitations is UserIncomingInvitation[] {
  delete(true)
}
```

## Answer:

Delete is defined at the wrong level, it should be:

```
path /user/{uid}/outgoing_invitations {
  /{invitationId} is UserOutgoingInvitation {
    delete() { true }
  }
}
```

The reason why it works in some cases is how delete is defined:

```
delete( exp ) => write() { prior(this) != null && this == null && exp }
```

Assuming ```/user/{uid}/incoming_invitation``` has two existing children
and ```/user/{uid}/outgoing_invitations``` has one existing child node.
```this``` will refer to the parent node (the list), not the child (which is not intended!).
So in case we send a delete to ```/user/{uid}/incoming_invitation/{IdOfExistingChild}```,
```this``` will be ```null``` in one case and ```{ [ ... other children, null ] }```
in the other case. (```prior(this)``` will be ```!= null``` in both cases.)

This is how delete is evaluated:

```
incoming_invitation (has TWO children):
  delete( true ) => write() { prior(this) != null && this == null && true }
  delete( true ) => write() { true && false && true }
  delete( true ) => write() { false }

outgoing_invitations (has ONE child):
  delete( true ) => write() { prior(this) != null && this == null && true }
  delete( true ) => write() { true && true && true }
  delete( true ) => write() { true }
```

So the true meaning of

```
path /user/{uid}/incoming_invitations is UserIncomingInvitation[] {
  delete(true)
}
```

is:

**Only allow deletion, if the list has exactly one child**


The same is true for:

update(): **Allow to change anything (also other children) if expression is true** and
create(): **Becomes irrelavant, always true, when update is true**

```
incoming_invitation (has TWO children):
  create() { true }  write() { false }
  update() { true }  write() { true }

outgoing_invitations (has ONE child):
  create() { true }  write() { false }
  update() { true }  write() { true }
```
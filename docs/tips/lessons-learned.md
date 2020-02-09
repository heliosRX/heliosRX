
# Lessons learned

### Question: Why does delete sometimes work and sometimes not?

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

### Answer

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
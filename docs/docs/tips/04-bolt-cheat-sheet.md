# Bolt Cheat Sheet

### Syntax

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

### Functions
```
function isUser(uid) { auth != null && auth.uid == uid }
```

### String Methods
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

### DB Refs
```
ref.child           - Returns the property `child` of the reference.
ref[s]              - Return property referenced by the string, variable, `s`.
ref.parent()        - Returns the parent of the given refererence
                      (e.g., ref.prop.parent() is the same as ref).
prior(this)         - Value of `this` before the write is completed.
prior(this.prop)    - Value of a property before the write is completed.
key()               - The (text) value of the inner-most parent property of the current location.
```

- Source: [https://github.com/FirebaseExtended/bolt/blob/master/docs/language.md](https://github.com/FirebaseExtended/bolt/blob/master/docs/language.md)
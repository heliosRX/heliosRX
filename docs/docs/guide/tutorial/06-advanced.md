# Advanced topics

## Custom types

HeliosTypes are:

```ts
type ServerTimestamp extends Number
type CurrentTimestamp extends ServerTimestamp
type InitialTimestamp extends ServerTimestamp
type Timestamp extends Number
type PastTimestamp extends Number
type FutureTimestamp extends Number
type AnyID extends String
type PushID extends String
type SlugID extends String
type UserID extends String
type MemberID extends String
type ReasonableDate extends Number
type DDMMYYYYDate extends String
type YYMMDDDate extends String
type BooleanYYMMDDDate extends String
type ISODate extends String
type ReasonableYear extends String
type Domain extends String
type EMail extends String
type InvitationCode extends String
type Counter extends Number
type JSON extends String
type Point2D
type FontSettings
type TemplateRepeat extends Number
```

## Custom functions

```js
// Checks if user is a specific (authenticated) user
function isUser(uid) { auth != null && auth.uid == uid }
function isConfirmedUser(uid) { auth != null && auth.uid == uid }

//
function isSignedIn() { auth != null }

// Check if user has custom claim 'admin' (not to be confused with 'admin sdk' access)
function isAdmin() { auth.token.admin === true }

// Check if user has custom claim 'admin'
function isDeveloper() { auth.token.developer === true || isAdmin() }

// Check if user has custom claim 'support'
function isSupport() { auth.token.support === true || isAdmin() || isDeveloper() }

// Check if user has a premium subscription
function isPremiumUser() { auth.token.premium === true }

// Check if user is a free user
function isFreeUser() { !auth.token.premium }

// Check if emails is verified
function emailVerified() { auth.token.email_verified === true }
```

## Database structure

### DB Structure

![db_tree_structure](./img/db_tree_structure.png "Goalpilot DB Structure")

### Relationship Diagram

![db_relationship_diagram](./img/db_relationship_diagram.png "Goalpilot DB Relationship Diagram")

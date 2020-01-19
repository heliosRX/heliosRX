# Designing Good Security Rules

Let's say we want to save messages in groups. There are different ways how this can be archived with Firebase Realtime Database. The following list gives an overview of the pros and cons of each approach.

Good Design requires that you think about how your data will be used in advance!
Each approach has different pros and cons regarding flexibility, security rules, amount of data traffic, amount of stored data,
complexity of client, sharding.

<!-- ANALOGIE: 2 slots für suche -->

## Nested data

``` typescript
/group/{groupId}/message/{messageId} is {
  createdAt: ServerTimestamp,
  title: String,
}
```

**Advantage**:
- Simple data fetching / subscription (`$models.group.subscribeNode(groupId)`) = fast
- Server only has to manage one subscription
- Simple security rules (just grant access to `/group/{groupId}`)

**Disadvantage**:
- Grant access to single message complicated
- We have to know `groupId`

## Flat / de-normalized data

``` typescript
/group/{groupId} {
}

/message/{messageId} is {
  createdAt: ServerTimestamp,
  groupId: PushId,
  title: String,
}
```

**Advantage**:
- Less nested data
- Sharding friendly
- Easy sharing of access to data between groups

**Disadvantage**:
- We have to do a `subscribeQuery`
- We'll lose one sort key, filtering by another criterion is not possible anymore (e.g. give me all messages from group X, that are also newer than date Y).

## Multi-ID-Key

``` typescript
/message/{groupId-messageId}/ is { ... }
```

**Advantage**:
- Multiple sort keys possible (more than 2)

**Disadvantage**:
- Sorting must be defined a priori


## Time sectioned

``` typescript
/group/{groupId}/year/{year}/message/{messageId} is {
  title: String
}
```

**Advantage**:
- Easy fetching of time sections
- Easy archives of old data (just grab `/group/{groupId}/year/2019`, dump to json and delete node)

**Disadvantage**:
- Loading multiple years requires multiple subscriptions
- Difficult to manage time ranges (e.g. show years 2010 to 2020)

## Data duplication

``` typescript
/group/{groupId}/message/{messageId} is {
  cachedCreatedAt: ServerTimestamp,
  cachedTitle: String,
}

/message/{messageId} is {
  createdAt: ServerTimestamp,
  groupId: PushId,
  title: String,
}
```

**Advantage**:
- Best of approach 1 and 2 (one subscription/fast data + easy sharing/sharding)

**Disadvantage**:
- Managing data in two places
- Data can become inconsistent

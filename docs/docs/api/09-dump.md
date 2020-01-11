---
meta:
  - name: description
    content: Displaying Tweets
  - name: keywords
    content: vuepress vue component twitter tweet
---

# \_\_ignore\_\_

The generic store provides a unified API to the database.
Create store with different UID method.

# Markdown Testing

- `$registy`
- `$api`
- `$models`
- `$db`

::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::

::: tip Details
This is a details block, which does not work in IE / Edge
:::

::: tip
Sync-Implementation is based on
[vuexfire](https://github.com/vuejs/vuefire/blob/master/packages/vuexfire/src/index.js)
:::

| Param                     | Type                | Description  |
| ------------------------- | ------------------- | ------------ |
| templatePath              | `string`            | Path where the resource is stored.
| modelDefinition           | `ModelDefinition`    | Model definition.
| options.uidMethod         | `string`            | See [UIDMethod](./00-database#UIDMethod)
| options.defaultDeleteMode | `string`            | deleteMode.SOFT or deleteMode.HARD (default), see [deleteMode](./00-database#DeleteMode)

```js
storeA = GenericStore('/goal/{goalId}/user_list/{uid}/task_names/*')
storeB = GenericStore('/goal/{goalId}/user_list/{uid}/task_details/*')
storeC = GenericStore('/goal/{goalId}/user_list/{uid}/task_end_dates/*')

let superStore = SuperStore([storeA, storeB, storeC])
superStore.batchMove( id, contextA, contextB )
```

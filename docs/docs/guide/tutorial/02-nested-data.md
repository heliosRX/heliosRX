# Dealing with nested data

Imagine your data is nested like this:

```
/project/{projectId}/user/{userId}/task/{taskId}
```

heliosRX provides a straight forward API to deal with this.

```js
this.$models.task
  .with({ projectId: '-Lw_jBKRh5qNcdCG-GYM' })
  .add({
    title: "My task"
  })
```

The `userId` is automatically infered from the currently authenticated user,
if not given. So the example above is the same as (assumg the current user is
  `Qz3p2fpvTyeje5As3WDfgQtTCEK2`)


```js
this.$models.task
  .with({
    projectId: '-Lw_jBKRh5qNcdCG-GYM',
    userId: 'Qz3p2fpvTyeje5As3WDfgQtTCEK2'
  })
  .add({
    title: "My task"
  })
```


### User id

### xxx

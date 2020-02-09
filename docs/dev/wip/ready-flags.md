# Ready flags

::: warning Work in Progress (06/02/2020)
This section is still a work in progress. It will be updated soon.
:::

```vue
<template>
  <div v-if="$ready_tasks">
    ...
  </div>
</template>

<script>
import { TASKS } from '@/ready-symbols'
export default {
  computed: {
    ...mapReady('tasks', 'user', TASKS)
  }
}
</script>
```

```js
import { set_ready } from 'heliosrx/ready'

...
set_ready('foobar')
```


```js
import { FOOBAR } from '@/ready-symbols'
import { set_ready, rem_ready } from 'heliosrx/ready'

...
set_ready( FOOBAR )
...
rem_ready( FOOBAR )
```

- TODO: Move to `$ready.*`
- TODO: Publish as plugin `@heliosrx/ready`, `@heliosrx/auth`
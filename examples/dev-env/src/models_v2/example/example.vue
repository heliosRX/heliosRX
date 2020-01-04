<template>
  <div>
    <example task="task" /> <!-- requires PoC -->
  </div>
</template>

<script>
export default {
  props: {
    goalId: {},
    taskId: {},
    userId: {},
  },
}
</script>

<script>
export default {
  props: {
    task: {
      type: TaskModel,
    }
  }
}
</script>

<script>
export default {
  model: {
    task: {
      type: TaskModel,
      with: { goaldId: 1 },
    }
  },
  props: {
  },
  created() {
    // inject this into subscribe, attach to onDestroy
    this.$model.example.subscribe()
  }

}
</script>
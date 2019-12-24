<template>
  <div :style="'padding: ' + padding + ' 0'"></div>
</template>

<script>
export default {
  props: {
    padding: {
      type: String,
      default: '2rem',
    }
  }
}
</script>

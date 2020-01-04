<template>
  <div>
    <el-card class="m-2">
      <TestGetters1 />
    </el-card>
    <el-card class="m-2">
      <TestGetters2 />
    </el-card>
  </div>
</template>

<script>
import TestGetters1 from './Experiments/TestGetters1'
import TestGetters2 from './Experiments/TestGetters2'

export default {
  data: () => ({
  }),
  created() {
  },
  computed: {
  },
  components: {
    TestGetters1,
    TestGetters2,
  }
};
</script>

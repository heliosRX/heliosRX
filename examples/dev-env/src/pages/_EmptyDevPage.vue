<template>
  <div>
    <AdminMenu />

    <el-card class="m-2">
      <div slot="header">
        <h3 class="m-0">Admin Tool: ...</h3>
      </div>
    </el-card>
  </div>
</template>

<script>
// import GenericStore from '@/generic_api/lib/generic_store/GenericStore'
// import generic_store_list from '@/generic_api'
import AdminMenu from './Elements/AdminMenu'

export default {
  data: () => ({
  }),
  created() {
  },
  computed: {
  },
  components: {
    AdminMenu
  }
};
</script>

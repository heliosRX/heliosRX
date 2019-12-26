<template>
  <div>
    <el-menu :default-active="active_menu_id" mode="horizontal" class="hamburger-spacer" @select="onMenuSelect">
      <el-menu-item index="GenericAPI">Generic API</el-menu-item>
      <el-menu-item index="AsyncGetter">Async Getters (PoC)</el-menu-item>
      <el-menu-item index="Registry">Registry</el-menu-item>
      <!-- <el-menu-item index="GetterTests">Getters</el-menu-item> -->
      <el-menu-item index="BypassWriting">Bypass Writing</el-menu-item>
      <el-menu-item index="SubscribeQuery">Subscribe Query</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  computed: {
    active_menu_id() {
      return this.$route.name;
    },
  },
  methods: {
    onMenuSelect(id) {
      console.log("onMenuSelect", id);
      let routes = {
        'GenericAPI':      '/dev/generic-api',
        'AsyncGetter':     '/dev/async-getter',
        'Registry':        '/dev/registry',
        'GetterTests':     '/dev/getter-tests',
        'BypassWriting':   '/dev/bypass-writing',
        'SubscribeQuery':  '/dev/subscribe-query',
      }
      this.$router.push( routes[ id ] )
    },
  }
}
</script>

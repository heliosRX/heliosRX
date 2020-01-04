<template>
  <div>
    <el-menu :default-active="active_menu_id" mode="horizontal" class="hamburger-spacer" @select="onMenuSelect">
      <el-menu-item index="Home"><strong>heliosRX Dev Env</strong></el-menu-item>
      <el-menu-item index="GenericAPI">Generic API</el-menu-item>
      <el-menu-item index="AsyncGetter">Async Getters</el-menu-item>
      <el-menu-item index="Registry">Registry</el-menu-item>
      <el-menu-item index="BypassWriting">Bypass Writing</el-menu-item>
      <el-menu-item index="SubscribeQuery">Subscribe Query</el-menu-item>
      <el-menu-item index="Experiments">Experiments</el-menu-item>
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
        'Home':            '/',
        'GenericAPI':      '/generic-api',
        'AsyncGetter':     '/async-getter',
        'Registry':        '/registry',
        'BypassWriting':   '/bypass-writing',
        'SubscribeQuery':  '/subscribe-query',
        'Experiments':     '/experiments',
      }
      this.$router.push( routes[ id ] )
    },
  }
}
</script>

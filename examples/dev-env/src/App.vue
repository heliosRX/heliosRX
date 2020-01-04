<template>
  <div id="app">
    <AdminMenu />
    <router-view class="view"></router-view>
  </div>
</template>

<script>
import AdminMenu from './components/AdminMenu';
export default {
  name: 'app',
  components: {
    AdminMenu,
  }
}
</script>

<style>
body {
  /*border: 1em solid black;*/
  padding: 0;
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}
</style>

<template>
  <div class="dbr">
    value: <a href="#" @click.prevent="value = value ? 0 : 1">{{value}}</a> |
    mygetter3: {{mygetter3}}
    <a href="#" @click.prevent="printDeps">printDeps</a>
  </div>
</template>

<script>
export default {
  data: () => ({
    value: 0,
  }),
  computed: {
    mygetter0() {
      console.log("mygetter0")
      return ['A', 'B', 'C']
    },

    mygetter1() {
      console.log("mygetter1")
      if ( this.value === 1 ) {
        return this.mygetter0;
      }
      return []
    },

    mygetter2() {
      console.log("mygetter2")
      if ( this.value === 1 ) {
        return this.mygetter0;
      }
      return null
    },

    mygetter3() {
      console.log("mygetter3")
      return [].concat(this.mygetter1, this.mygetter2 || [])
    },
  },
  methods: {
    printDeps() {
      console.log(this._computedWatchers)
      console.log(this._watcher)
      console.log(this._watchers)
    }
  }
}
</script>

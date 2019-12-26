<template>
  <div class="dbr">
    value: <a href="#" @click.prevent="value = value ? 0 : 1">{{value}}</a> |
    mygetter3: {{mygetter3}} |
    mygetter4: {{mygetter4}}
  </div>
</template>

<script>
export default {
  data: () => ({
    value: 0,
  }),
  computed: {
    mygetter1() {
      console.log("mygetter0 -> Do something with value", this.value)
      return null
    },

    mygetter2() {
      console.log("mygetter1 -> Do something with value", this.value)
      return []
    },

    mygetter3() {
      console.log("mygetter3 -> Do somthing with mygetter1")
      return this.mygetter1 == null ? 'A' : 'B';
    },

    mygetter4() {
      console.log("mygetter4 -> Do somthing with mygetter2")
      return this.mygetter2.length === 0 ? 'A' : 'B';
    },
  },
}
</script>

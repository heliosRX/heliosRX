<template>
  <div class="demo1" v-if="ready">
    <ul>
      <li v-for="example in exampleList" :key="example.$key">
        {{example.name}}
        <a href="#" @click.prevent="onDeleteItem( example.$id )">del</a> |
        <a href="#" @click.prevent="onUpdateItem( example.$id )">upd</a>
      </li>
    </ul>
    <input v-model="input" />
    <button @click="onAddItem">Add Item</button>
    <pre>debug: {{debug}}</pre>
    <pre>debug.res.example: {{debug.res.example}}</pre>
    <pre>exampleList: {{exampleList}}</pre>
    {{onRender()}}
  </div>
</template>

<script>
export default {
  data() {
    return {
      ready: false,
      input: "",
    }
  },
  watch: {
    debug: {
      handler() {
        console.log("WATCH ---- debug")
      },
      deep: true,
    },
    exampleList: {
      handler() {
        console.log("WATCH ----")
      },
      deep: true,
    }
  },
  mounted() {
    this.ready = true;
    // setTimeout(() => {
    //   this.ready = true;
    // }, 2000)
  },
  computed: {
    exampleList() {
      let x = this.$models.example.subscribeList();
      // x.$promise.then(() => {
        // console.log("XXXXXXX", x.itemsAsArray());
      // });
      return x.items;
    },
    debug() {
      return this.$api.get_registry().state;
    }
  },
  methods: {
    onRender() {
      console.log("render")
    },
    onAddItem() {
      this.$models.example.add({ name: this.input || "Foobar" });
    },
    onDeleteItem( id ) {
      this.$models.example.remove( id );
    },
    onUpdateItem( id ) {
      let name = prompt("Enter new title:");
      this.$models.example.update( id, { name: name } );
    },
  }
}
</script>

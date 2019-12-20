<template>
  <div class="demo3">
    <pre>{{example}}</pre>
    <a href="#" @click.prevent="onUpdateItem( example.$id )">upd</a> |
    <a href="#" @click.prevent="onTest1()">test1</a> |
    <a href="#" @click.prevent="onTest2()">test2</a> |
    <a href="#" @click.prevent="onTest3()">test3</a> |
    <pre>debug.initialized: {{debug.initialized}}</pre>
    <pre>debug: {{debug}}</pre>
    <pre>debug.res.example: {{debug.res.example}}</pre>
    <pre>example: {{example}}</pre>
    {{onRender()}}
  </div>
</template>

<script>
const node_id = '-LwHe6PmSTVyCWQdb-Pl';

export default {
  data() {
    return {
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
    example: {
      handler() {
        console.log("WATCH ----")
      },
      deep: true,
    }
  },
  mounted() {
  },
  computed: {
    example() {
      return this.$models.example.subscribeNode( node_id );
    },
    debug() {
      return this.$api.get_registry().state;
    }
  },
  methods: {
    onRender() {
      console.log("render")
    },
    onUpdateItem( id ) {
      let name = prompt("Enter new title:");
      if ( name ) {
        this.$models.example.update( id, { name: name } );
      }
    },
    onTest1() {
      let registry = this.$api.get_registry();
      console.log("registry", registry);
      registry.commit('SET_ENTRY_STATUS', {
        name: '/example/-LwHe6PmSTVyCWQdb-Pl',
        value: Math.random()
      });
    },
    onTest2() {
      let registry = this.$api.get_registry();
      console.log("registry", registry);
      // registry.commit('SET_GLOBAL_READY_STATE', {
      //   name: 'test',
      //   value: true,
      // });
      registry.commit('INIT_REGISTRY');
    },
    onTest3() {
      let registry = this.$api.get_registry();
      console.log("registry", registry);
      registry.commit('RESET_REGISTRY');
    },
    // onUpdateItem2() {
    //   this.example.foo = "bar";
    //   this.example.save()
    // }
  }
}
</script>

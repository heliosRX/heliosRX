<template>
  <div class="demo2">
    <ul>
      <li v-for="task in list" :key="task.$key">
        {{task.name}}
        <a href="#" @click.prevent="onDeleteItem( task.$id )">del</a> |
        <a href="#" @click.prevent="onUpdateItem( task.$id )">upd</a>
      </li>
    </ul>
    <ul>
      <li v-for="(tweet, index) in tweets" :key="tweet.id">
        {{tweet.name}}
        <a href="#" @click.prevent="onDeleteTweet( index )">del</a> |
      </li>
    </ul>
    <input v-model="input" />
    <button @click="onAddItem">Add Item</button>
    <pre>{{debug}}</pre>
    <pre>{{list}}</pre>
  </div>
</template>

<script>
const tweets = [
  {
    id: 1,
    name: 'James',
    handle: '@jokerjames',
    img: 'https://semantic-ui.com/images/avatar2/large/matthew.png',
    tweet: "If you don't succeed, dust yourself off and try again.",
    likes: 10,
  },
  {
    id: 2,
    name: 'Fatima',
    handle: '@fantasticfatima',
    img: 'https://semantic-ui.com/images/avatar2/large/molly.png',
    tweet: 'Better late than never but never late is better.',
    likes: 12,
  },
  {
    id: 3,
    name: 'Xin',
    handle: '@xeroxin',
    img: 'https://semantic-ui.com/images/avatar2/large/elyse.png',
    tweet: 'Beauty in the struggle, ugliness in the success.',
    likes: 18,
  }
]

export default {
  data() {
    return {
      tweets: tweets,
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
    list: {
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
    list() {
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
    onDeleteTweet( index ) {
      this.tweets.splice(index, 1);
    }
  }
}
</script>

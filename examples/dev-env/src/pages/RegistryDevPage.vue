<template>
  <div class="d-flex">
    <el-card class="m-2">
      <div slot="header">
        <h3 class="m-0">Admin Tool: Registry</h3>
      </div>
      <el-button @click="onLoadData">Subscribe</el-button>
      <el-button @click="onLoadDataGlobalAPI">Subscribe (global API)</el-button>
      <pre>{{result}}</pre>
      <pre>aggregated_timeslot_collection_hours: {{$models.example.aggregated_timeslot_collection_hours}}</pre>
    </el-card>

    <el-card class="m-2">
      <div slot="header">
        <h4>Full state</h4>
      </div>
      <pre>{{full_state}}</pre>
      table here
    </el-card>

    <el-card class="m-2">
      <h4>Class + Observer</h4>
      <el-button @click="onObserverTest">Test</el-button>
      <pre>{{myinstance}}</pre>
      <pre>g: {{myinstance ? myinstance.g : '...'}}</pre>
    </el-card>

    <el-card class="m-2">
      <h4>Subscription List</h4>
      <el-button @click="onGetSubscriptionList">Get Subscription List</el-button>
      <pre>{{subscription_list}}</pre>
    </el-card>

  </div>
</template>

<script>
import Vue from 'vue'

export default {
  data: () => ({
    result: null,
    myinstance: null,
    subscription_list: null
  }),
  created() {
  },
  computed: {
    full_state() {
      return this.$models.example.getRegistryState();
    }
  },
  methods: {
    onLoadData() {
      let exampleList = this.$models.example.subscribeList();
      console.log("exampleList", exampleList);
      this.result = exampleList;
    },
    onLoadDataGlobalAPI() {
      this.result = this.$db.subscribeList( this.$models.example )
      console.log("exampleList", this.result);

      let exampleItem = this.$db.new( this.$models.example )
      console.log("exampleItem", exampleItem);
    },
    onObserverTest() {
      class MyClass {
        constructor() {
          this.a = 1;
          this.b = 2;
        }

        foo() {
          return "bar"
        }

        get g() {
          return this.a + this.b;
        }
      }
      let myinstance = new MyClass();
      Vue.observable(myinstance)

      console.log("myinstance", myinstance);
      this.myinstance = myinstance;
    },
    onGetSubscriptionList() {
      this.subscription_list = this.$db.getGlobalSubscriptionList();
    }
  },
  components: {
  }
};
</script>

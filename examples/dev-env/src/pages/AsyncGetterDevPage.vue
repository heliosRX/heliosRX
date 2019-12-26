<template>
  <div>
    <AdminMenu />

    <el-card class="m-2">
      <div slot="header">
        <h3 class="m-0">Proof of concept: Async Getters</h3>
      </div>

      <el-row :gutter="20">
        <el-col :span="8">

          <div v-if="goals.$ready">
            <ol>
              <li v-for="(goal, goalId) in goals.items" :key="goal.$key">
                {{goalId}}: <strong>{{goal.name}}</strong>
              </li>
            </ol>
          </div>
          <div v-else>
            Loading...
          </div>
          <pre>Goals: {{goals}}</pre>

        </el-col>
        <el-col :span="8">

          a (validation: length &leq; 30): <el-input v-model="new_goal.a" />
          b: <el-input v-model="new_goal.b" />
          <el-button @click="onAddData" :disabled="!new_goal.$isValid()">Add data</el-button>
          <pre>new_goal: {{new_goal}}</pre>

        </el-col>
        <el-col :span="8">

          <pre>oneGoal: {{oneGoal}}</pre>
          Direct access oneGoal.a: <strong>{{oneGoal.a}}</strong><br />
          Direct access oneGoal.b: <strong>{{oneGoal.b}}</strong><br />

          <el-button @click="onUpdateData(false)">Invalid update a</el-button>
          <el-button @click="onUpdateData(true)">Valid update a</el-button>

          <hr>
          myGetter: <pre>{{myGetter}}</pre>
          myGlobalGetter: <pre>{{myGlobalGetter}}</pre>
          myFoobarGetter: <pre>{{myFoobarGetter}}</pre>
          myMagicGetter: <pre>{{myMagicGetter}}</pre>

          <h5>Caching test</h5>
          myGetter: <pre>{{myGetter}}</pre>
          myGlobalGetter: <pre>{{myGlobalGetter}}</pre>
          myFoobarGetter: <pre>{{myFoobarGetter}}</pre>
          myGetterCacheTest: <pre>{{myGetterCacheTest}}</pre>
        </el-col>
      </el-row>

    </el-card>
  </div>
</template>

<script>
import AdminMenu from './Elements/AdminMenu'
// import { fake_models, fake_db } from './Elements/AsyncGetterProofOfConcept'
// import { fake_models, fake_db } from './Elements/RegistryProofOfConcept'
import { fake_models, fake_db } from './Elements/VuexProofOfConcept'

export default {
  data: () => ({
    new_goal: null
  }),
  created() {
    this.$models2 = fake_models;
    this.$db2 = fake_db;
    this.goal = this.$models2.goal_meta.require({ goalId: 1 });
    this.new_goal = this.$models2.goal_meta.new();
  },
  // errorCaptured: function (err, vm, info) { return API.errorHandler( err, vm, info, this.new_goal ) },
  computed: {
    goals() {
      let goals = this.$models2.goal_meta.requireAll();
      // goals.customAction();
      // let goals = { '$ready': false };
      return goals
    },
    oneGoal() {
      // return this.$models.goal_meta.require({ goalId: 1 });
      return this.goal;
    },
    myGetter() {
      return this.$models2.timeslot_collection.aggregated_timeslot_collection_hours;
    },
    myGlobalGetter() {
      // return this.$store.my_global_getter();
      return this.$models2.timeslot_collection.my_global_getter;
    },
    myFoobarGetter() {
      return this.$models2.foobar.test_getter2;
    },
    myGetterCacheTest() {
      let r1 = this.$models2.timeslot_collection.aggregated_timeslot_collection_hours;
      let r2 = this.$models2.timeslot_collection.my_global_getter;
      let r3 = this.$models2.foobar.test_getter2;
      let r4 = this.$models2.magic_store.dynamic_custom_getter;
      return r1 + r2 + r3 + r4;
    },
    myMagicGetter() {
      return this.$models2.magic_store.dynamic_custom_getter;
    }
  },
  methods: {
    onAddData() {
      // let new_goal = this.$models.goal_meta.new();
      // new_goal.a = 'ABC'
      // new_goal.a = 'XYZ'
      // new_goal.customAction();
      this.new_goal.customAction();
    },

    onUpdateData(valid) {
      // let goal = this.$models.goal_meta.require({ goalId: 1 });
      if ( valid ) {
        this.goal.a = 'Hello World';
      } else {
        this.goal.a = '0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789';
      }
      this.goal.write();
    }
  },
  components: {
    AdminMenu
  }
};
</script>

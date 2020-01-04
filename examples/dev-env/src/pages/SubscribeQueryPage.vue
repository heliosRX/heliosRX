<template>
  <div class="subscribe-query-page">
    <div class="p-4">
      <!--
      <el-button size="small">SYNC</el-button>
      <el-button size="small">UNSYNC</el-button>
      -->
      <!-- <el-button @click="mode = mode === 1 ? 2 : 1">Toggle</el-button> -->

      <el-row :gutter="10" v-if="mode === 1 && false">
        <el-col :span="8">
          <!-- <h5>unfinished_tasks_db_query2</h5> -->
          <h5>finished === false</h5>
          <div>#{{dayplanner_unfinished_tasks_db_query2.length}}</div>
          <!-- <pre class="mini-pre">{{dayplanner_unfinished_tasks_db_query2}}</pre> -->
          <div v-for="item in dayplanner_unfinished_tasks_db_query2"
            :key="item.$key"
            class="block">
            <pre>{{item.$id}}: {{item}}</pre>
            <!-- <pre>{{item.$id}}: {{item.finished}}</pre> -->
            <a href="#" @click.prevent="onUpdateDayplanerTask( item )">UPD</a>
          </div>
        </el-col>
        <el-col :span="8">
          <!-- <h5>unfinished_tasks_db_query</h5> -->
          <h5>'f' > filterIndex > 'f{{filterDate}}'</h5>
          <div>#{{dayplanner_unfinished_tasks_db_query.length}}</div>
          <!-- <pre class="mini-pre">{{dayplanner_unfinished_tasks_db_query}}</pre> -->
          <div v-for="item in dayplanner_unfinished_tasks_db_query"
            :key="item.$key"
            class="block">
            <pre>{{item.$id}}: {{item}}</pre>
            <!-- <pre>{{item.$id}}: {{item.finished}}</pre> -->
            <a href="#" @click.prevent="onUpdateDayplanerTask( item )">UPD</a>
          </div>
        </el-col>
        <el-col :span="8">
          <!-- <h5>tasks_from_db_query</h5> -->
          <h5>dateString > '{{filterDatePast}}'</h5>
          <div>#{{dayplanner_tasks_from_db_query.length}}</div>
          <!-- <pre class="mini-pre">{{dayplanner_tasks_from_db_query}}</pre> -->
          <div v-for="item in dayplanner_tasks_from_db_query"
            :key="item.$key"
            class="block">
            <pre>{{item.$id}}: {{item}}</pre>
            <!-- <pre>{{item.$id}}: {{item.finished}}</pre> -->
            <a href="#" @click.prevent="onUpdateDayplanerTask( item )">UPD</a>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="10" v-if="mode === 2">
        <el-col :span="4">
          <h5>subscribeNode</h5>
          <div class="block" :style="item2style(exampleNode)">
            <pre>{{exampleNode.$state}}</pre>
            <a href="#" @click.prevent="onUpdate( exampleNode.$id )">UPD</a>
          </div>
        </el-col>

        <el-col :span="5">
          <h5>subscribeList</h5>
          <el-button size="small" @click="onClickAdd(0)">ADD</el-button>
          <div>#{{exampleList0.length}}</div>
          <div v-for="item in exampleList0"
            :key="item.$key"
            class="block"
            :style="item2style(item)">
            <pre>{{item.$id}}:{{item.$state}}</pre>
            <a href="#" @click.prevent="onDelete( item.$id )">DEL</a> |
            <a href="#" @click.prevent="onUpdate( item.$id )">UPD</a>
          </div>
          <!-- <pre class="mini-pre">{{exampleList0}}</pre> -->
        </el-col>

        <el-col :span="5">
          <h5>subscribeQuery: someNumber &geq; 0.5</h5>
          <el-button size="small" @click="onClickAdd(1)">ADD</el-button>
          <div>#{{exampleList1.length}}</div>
          <div v-for="item in exampleList1"
            :key="item.$key"
            class="block"
            :style="item2style(item)">
            <pre>{{item.$id}}:{{item.$state}}</pre>
            <a href="#" @click.prevent="onDelete( item.$id )">DEL</a> |
            <a href="#" @click.prevent="onUpdate( item.$id )">UPD</a>
          </div>
          <!-- <pre class="mini-pre">{{exampleList1}}</pre> -->
        </el-col>

        <el-col :span="5">
          <h5>subscribeQuery: someNumber &leq; 0.5</h5>
          <el-button size="small" @click="onClickAdd(2)">ADD</el-button>
          <div>#{{exampleList2.length}}</div>
          <div v-for="item in exampleList2"
            :key="item.$key"
            class="block"
            :style="item2style(item)">
            <pre>{{item.$id}}:{{item.$state}}</pre>
            <a href="#" @click.prevent="onDelete( item.$id )">DEL</a> |
            <a href="#" @click.prevent="onUpdate( item.$id )">UPD</a>
          </div>
          <!-- <pre class="mini-pre">{{exampleList2}}</pre> -->
        </el-col>

        <el-col :span="5">
          <h5>subscribeQuery: 0.25 &leq; someNumber &leq; 0.75</h5>
          <el-button size="small" @click="onClickAdd(3)">ADD</el-button>
          <div>#{{exampleList2.length}}</div>
          <div v-for="item in exampleList3"
            :key="item.$key"
            class="block"
            :style="item2style(item)">
            <pre>{{item.$id}}:{{item.$state}}</pre>
            <a href="#" @click.prevent="onDelete( item.$id )">DEL</a> |
            <a href="#" @click.prevent="onUpdate( item.$id )">UPD</a>
          </div>
          <!-- <pre class="mini-pre">{{exampleList2}}</pre> -->
        </el-col>
      </el-row>

    </div>
  </div>
</template>

<script>
// import db from "@/generic_api/firebase/rtdb"
import Color from 'color'
import moment from 'heliosrx/src/moment'

function random() {
  return Math.round( Math.random() * 100 ) / 100;
}

export default {
  data: () => ({
    mode: 2,
  }),
  computed: {
    exampleNode() {
      return this.$models.example.subscribeNode("1234567897");
    },

    exampleList0() {
      return this.$models.example.subscribeList().itemsAsArray();
    },

    exampleList1() {
      return this.$models.example.subscribeQuery({
        key: 'someNumber',
        startAt: 0.5
      }).itemsAsArray();
    },

    exampleList2() {
      return this.$models.example.subscribeQuery({
        key: 'someNumber',
        endAt: 0.5
      }).itemsAsArray();
    },

    exampleList3() {
      return this.$models.example.subscribeQuery({
        key: 'someNumber',
        startAt: 0.25,
        endAt: 0.75
      }).itemsAsArray();
    },

    /* dayplanner_tasks_from_db_query() {
      let startAt = moment.currentDate().clone().subtract(5,'day').format('YYMMDD').toString()
      return this.$models.userDayplannerTasks.subscribeQuery({
        key: "dateString",
        startAt: startAt,
        limit: 10000
      }).itemsAsArray()
    },

    dayplanner_unfinished_tasks_db_query() {
      return this.$models.userDayplannerTasks.subscribeQuery({
        key: "filterIndex",
        startAt: 'f',
        endAt: 'f' + moment.currentDate().subtract(1,'day').format('YYMMDD'),
        limit: 10000
      }).itemsAsArray()
    },

    dayplanner_unfinished_tasks_db_query2() {
      return this.$models.userDayplannerTasks.subscribeQuery({
        key: "finished",
        value: false,
        limit: 10000
      }).itemsAsArray()
    }, */

    filterDatePast() {
      return moment.currentDate().clone().subtract(5,'day').format('YYMMDD').toString()
    },

    filterDate() {
      return moment.currentDate().subtract(1,'day').format('YYMMDD');
    },

  },
  methods: {
    onClickAdd(type) {
      let num = random();
      if (type === 1) {
        num += 0.5;
      }
      if (type === 2) {
        num -= 0.5;
      }
      if (type === 3) {
        num = num * 0.5 + 0.25;
      }
      this.$models.example.add({
        name: "TEST:" + type,
        someNumber: num
      })
    },
    onDelete(id) {
      if ( id === '1234567897' ) {
        console.log("NOT ALLOWED")
        return;
      }
      this.$models.example.remove(id);
    },
    onUpdate(id) {
      this.$models.example.update(id, {
        someNumber: random()
      });
    },
    onUpdateDayplanerTask(item) {
      console.log("onUpdateDayplanerTask", item)
      item.finished = !item.finished;
      item.write();
      // INFO: $dirty is updated async AFTER the data has been written!
      item.$dirty = {};
    },
    item2style( item ) {
      let color1 = (new Color("green")).desaturate(0.6).lighten(2.5).hex();
      let color2 = (new Color("red")).desaturate(0.4).lighten(0.5).hex();
      let r = item.someNumber;
      return {
        'background-color': new Color(color1).mix(new Color(color2), r),
      }
    },
  },
  components: {
  }
};
</script>

<style>
.subscribe-query-page .block {
  border: 1px solid black;
  padding: 3px;
  margin: 3px;
  border-radius: 3px;
  background-color: #eee;

  display: flex;
  justify-content: space-between;
}
.subscribe-query-page .block pre {
  font-size: 8pt;
  /* white-space: pre-line; */
  /* word-wrap: break-word; */
  /* tab-size: 0; */
  margin: 0;
}
</style>

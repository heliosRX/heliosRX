<template>
  <div class="bypass-writing-page">
    <AdminMenu />
    <div class="p-4">

      <el-row>
        <el-col :span="12">
          <h4>Bypass</h4>
          {{renderLoop()}}
          <div class="d-flex flex-wrap">
            <div
              v-for="item in examples"
              :key="item.$key"
              class="block">
              <!-- {{item.a}} | {{item.b}} -->
              {{item.someNumber || '?'}}
            </div>
          </div>
          <div class="d-flex flex-column">
            <el-button class="mt-1 ml-0" @click="onBatchUpdateModel1()">Batch model.write()</el-button>
            <el-button class="mt-1 ml-0" @click="onBatchUpdateModel1()">Batch model.update()</el-button>
            <el-button class="mt-1 ml-0" @click="onBatchUpdate()">Batch example.update()</el-button>
            <el-button class="mt-1 ml-0" @click="onFirebaseUpdate()">Firebase ref.update()</el-button>
          </div>
        </el-col>
        <el-col :span="12">
          <h4>No Bypass</h4>
          Always bypassing!!!
        </el-col>
      </el-row>

      <!-- <pre class="mini-pre">{{examples}}</pre> -->

      <!--
      <pre>
        WRITE MIXIN:

        add( overwrite_data, new_id, options )
        update(id, data)
        remove(id, soft_delete)
        restore( id )
        copy(id, contextA, contextB)
        move(id, contextA, contextB, { keepOriginal = false, keepId = true } = {})
        transaction( id, prop, transaction, value = 1 )

        GENERIC MODEL:

        write()
        update( payload )
        remove(soft_delete = true)
        restore()

        DB UPDATES:

        return this.childRef( new_id ).update(payload)
        return this.childRef( id ).update(payload)
        return this.parentRef.update({ [newPostKey]: payload })
        return this.parentRef.update({ [new_id]: payload })
        return this.parentRef.update(payload);
        return this.rootRef.update(payload)
        return this.rootRef.update(payload)

        return this.childRef( id ).remove()

        return targetRef.transaction(transaction)
      </pre>
      -->

    </div>
  </div>
</template>

<script>
import AdminMenu from './Elements/AdminMenu'
import db from "@/generic_api/firebase/rtdb"

export default {
  data: () => ({
    new_goal: null
  }),
  created() {
  },
  computed: {
    examples() {
      let examples = this.$models.example.subscribeList();
      return examples.itemsAsArray();
    }
  },
  methods: {
    renderLoop(item) {
      // console.log("***** RENDER LOOP *****", item.$id);
      console.log("***** RENDER LOOP *****");
    },
    // this.$models.example
    onBatchUpdateModel1() {
      this.examples.forEach(item => {
        item.b = Math.random();
        item.write().then(() => {
          console.log("done")
        })
      });
    },
    onBatchUpdateModel2() {
      this.examples.forEach(item => {
        item.update({
          someNumber: Math.random(),
          // b: Math.random(),
        }).then(() => {
          console.log("done")
        })
      });
    },
    onBatchUpdate() {
      this.examples.forEach(item => {
        this.$models.example.update( item.$id, {
          someNumber: Math.random(),
          // b: Math.random(),
        }).then(() => {
          console.log("done")
        })
      });
    },
    onFirebaseUpdate() {
      let payload = { b: 999 };
      db.ref('example/1234567897').update(payload).then((x) => {
        console.log("DONE", x)
      });
    }
  },
  components: {
    AdminMenu
  }
};
</script>

<style>
.bypass-writing-page .block {
  border: 1px solid black;
  padding: 3px;
  margin: 3px;
  border-radius: 3px;
  background-color: #eee;
}
</style>

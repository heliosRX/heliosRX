<template>
  <div>
    <el-card class="m-2">
      <div slot="header">
        <h3 class="m-0">Admin Tool: Generic API (GenericStore)</h3>
      </div>
      <h5>Select a generic store:</h5>
      <el-row :gutter="10">
        <el-col :span="4">
          <el-select
            filterable
            size="small"
            v-model="gens_selected_idx"
            placeholder="Select a generic store"
            @change="onSelectStore">
            <el-option v-for="(gens, idx) in generic_store_list"
              :key="'gens-'+idx"
              :label="idx"
              :value="idx" />
          </el-select>
        </el-col>
        <el-col :span="3">
          or create one
        </el-col>
        <el-col :span="13">
          <el-input size="small" v-model="template_path" style="font-family: monospace"></el-input>
        </el-col>
        <el-col :span="4">
          <el-button size="small" @click="createGens">Create Generic Store</el-button>
        </el-col>
      </el-row>

      <h5 class="pt-2">Define path properties:</h5>
      <el-row :gutter="10">
        <el-col :span="20">
          <el-input type="textarea" class="json-text-area" autosize v-model="define_json" style="font-family: monospace; width: 100%;"></el-input>
        </el-col>
        <el-col :span="4">
          <el-button size="small" @click="onDefine">Define Props</el-button>

          <el-button size="small" @click="onCreatePathTemplate" type="text">Template from path</el-button>
          <el-button size="small" @click="onClickUserID" type="text">Insert UID</el-button>
        </el-col>
      </el-row>

      <h5 class="pt-4">Fetch and subscribe:</h5>
      <el-row :gutter="6">
        <el-col :span="12">
          <pre class="mini-pre"><strong>{{path_preview}}</strong></pre>
        </el-col>
        <el-col :span="6">
          <el-input clearable size="small" v-model="individual_child_id" style="font-family: monospace"></el-input>
        </el-col>
        <el-col :span="6">
          <el-button-group class="btn-block w-100">
            <template v-if="!this.individual_child_id">
              <el-button size="small" @click="onListSync( false )">Sync all</el-button>
              <el-button size="small" @click="onListSync( true )">Fetch all</el-button>
            </template>
            <template v-else>
              <el-button size="small" @click="onIndividualSync( individual_child_id, false )">Sync child</el-button>
              <el-button size="small" @click="onIndividualSync( individual_child_id, true )">Fetch child</el-button>
            </template>
            <el-button size="small" @click="onOpenCreateItemModal">Add item</el-button>
            <!-- <el-dropdown size="small" split-button type="primary">
              X
              <el-dropdown-menu slot="dropdown">
               <el-dropdown-item>Y</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>  -->
          </el-button-group>
        </el-col>
      </el-row>

      <!-- TODO: Sync target -->
      <!-- TODO: Show sync status -->
      <!-- TODO: Table with all active syncs + kill button -->

      <el-tabs type="border-card">
        <el-tab-pane label="Subscriptions">
          <el-button size="small" @click="onUpdateStore">Refresh (no reactivity!)</el-button>
          <ul>
            <li
              v-for="(store, storeKey) in info.subscriptions"
              v-if="store !== null"
              :key="'store'+storeKey">
              Store: <strong>{{storeKey}}</strong> ( <a href="#" @click.prevent="onUnsubscribe( storeKey )">unsubscribe</a> )
              <ul>
                <li
                  v-for="(_, subKey) in store"
                  :key="'sub'+subKey">
                  {{subKey}}
                  <a href="#" v-if="Object.keys(store).length > 1" @click.prevent="onUnsubscribe( storeKey, subKey )">unsubscribe individual</a>
                </li>
              </ul>
            </li>
          </ul>
          <!-- <pre class="mini-pre">{{info.subscriptions}}</pre> -->
        </el-tab-pane>
        <el-tab-pane label="state.res">
          <pre class="mini-pre">{{res}}</pre>
        </el-tab-pane>
        <el-tab-pane label="state.index">
          <pre class="mini-pre">{{index}}</pre>
        </el-tab-pane>
        <el-tab-pane label="state.sync">
          <pre class="mini-pre">{{sync}}</pre>
        </el-tab-pane>
        <el-tab-pane v-if="res['res.status']">
          <span slot="label"><i class="el-icon-tickets"></i> {{'res.status'}}</span>
          <!-- <pre>{{res['res.status']|objToArray}}</pre> -->
          <!-- TODO: create inside loop !!! -->
          <!-- TODO: add item here -->
          <!-- TODO: fields based on schema -->
          <!-- TODO: closable -->
          <b-table class="admin-res-table" striped hover :items="res['res.status']|objToArray"></b-table>
          <!-- TODO: Rem item -->
          <!-- TODO: Update item -->
          <!-- TODO: Show input fields based on shema + show all items as list -->
          <el-button-group>
            <el-button size="small" @click="onUnsubscribe('status')">Unsubscribe from "res.status"</el-button>
          </el-button-group>
          <!--
          Payload JSON:
          <el-input type="textarea" class="json-text-area" autosize v-model="define_json" style="font-family: monospace; width: 100%;"></el-input>
          -->

        </el-tab-pane>
      </el-tabs>

      <el-collapse>
        <el-collapse-item title="Schema">
          <el-row :gutter="10">
            <el-col :span="16">
              <pre class="mini-pre">Schema: {{ schema_for_selected_gens.fields ? schema_for_selected_gens : 'No schema defined :-(' }}</pre>
            </el-col>
            <el-col :span="8">
              <template v-if="!this.individual_child_id">
                Required:
                <!-- TODO: Codemirror -->
                <el-input type="textarea" class="json-text-area" autosize v-model="required_input_json"></el-input>
                Optional:
                <!-- TODO: Codemirror -->
                <el-input type="textarea" class="json-text-area" autosize v-model="optional_input_json"></el-input>

                <el-button size="small" @click="onCreateTemplate" type="text">Create Routine from schema</el-button><br />
                <el-button size="small" @click="onCreateEmptyItemBasedOnSchema" class="btn-block mt-2">Create new item based on schema and console.log</el-button><br />
                <el-button size="small" @click="onWriteItemToDB" type="primary" class="btn-block mt-2">Write new item to DB</el-button><br />
              </template>
              <template v-else>
                Update item with ID: {{this.individual_child_id}}
                <el-input type="textarea" class="json-text-area" autosize v-model="update_input_json"></el-input>
                <el-button size="small" @click="onCreateTemplateUpdate" type="text">Create Routine from schema</el-button><br />
                <el-button size="small" @click="onUpdateItemToDB" type="primary" class="btn-block mt-2">Update item in DB</el-button>
              </template>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item title="Debug">
          <el-row>
            <el-col>
              <pre class="mini-pre">UID: <a href="#" @click.prevent="onClickUserID">{{userAuth.id}}</a></pre>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <pre class="mini-pre">Path Preview: <strong>{{info.preview_path}}</strong></pre>
              <el-button size="small" @click="onPrintStoreToConsole">console.log</el-button>
            </el-col>
            <el-col :span="12">
              Cyclic structure
              <!-- <pre class="mini-pre">Generic Store: {{gens_selected}}</pre> -->
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>

    </el-card>

    <el-dialog title="New item" :visible.sync="dialog_form_visible">
      <div class="panel-body">
        <!--
        <vue-form-generator
          :schema="schema_for_selected_gens"
          :model="model"
          :options="formOptions">
        </vue-form-generator>
        -->
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="onCreateItemFromForm(false)" style="float: left">Empty</el-button>
        <el-button @click="dialog_form_visible = false">Cancel</el-button>
        <el-button type="primary" @click="onCreateItemFromForm(true)">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import generic_store_list from '@/models'
import db from "heliosrx/src/global_api"; // TODO
import { GenericStore, registry } from 'heliosrx'

// import Vue from 'vue'
// import VueFormGenerator from 'vue-form-generator'
// import 'vue-form-generator/dist/vfg.css'
// Vue.use(VueFormGenerator)

// TODO: Hightlight updates (Firebase style)
// TODO: remove depency vue-form-generator from main code !!!
// TODO: Autogenerate API here from store actions

const array_to_obj_reducer = (o, key) => ({ ...o, [key]: "" });

export default {
  data: () => ({
    template_path: "/status/*",
    // gens_selected_idx: 'task_sessions',
    gens_selected_idx: 'example',
    gens_selected: null,
    individual_child_id: '',
    generic_store_list: generic_store_list,
    info: {
      preview_path: '',
      subscriptions: {}
    },
    define_json: '{}',
    required_input_json: '{}',
    optional_input_json: '{}',
    update_input_json: '{}',
    model: {},
    dialog_form_visible: false,
    formOptions: {
      validateAfterLoad: true,
      validateAfterChanged: true,
      validateAsync: true
    },
  }),
  created() {
    this.$db = db;
    this.$store = registry;
    this.onSelectStore();
  },
  mounted() {
    this.onUpdateStore();
  },
  computed: {
    /* ...mapGetters("user", [
      "userAuth"
    ]), */
    userAuth() {
      return { id: '0123456798 '};
    },
    ...mapState([
      'res',
      'sync',
      'index',
    ]),
    path_preview() {
      return this.gens_selected
              ? this.gens_selected.previewPath( this.individual_child_id || '*' )
              : '';
    },
    schema_for_selected_gens() {
      return ( this.gens_selected &&
               this.gens_selected.typeDefinition &&
               this.gens_selected.typeDefinition.schema )
            ? this.gens_selected.typeDefinition.schema
            : {};
    }
  },
  methods: {
    test2() {
      console.log("test2");
    },

    onPrintStoreToConsole() {
      console.log("GenStore", this.gens_selected);
      console.log("onListSync:", this.$store.state.res);
    },

    createGens() {
      let gs = new GenericStore( this.template_path, null )
      window.$gstest = gs;
      this.gens_selected = gs;
      console.log("GenStore", gs);
      this.onUpdateStore();
    },

    onSelectStore( idx ) {
      this.gens_selected = this.generic_store_list[ this.gens_selected_idx ];
      this.onUpdateStore();
    },

    onDefine() {
      let props = JSON.parse( this.define_json )
      this.gens_selected.define( props );
      this.onUpdateStore();
    },

    onListSync( fetchOnce ) {
      this.gens_selected._sync_list({ fetchOnce }); // fetchOnce  // TODO!!
      this.onUpdateStore();
    },

    onIndividualSync( id, fetchOnce ) {
      this.gens_selected._sync_individual( id, { fetchOnce }); // TODO!!
      this.onUpdateStore();
    },

    onUnsubscribe(store, id) {
      store = typeof store === 'string' ? this.generic_store_list[ store ] : store;
      if ( id === undefined ) {
        store.unsyncAll()
        // store.unsync()
      } else {
        store.unsync( id );
      }
      this.onUpdateStore();
    },

    onUpdateStore() {
      // "Manual reactivity"
      if (!this.gens_selected) return;
      this.info.preview_path = this.gens_selected.previewPath('<ID>'); // ??
      // this.info.subscriptions = this.gens_selected.subscriptions;
      setTimeout(() => {
        this.info.subscriptions = this.$db.getGlobalSubscriptionList();
      }, 5000)
      // console.log("this.info.subscriptions", this.info.subscriptions);
      this.$forceUpdate();
    },

    onClickUserID() {
      this.define_json = '{ "uid": "' + this.userAuth.id + '" }'; // todo: json parse/add/stringify
    },

    onCreatePathTemplate() {
      let fields = this.gens_selected._template_path_field_names;
      let obj = fields.reduce(array_to_obj_reducer, {});
      if ( 'uid' in obj ) {
        obj.uid = this.userAuth.id;
      }
      this.define_json = JSON.stringify( obj, null, '\t' )
    },

    onCreateEmptyItemBasedOnSchema() {
      // console.log("onCreateEmptyItemBasedOnSchema", this.gens_selected.typeDefinition);

      /*
      function getArgs(func) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function(arg) {
          // Ensure no inline comments are parsed and trim the whitespace.
          return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function(arg) {
          // Ensure no undefined values are added.
          return arg;
        });
      }

      let required_arguments = getArgs(this.gens_selected.typeDefinition.create);
      // remove 'data', 'BACKEND'
      */

      let required_input_json = {};
      let optional_input_json = {};

      try {
        required_input_json = JSON.parse(this.required_input_json);
        optional_input_json = JSON.parse(this.optional_input_json);
      } catch ( e ) {
        return this.$message.error('Error in JSON: ' + e);
      }

      let required_arguments = this.gens_selected.schemaRequiredFields;

      let ok = required_arguments.every(arg => ( arg in required_input_json ) )
      if (!ok) {
        this.$message.error('Not all required arguments are provided.'
                                   + 'All required arguments are '
                                   + required_arguments.join(', '));
        return;
      }

      let item = this.gens_selected.typeDefinition.create(
        required_input_json,
        optional_input_json,
        'REALTIMEDB'
      );
      console.log("Here is your item:", item);
    },

    onCreateTemplate() {
      let required_arguments = this.gens_selected.schemaRequiredFields;
      let optional_arguments = this.gens_selected.schemaOptionalFields;

      this.required_input_json = JSON.stringify(
        required_arguments.reduce(array_to_obj_reducer, {}),
        null, '\t'
      )

      this.optional_input_json = JSON.stringify(
        optional_arguments.reduce(array_to_obj_reducer, {}),
        null, '\t'
      )
    },

    onCreateTemplateUpdate() {
      let all_arguments = this.gens_selected.schemaAllFields;

      // TODO: Insert current value!
      this.update_input_json = JSON.stringify(
        all_arguments.reduce(array_to_obj_reducer, {}),
        null, '\t'
      )
    },

    onOpenCreateItemModal() {
      this.dialog_form_visible = true;
    },

    onWriteItemToDB() {
      this.gens_selected.add({
        ...JSON.parse( this.required_input_json ),
        ...JSON.parse( this.optional_input_json )
      })
    },

    onUpdateItemToDB() {
      this.gens_selected.update(
        this.individual_child_id,
        JSON.parse( this.update_input_json )
      );
    },

    onCreateItemFromForm( basedOnModel ) {
      if ( !basedOnModel ) {
        this.gens_selected.add({})
      } else {
        console.log("onCreateItemFromForm", this.model);

        this.dialog_form_visible = false;

        let item = this.gens_selected.typeDefinition.create(
          this.model, // HACK
          this.model, // HACK
          'REALTIMEDB'
        );

        console.log("Here is your item:", item);
      }
    }
  },
  filters: {
    objToArray( obj ) { // TODO move to filters
      return Object.keys(obj).map(key => {
        return { id: key, ...obj[key] };
      })
    }
  },
  components: {
  }
};
</script>

<style>
.admin-res-table td {
  padding: 0.25em;
}
.json-text-area {
   tab-size: 2;
}
.json-text-area textarea {
  padding: 2px;
  font-family: monospace;
  width: 100%;
}
</style>

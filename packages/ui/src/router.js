import Vue from 'vue'
import VueRouter from 'vue-router'

// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.

/* ============================ Development ============================ */
import IndexPage             from "@/pages/IndexPage";
import GenericAPIDevPage     from "@/pages/GenericAPIDevPage";
import AsyncGetterDevPage    from "@/pages/AsyncGetterDevPage";
import RegistryDevPage       from "@/pages/RegistryDevPage";
import BypassWritingPage     from "@/pages/BypassWritingPage";
import SubscribeQueryPage    from "@/pages/SubscribeQueryPage";
import ExperimentsPage       from "@/pages/ExperimentsPage";

const routes = []
routes.push(...[
  { path: "/",                component: IndexPage,          name: "Index"          },
  { path: "/generic-api",     component: GenericAPIDevPage,  name: "GenericAPI"     },
  { path: "/async-getter",    component: AsyncGetterDevPage, name: "AsyncGetter"    },
  { path: "/registry",        component: RegistryDevPage,    name: "Registry"       },
  { path: "/bypass-writing",  component: BypassWritingPage,  name: "BypassWriting"  },
  { path: "/subscribe-query", component: SubscribeQueryPage, name: "SubscribeQuery" },
  { path: "/experiments",     component: ExperimentsPage,    name: "Experiments"    },
]);

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes
})


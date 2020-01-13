# Migrating from v0.1 to v1.0

### Property and method names

| before                    | after
|---------------------------|---------------------------
| `new_from_template`       | `newFromTemplate`
| `new_from_data`           | `newFromData`
| `schema_required_fields`  | `schemaRequiredFields`
| `schema_optional_fields`  | `schemaOptionalFields`
| `schema_all_fields`       | `schemaAllFields`
| `sync_list`               | `_syncList`
| `sync_node`               | `_syncNode`
| `autogenerate_props`      | `_autogenerateProps`
| `decorate_actions`        | `_decorateActions`
| `decorate_getters`        | `_decorateGetters`
| `write()` - Model         | `save()`

### Schema definition

- `validate_bolt_type` -> `type`

### Setup

- New setup syntax (`Vue.use`)

**New syntax**:

```js
// file: src/main.js
import Vue from 'vue'
import heliosRX from 'heliosrx'
import api from '@/api'
import { rtdb } from './firebase' // Import realtime database
import models from "@/models"

Vue.use(heliosRX, {
  models: models,
  userApi: api, // TODO: Remove
  // TODO: rtdb: rtdb,
})

// This will change in future releases:
heliosRX.GenericStore.setDefaultDB( rtdb );
heliosRX.registry.commit('INIT_REGISTRY');

new Vue({
  render: h => h(App),
}).$mount('#app')
```

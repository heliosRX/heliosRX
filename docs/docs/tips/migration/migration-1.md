# Migrating from v0.2.0 to v1.0.0

### Property and method names (v0.2.3)

| before                    | after                     | version
|---------------------------|---------------------------|----------
| `validate_bolt_type`      | `type`                    | v0.2.3
| `new_from_template`       | `newFromTemplate`         | v0.2.3
| `new_from_data`           | `newFromData`             | v0.2.3
| `schema_required_fields`  | `schemaRequiredFields`    | v0.2.3
| `schema_optional_fields`  | `schemaOptionalFields`    | v0.2.3
| `schema_all_fields`       | `schemaAllFields`         | v0.2.3
| `sync_list`               | `_sync_list`              | v0.2.3
| `fetch_list`              | `_fetch_list`             | v0.2.3
| `sync_individual`         | `_sync_individual`        | v0.2.3
| `fetch_individual`        | `_fetch_individual`       | v0.2.3
| `autogenerate_props`      | `_autogenerate_props`     | v0.2.3
| `decorate_actions`        | `_decorate_actions`       | v0.2.3
| `decorate_getters`        | `_decorate_getters`       | v0.2.3
| `_onRemove`               | `_on_remove`              | v0.2.3
| `_itemMatchesQuery`       | `_item_matches_query`     | v0.2.3
| `_previewPath`            | `previewPath`             | v0.2.3
| `_validateId`             | `_validate_Id`            | v0.2.3
| `_defineUser`             | `_define_user`            | v0.2.3
| `write_mixin_init`        | `_write_mixin_init`       | v0.2.3
| `read_mixin_init`         | `_read_mixin_init`        | v0.2.3
| `unsync_all`              | `unsyncAll`               | v0.2.3
| `queryHash`               | `_query_hash`             | v0.2.3
| `reset_global_instance_cache`|`resetGlobalInstanceCache`| v0.2.3
| `_schema_fields`          | `schemaFields`            | v0.2.3
| `_define`                 | removed                   | v0.2.3
| `$id_list`                | `$idList`                 | v0.2.3

### Property and method names (v0.2.4) ?

| before                    | after                     | version
|---------------------------|---------------------------|----------
| `write()` - Model         | `save()`                  |
| `create` - Schema         | `template`                |

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

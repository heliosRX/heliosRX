# Logging

```js
if ( options.devMode ) {
  log.setDefaultLevel('info')
  log.setLevel('info')
} else {
  log.setDefaultLevel('warn')
  log.setLevel('warn')
}
```

```js
// Enable traces:
import { heliosLogger } from 'heliosRX'

// Disable warning
heliosLogger.getLogger( heliosLogger.channels.WARNING_DEFINE_UNKNOWN_PROP ).setLevel('silent')

// Enable warning
heliosLogger.getLogger( heliosLogger.channels.WARNING_DEFINE_UNKNOWN_PROP ).setLevel('warn')

// Enable trace / info
heliosLogger.getLogger( heliosLogger.channels.INFO_COMMON ).setLevel('trace')
```

```js
export const WARNING_DEFINE_UNKNOWN_PROP         = 'store/define-unknown-prop';
export const WARNING_RESET_MAX_DEPTH             = 'store/reset-max-depth-reached';
export const WARNING_NO_CREATE_FUNCTION          = 'model/no-create-function';
export const WARNING_INVALID_ID                  = 'model/invalid-id';
export const WARNING_EMPTY_SCHEMA                = 'model/empty-schema';
export const WARNING_UKNONWN_VALIDATION_TYPE     = 'model/unknown-validation-type';
export const WARNING_MODEL_INVALID_MOMENT        = 'model/invalid-moment';
export const WARNING_MODEL_OTHER                 = 'model/other';
export const WARNING_NO_SCHEMA                   = 'model/no-schema';
export const WARNING_NAME_CONFLICT               = 'model/no-name-conflict';
export const WARNING_CLIENT_VALIDATION           = 'model/client-validation-failed';
export const WARNING_UNKNOWN_TIMESTAMP_TYPE      = 'model/unknown-timestamp-type';
export const WARNING_WRITING_UNDEFINED           = 'model/writing-undefined';
export const WARNING_INVALID_TIMESTAMP_SERVER    = 'model/invalid-timestamp-from-server'
export const WARNING_MOMENT_INVALID_DATE         = 'moment/invalid-date';
export const WARNING_DEPRECATED                  = 'common/deprecated';
export const WARNING_COMMON                      = 'common/common';
export const WARNING_SYNCING_SUBSET_DATA         = 'read/sync-subset-data';
export const WARNING_SYNCING_INDIVIDUAL          = 'read/sync-individial-but-list-supported';
export const WARNING_SYNCING_EXISTING_QUERY_PATH = 'read/sync-existing-query-path';
export const WARNING_ACCESSING_UNSYNCED_DATA     = 'read/accessing-unsynced-data';
export const WARNING_PERMISSION_DENIED           = 'read/permission-denied';

export const INFO_COMMON            = 'common';
export const INFO_MODEL             = 'model';
export const INFO_COLLECTION        = 'collection';
export const INFO_STORE             = 'store';
export const INFO_STORE_WRITE       = 'store-write';
export const INFO_MOMENT            = 'moment';
export const INFO_REGISTRY          = 'registry';
export const INFO_DEEPMERGE         = 'deep-merge';
export const INFO_PERMISSION        = 'permission'
export const INFO_AUTO_UNSUBSCRIBE  = 'store/unsubscribe/auto';
export const INFO_SUBSCRIBE         = 'store/subscribe';
export const INFO_SUBSCRIBE_QUERY   = 'store/subscurbe/query';
export const INFO_SUBSCRIBE_DETAILS = 'store/subscribe/details';
export const INFO_READ_INIT         = 'store/subscribe/init';
export const INFO_READ_REMOVE       = 'store/unsubscribe';
```

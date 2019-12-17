import schema from './schema'
import { get_ready } from '@/api/misc' // only import get_ready to avoid circular dependency

export default {
  modelActions: {},
  modelGetters: {},
  staticGetters: {

    get_user_settings: ( $models, $registry ) => {
      if ( get_ready('user') ) { // auth?
        let userId = $models.user.defaultUserId
        return $registry.state.res.user[ userId ].settings.settings;
      }
      return null
    },

    example: ( $models, $registry, $store ) => {
      // $store.get_user_settings
    },
  },
  staticActions: {},
  schema:  schema
};

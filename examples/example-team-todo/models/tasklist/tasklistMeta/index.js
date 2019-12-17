import actions from './actions'
import schema from './schema'

export default {
  modelGetters: {
  },
  staticGetters: {

    /**
     * get_last_sortidx - returns last sortidx
     */
    get_last_sortidx: ( $models, $registry, $store ) => {

      let goal_list_user = $store.getters.all_goals_in_user_raw
      let max_sort_idx = 0;
      for ( let idx in goal_list_user ) {
        max_sort_idx = Math.max( goal_list_user[ idx ].sortidx, max_sort_idx );
      }
      return max_sort_idx + 100
    },

    registry_state_res_goal: ( $models, $registry, $store ) => {
      if ($registry.state && $registry.state.res) {
        return $registry.state.res.goal
      }
      return null
    },

    registry_state_res_user: ( $models, $registry, $store ) => {
      if ($registry.state && $registry.state.res) {
        return $registry.state.res.user
      }
      return null
    },

    $registry_state_ready: ( $models, $registry, $store ) => {
      if ($registry.state) {
        return $registry.state.ready
      }
      return null
    },

    /* Returns object (not array)!
    *
    */
    all_goals_in_user_raw: ( $models, $registry, $store ) => {

      let currentUserId = $models.user.defaultUserId;
      if ( !$store.getters.registry_state_res_user ||
           !$store.getters.registry_state_res_user[ currentUserId ] ) {
        return {};
      }

      let goal_list_user = $store.getters.registry_state_res_user[ currentUserId ].goal_settings
      return goal_list_user;
    },

    /*
    *
    */
    all_goals_without_deleted: ( $models, $registry, $store ) => {
      if ( !$store.getters.registry_state_res_goal ) {
        return [];
      }

      let goal_meta_list = Object.keys($store.getters.registry_state_res_goal).map(goalId => {

        let goal_meta = ($store.getters.registry_state_res_goal[ goalId ] || {}).meta;

        /* Check if goal exists and if we have access rights */
        if ( !goal_meta || goal_meta[ '.exists' ] === false || goal_meta[ '.noaccess' ] === true ) {
          console.log("Goal: No access or does not exist", goalId)
          return null;
        }

        return { $id: goalId, ...goal_meta };
      }).filter(goal_meta => goal_meta != null && !goal_meta.deleted)

      // console.log("goal_meta_list", goal_meta_list)
      return goal_meta_list;
    },

    /*
    */
    all_goal_ids_loaded: ( $models, $registry, $store ) => {

      // This means goal meta and goal settings are ready!
      return Object.keys($store.getters.$registry_state_ready).map(entry => {
        if ( entry.startsWith( 'goal:' ) ) {
          let goalId = entry.split(':').pop();
          return goalId
        }
      }).filter(e => e);
    },

    // TODO: Getter that filters non existing goals pre permission denied

    /*
    */
    all_goals_loaded_with_deleted: ( $models, $registry, $store ) => {
      return $store.getters.all_goal_ids_loaded.map(goalId => {
        return $models.goalMeta.getNode( goalId )
      })
      //  TODO: make_reactive_list ?
    },

    /*
    * used to be: goal_list_meta_ready_without_deleted
    * $models.goalMeta.getters.all_goals
    * TODO: move to $models.goals
    */
    all_goals_loaded: ( $models, $registry, $store ) => { // all_goals_meta_ready?
      return $store.getters.all_goal_ids_loaded.map(goalId => {
        return $models.goalMeta.getNode( goalId )
      }).filter(e => e && !e.deleted )
      // TODO: .sort(util.sorter.by_sortidx);
      // TODO: return genric list ?
    },
  },
  listGetters: {
  },
  staticActions: actions,
  schema:  schema
};

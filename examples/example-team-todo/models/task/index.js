import { NoAccessError } from '@/generic_api/lib/errors'

const log = () => {} // console.log

function get_tasklist_id( $store ) {
  if ( !( 'tasklistId' in $store.definedProps ) ) {
    throw new Error('Please define tasklistId in "with".')
  }
  return $store.definedProps[ 'tasklistId' ]
}

export default {
  abstract_store: true,

  modelGetters: {
    /* modelGetters are not supported yet in abstract stores */
  },

  modelActions: {
    /* modelActions are not supported yet in abstract stores */
  },

  listGetters: {
    /* listGetters are not supported yet in abstract stores */
  },

  listActions: {
    /* listActions are not supported yet in abstract stores */
  },

  staticGetters: {

    /**
     * get_last_sortidx - returns last sortidx
     */
    get_last_sortidx: ($models, $registry, $store) => {
      // TODO

      if ( !( 'tasklistId' in $store.definedProps ) ) {
        throw new Error('Please define tasklistId in "with".')
      }

      let tasklistId = $store.definedProps[ 'tasklistId' ]
      let laneId = $store.definedProps[ 'laneId' ]
      let userId = $models.user.defaultUserId

      let task_meta_list = $models.taskMeta
            .with({ tasklistId: tasklistId, uid: userId })
            .getList()
            .asArrayFilteredBy('laneId', laneId)

      let array = task_meta_list.items;

      if ( array.length > 0 ) {
        let last_sort_idx = array.reduce((p, v) => ( p.sortidx  > v.sortidx  ? p : v ) )
        return last_sort_idx.sortidx + 100;
      } else {
        return 100;
      }
    },

    /* lane_task_list - Get all tasks for a certain lane based on access rights
     *
     * Usage:
     * this.$models.task.with({ tasklistId }).getters.lane_task_list_current_user
     *
     */
    lane_task_list_all_users: ( $models, $registry, $store ) => {
      let tasklistId = get_tasklist_id( $store );

      let tasklist_members = $models.tasklistMember.with({ tasklistId }).getList();

      if ( !tasklist_members || !tasklist_members.$readyAll ) {
        throw new Error('Goal members not ready')
      }

      let tasklist = {}
      let task_list = $models.taskMeta
              .with({ tasklistId: tasklistId })
              .getList()

      /* Task list has not been loaded. */
      if ( task_list === null || !task_list.$readyAll ) {
        console.warn("Trying to fetch tasklist, that has not been loaded")
        continue
      }

      tasklist= task_list.asArraySorted().items;

      log("[lane_task_list_all_users] result", tasklist)
      return tasklist
    },

    /* lane_task_list - Get all tasks for a certain lane based on access rights
     *
     * Usage:
     * this.$models.task.with({ tasklistId }).getters.lane_task_list_current_user
     *
     */
    // lane_task_list({ $store, $models }, current_user_only = false ) {
    lane_task_list_current_user: ( $models, $registry, $store ) => {

      let tasklistId = get_tasklist_id( $store );
      const myUserId = $models.user.defaultUserId

      let task_list = $models.taskMeta
              .with({ tasklistId: tasklistId, uid: myUserId })
              .getList()

      /* Task list has not been loaded. */
      if ( task_list === null || !task_list.$readyAll ) {
        console.warn("Trying to fetch tasklist, that has not been loaded")
        return
      }

      let tasklist = {}
      tasklist = task_list.asArraySorted().items;

      log("[lane_task_list_current_user] result", tasklist)
      return tasklist
    },
  },

  staticActions: {

    /* get_lane_task_list - Get all tasks for a certain lane based on access rights
     *
     * Usage:
     * this.$models.task.with({ tasklistId }).get_lane_task_list()
     *
     */
    get_lane_task_list({ $store, $models }, current_user_only = false ) {

      if ( !$store.definedProps['tasklistId'] ) {
        throw new Error('Please define tasklistId in "with".')
      }

      let tasklistId = $store.definedProps[ 'tasklistId' ]

      let tasklist_members = $models.tasklistMember.with({ tasklistId }).getList();

      if ( !tasklist_members || !tasklist_members.$readyAll ) {
        throw new Error('Goal members not ready')
      }

      let promise_list = [];
      let task_list = $models.taskMeta
              .with({ tasklistId: tasklistId, uid: memberId })
              .subscribeList()

      /* Task list has alredy been loaded. This means we can diretly map the
       * results to the commitment buckets, without dealing with promises */
      if ( task_list.$readyAll ) {
        log("[get_lane_task_list] Not waiting for task_list, is ready", task_list);

        tasklist = task_list.asArraySorted().items.forEach(task => {
          let laneId = task.laneId || null;
          push_to_bucket( tasklist, task, laneId, memberId );
        })
      }

      let promiseAll = Promise.all(promise_list).then(() => {
        return tasklist;
      })

      return {
        items: tasklist,
        $promise: promiseAll
      }
    },

    /* getNodeFull - Get fullt task with access rights
     *
     * Usage:
     * this.$models.task.with({ tasklistId, memberId }).getNodeFull( taskId )
     *
     */
    getNodeFull({ $store, $models }, taskId, include_task_details = false, include_checklist = false ) {

      const log = () => {} // console.log

      if ( !( 'tasklistId' in $store.definedProps ) ) {
        throw new Error('Please define tasklistId in "with".')
      }

      let tasklistId = $store.definedProps.tasklistId;

      let task_meta = $models.taskMeta.with({
        tasklistId: tasklistId,
        uid:    memberId,
      }).subscribeNode( taskId )

      if ( include_checklist ) {
        let task_checklist_items = $models.taskChecklistItem.with({
          tasklistId: tasklistId,
          taskId: taskId,
          uid:    memberId,
        }).subscribeList()
        task_meta.checklist_items = task_checklist_items
      }

      if ( include_task_details || include_checklist) {
        task_meta.$promise = Promise.all([
          task_meta.$promise,
          (task_meta.details || {}).$promise,
          (task_meta.checklist_items || {}).$promise,
        ])
      }

      return task_meta;
    }
  },
};

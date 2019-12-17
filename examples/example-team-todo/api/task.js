import $models from '@/models'
import $store from '@/store'
import util from "@/util";
import moment from '@/moment-gp'

const $taskMeta = $models.taskMeta;
const $taskChecklistItem = $models.taskChecklistItem;

/* =========================== Helper functions ============================= */

const log = (...args) => { console.log("[API:task]", ...args) };

// TODO: MOVE TO CHECKLIST ITEM
export function get_last_sortidx_for_tasks(goal_id, user_id, lane_id) {
  let task_meta_list = $taskMeta
              .with({ goalId: goal_id, uid: user_id })
              .getList()
  if (task_meta_list) {
    task_meta_list = task_meta_list.asArrayFilteredBy('laneId', lane_id)
  } else {
    return 100
  }

  let array = task_meta_list.items;

  if ( array.length > 0 ) {
    let last_sort_idx = array.reduce((p, v) => ( p.sortidx  > v.sortidx  ? p : v ) )
    return last_sort_idx.sortidx + 100;
  } else {
    return 100;
  }
}

// TODO: MOVE TO CHECKLIST ITEM
export function get_last_sortidx_for_checklist_item(goal_id, task_id) {
  let checklist_items = $store.getters['goal/checklist_items_by_goal_id_and_task_id'](goal_id, task_id);
  if (!checklist_items || checklist_items.length === 0) {
    return 100;
  } else {
    let last_checklist_items = checklist_items.reduce((p, v) => (p.sortidx > v.sortidx ? p : v));
    return last_checklist_items.sortidx + 100;
  }
}

// -----------------------------------------------------------------------------

/*
  add a task
*/
export function task_create_user({
  goal_id,
  backlog_id,
  backlog_owner_id = null,
  data = {}
}) {

  if ( !util.isValidId( goal_id ) ) {
    throw new Error('Invalid goal_id', goal_id)
  }

  let task_creator_id = data.userId || $store.getters["user/userAuth"].id;

  if ( !backlog_owner_id ) {
    /* No user ID means we create the task for the current user */
    backlog_owner_id = task_creator_id;
  }

  data.sortidx   = data.sortidx || get_last_sortidx_for_tasks(goal_id, backlog_owner_id, backlog_id);
  data.userId    = task_creator_id

  log("task_create: submitting payload", goal_id, backlog_id, backlog_owner_id, data);

  return $taskMeta
         .with({ goalId: goal_id, uid: backlog_owner_id })
         .add(data)
}

// -----------------------------------------------------------------------------

/*
 * Update task
 */
export function task_update({ goal_id, task_id, member_id, data }) { // <OK>
  log("task_update", task_id, data);

  if ( !util.isValidId( goal_id ) ) {
    throw new Error('Invalid goal_id', goal_id)
  }

  /* Convert 'Date' to firestore 'Timestamp' */
  if ( 'deadline' in data && data.deadline !== null ) {
    data.deadline = data.deadline.toFirestore();
  }

  log("task_update: submitting payload", data);
  if ( !member_id ) {
    console.warn("No member id", member_id)
  }
  member_id = member_id || $store.getters["user/userAuth"].id;

  // TOOD: Support adding tasks to other user!

  return $taskMeta
         .with({ goalId: goal_id, uid: member_id })
         .update(task_id, data)
}

// -----------------------------------------------------------------------------

/*
  Update task name
  */
export function task_set_title({ task_id, name, goal_id, member_id }) { // <OK>
  log("task_set_title", task_id, name);

  if ( !util.isValidId( goal_id ) ) {
    throw new Error('Invalid goal_id', goal_id)
  }

  if ( !member_id ) {
    console.warn("No member id", member_id)
  }

  log("task_set_title: submitting payload", { name });
  return $taskMeta
         .with({ goalId: goal_id, uid: member_id })
         .update(task_id, { name })
}

// -----------------------------------------------------------------------------

export function task_delete({ task_id, goal_id, member_id, soft_delete = true }) { // <OK>

  if ( !util.isValidId( goal_id ) ) {
    throw new Error('Invalid goal_id', goal_id)
  }

  if ( !util.isValidId( task_id ) ) {
    throw new Error('Invalid task_id', task_id)
  }
  let taskMeta = $taskMeta.with({ goalId: goal_id, uid: member_id }).subscribeNode( task_id )
  return taskMeta.$promise.then(() => {

    return $taskMeta
    .with({ goalId: goal_id, uid: member_id })
    .remove(task_id, soft_delete)
    .then(() => {
      if ( !soft_delete ) {
        return $taskMeta.with({
          goalId: goal_id,
          uid:    member_id,
        }).remove( task_id )
      }
    })
  })
}

// -----------------------------------------------------------------------------
export function task_create_checklist_item({ goal_id, task_id, data }) { // <OK>

  if ( !util.isValidId( goal_id ) ) {
    throw new Error('Invalid goal_id', goal_id)
  }

  if ( !util.isValidId( task_id ) ) {
    throw new Error('Invalid task_id', task_id)
  }

  data = data || {};
  data.sortidx = data.sortidx || get_last_sortidx_for_checklist_item(goal_id, task_id);

  console.log("task_create_checklist_item", data);

  return $taskChecklistItem
         .with({ goalId: goal_id, taskId: task_id }) // todo uid?
         .add(data)
}

// -----------------------------------------------------------------------------

export function task_update_checklist_item({ goal_id, task_id, item_id, data }) { // <OK>

  if ( !util.isValidId( goal_id ) ) {
    throw new Error('Invalid goal_id', goal_id)
  }

  if ( !util.isValidId( task_id ) ) {
    throw new Error('Invalid task_id', task_id)
  }

  if ( !util.isValidId( item_id ) ) {
    throw new Error('Invalid item_id', item_id)
  }

  console.log("task_update_checklist_item", goal_id, task_id, item_id, data);
  return $taskChecklistItem
         .with({ goalId: goal_id, taskId: task_id }) // todo uid?
         .update(item_id, data)
}

// -----------------------------------------------------------------------------

export function task_rem_checklist_item({ goal_id, task_id, item_id }) {

  if ( !util.isValidId( goal_id ) ) {
    throw new Error('Invalid goal_id', goal_id)
  }

  if ( !util.isValidId( task_id ) ) {
    throw new Error('Invalid task_id', task_id)
  }

  if ( !util.isValidId( item_id ) ) {
    throw new Error('Invalid item_id', item_id)
  }

  console.log("task_rem_checklist_item", goal_id, task_id, item_id);
  return $taskChecklistItem
         .with({ goalId: goal_id, taskId: task_id }) // todo uid?
         .remove(item_id)
}

// -----------------------------------------------------------------------------

export function task_set_done({ goal_id, task_id, member_id, task_done }) { // <OK>

  if ( !util.isValidId( goal_id ) ) {
    throw new Error('Invalid goal_id', goal_id)
  }

  if ( !member_id ) {
    console.warn("No member id", member_id)
  }
  member_id = member_id || $store.getters["user/userAuth"].id;

  // return $taskMeta
  return $taskMeta
    .with({ goalId: goal_id, uid: member_id })
    .update( task_id, { done : task_done });
}

// -----------------------------------------------------------------------------

export function task_duplicate({ goal_id, member_id, task_id, assignmentUserId = null }) {
  console.log('task_duplicate', { goal_id, member_id, task_id })

  if ( !util.isValidId( goal_id ) ) {
    throw new Error('Invalid goal_id', goal_id)
  }

  if ( !util.isValidId( member_id ) && member_id !== 'TEAM' ) {
    throw new Error('Invalid member_id', member_id)
  }

  if ( !util.isValidId( task_id ) ) {
    throw new Error('Invalid task_id', task_id)
  }

  // TODO: Careful: This won't generate new checklist item IDs

  return $taskMeta
    .with({ goalId: goal_id, uid: member_id })
    .copy(task_id, {}, {})
    .then(new_task_id => {
      console.log("new_task_id", new_task_id)
      return $taskMeta
        .with({ taskId: new_task_id, goalId: goal_id, uid: member_id })
        .copy(task_id, {}, {})
      // TODO: This syntax can be improved
    })
}

export function task_duplicate_to_destination({ goalId, memberId, taskId, newGoalId, newMemberId, newLaneId, sortidx }) {
  //console.log('task_duplicate_to_destination', goalId, memberId, taskId, newGoalId, newMemberId, newLaneId)
  if ( !util.isValidId( goalId ) ) {
    throw new Error('Invalid goalId', goalId)
  }

  if ( !util.isValidId( memberId ) && memberId !== 'TEAM') {
    throw new Error('Invalid memberId', memberId)
  }

  if ( !util.isValidId( taskId ) ) {
    throw new Error('Invalid taskId', taskId)
  }

  if ( !util.isValidId( newGoalId ) ) {
    throw new Error('Invalid newGoalId', newGoalId)
  }

  if ( !util.isValidId( newMemberId ) ) {
    throw new Error('Invalid newGoalId', newMemberId)
  }
  if ( !util.isValidId( newLaneId ) ) {
    throw new Error('Invalid newGoalId', newLaneId)
  }

  // TODO: Careful: This won't generate new checklist item IDs
  return $taskMeta
    .with({ goalId: goalId, uid: memberId })
    .copy(taskId, { goalId: goalId, uid: memberId }, { goalId: newGoalId, uid: newMemberId })
    .then(newTaskId => {
      $taskMeta
      .with({ goalId: goalId, uid: memberId })
      .update(newTaskId, { laneId: newLaneId, done: false, sortidx: sortidx, createdAt: moment.currentTimeServer('REALTIMEDB'), finishedAt: null })
      console.log("newTaskId", newTaskId, 'created')
      $taskMeta
        .with({ taskId: newTaskId, goalId: goalId, uid: memberId })
        .copy(taskId, { goalId: goalId, uid: memberId }, { goalId: newGoalId, uid: newMemberId })
      return newTaskId
    })
}

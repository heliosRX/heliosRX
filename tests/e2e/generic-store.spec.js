import GenericStore from '@/store'
import genstores from './models'

const assert = (expr, text) => {
  if ( !expr ) throw new Error('Assertion failed', text)
};

export const testCases = {

  new_item_id: null,

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /* API when consumed: -> TODO: move to doc
  ---------------------

  import { status, task } from '@/generic_api'

  let new_item_id = await status.add({
    email: 'foo@bar.de'
  });

  status.update(new_item_id, {
    displayName: "User Display Name"
  });

  task.define({ goalId: 'ABC', uid: 'U1' }).update(taskId, {
    title: "New Task title"
  });

  task.define({ goalId: 'ABC', uid: 'U1' }).rem(taskId);
  */

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async test_path_interpolation() { // TODO: Move to unit
    const test_store = new GenericStore(
      "/goal/{goalId}/user_list/{uid}/task_details/*/task_subscription",
      null
    );
    test_store.define({
      goalId: 'A1',
      uid: 'U1'
    })
    assert( test_store.isSuffixed === true );
    assert( test_store.path === '/goal/A1/user_list/U1/task_details/{id}/task_subscription');
    assert( test_store.previewPath( 'ID1' ) === '/goal/A1/user_list/U1/task_details/ID1/task_subscription');
  },

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async test_add_item_to_status() {

    let new_item_id = await genstores.status.add({
      email: 'foo@bar.de'
    });

    console.log("Created item with id", new_item_id);
    this.new_item_id = new_item_id;
  },

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async test_update_item_from_status() {
    // let id = "l1X8FPc7YtbftlC31frciInV3PU2";
    let id = this.new_item_id;
    genstores.status.update(id, {
      displayName: "TEST2"
    });
  },

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async test_add_member_to_goal() {
    genstores.goal_members.define({
      goalId: 'J9HGuVQ4TLaBars9p1GiWg'
    })

    let new_item_id = await genstores.goal_members.add({
      isOwner: true,
      isAdmin: true,
      cachedName: "My testname",
      cachedProfilePic: "http://profile.pic/img.jpg",
    });

    assert(new_item_id, 'got invalid id')
  },

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async test_add_commitment_task_end_date() {
    genstores.commitment_task_end_dates.define({
      goalId: 'J9HGuVQ4TLaBars9p1GiWg',
      taskId: 'ID1'
    })

    let new_item_id = await genstores.commitment_task_end_dates.add({
      endDate: +new Date() / 1000 // HACK
    });
    assert(new_item_id, 'got invalid id')
  },

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async test_rem_item() {
    let new_item_id = await genstores.status.add({
      email: 'del@me.com'
    });
    let path = genstores.status.childRef( new_item_id ).path;
    console.log("path", path);
    console.log("path.toString()", path.toString());
    console.log("path.toUrlEncodedString()", path.toUrlEncodedString());
    await genstores.status.remove(new_item_id);
  },

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async test_move_item() {
  },

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async test_reorder() {
  },
};

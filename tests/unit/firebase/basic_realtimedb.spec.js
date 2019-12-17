const { setup_realtimedb,
        setup_realtimedb_admin,
        teardown,
        expect } = require('./helpers');

describe('Project rules', () => {
  // let db;
  let projRef;

  afterAll(async () => {
    await teardown();
  });

  test('deny a user that does NOT have the admin role', async () => {
    const db = await setup_realtimedb({ uid: 'null' });

    // Allow rules in place for this collection
    projRef = db.ref('projects/testId');
    await expect(projRef.once('value')).toDeny();
  });

  test('allow a user with the admin role', async () => {
    const db = await setup_realtimedb({ uid: 'jeffd23' });

    projRef = db.ref('projects/testId');
    await expect(projRef.once('value')).toAllow();
  });

  test('deny a user if they are NOT in the Access Control List', async () => {
    const db = await setup_realtimedb({ uid: 'frank' });

    projRef = db.ref('projects/testId');
    await expect(projRef.once('value')).toDeny();
  });

  test('allow a user if they are in the Access Control List', async () => {
    const db = await setup_realtimedb({ uid: 'bob' });

    projRef = db.ref('projects/testId');
    await expect(projRef.once('value')).toAllow();
  });

  test.skip('admin cat fetch all data', async () => {
    const db = await setup_realtimedb_admin();

    let data = await db.ref('/').once('value').then(function(snapshot) {
      console.log("snapshot.val()", snapshot.val())
    });
    expect(data).toBe("123")
  })
});

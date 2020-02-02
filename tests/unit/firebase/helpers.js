const firebase = require('@firebase/testing');
const fs = require('fs');

// const DB_VERSION = `${Date.now()}`;
const DB_VERSION = "xxx";

const mockData = {
  'users/jeffd23': {
    roles: {
      admin: true
    }
  },
  'projects/testId': {
    members: ['bob']
  }
};

const init_db = async (databaseName, data) => {
  const adminApp = firebase.initializeAdminApp({ databaseName: databaseName });
  const db = adminApp.database();
  await db.ref().set(null);
  if (data) {
    for (const key in data) {
      const ref = db.ref(key);
      await ref.set(data[key]);
    }
  }
  await firebase.loadDatabaseRules({
    databaseName: databaseName,
    // rules: fs.readFileSync('database.rules.json', 'utf8')
    rules: '{ "rules": { ".read": true, ".write": true } }'
  });
  return db;
}

module.exports.setup_realtimedb_admin = async () => {

  const databaseName = `rules-spec-realtimedb-${DB_VERSION}`;

  return init_db(databaseName, mockData);

}

module.exports.setup_realtimedb = async (auth) => {

  const databaseName = `rules-spec-realtimedb-${DB_VERSION}`;

  init_db(databaseName, mockData);

  const app = await firebase.initializeTestApp({
    databaseName: databaseName,
    auth: auth,
  });

  const db = app.database();
  return db;
}

module.exports.setup_firestore = async (auth) => {
  const projectId = `rules-spec-firestore-${DB_VERSION}`;
  const app = await firebase.initializeTestApp({
    projectId: projectId,
    auth: auth
  });

  const db = app.firestore();

  // Write mock documents before rules
  if (mockData) {
    for (const key in mockData) {
      const ref = db.doc(key);
      await ref.set(mockData[key]);
    }
  }

  // Apply rules
  await firebase.loadFirestoreRules({
    projectId: projectId,
    rules: fs.readFileSync('firestore.rules', 'utf8')
  });

  return db;
};

module.exports.teardown = async () => {
  Promise.all(firebase.apps().map(app => app.delete()));
};

/* eslint-disable no-empty */
expect.extend({
  async toAllow(x) {
    let pass = false;
    try {
      await firebase.assertSucceeds(x);
      pass = true;
    } catch (err) {}

    return {
      pass,
      message: () => 'Expected Firebase operation to be allowed, but it was denied'
    };
  }
});

expect.extend({
  async toDeny(x) {
    let pass = false;
    try {
      await firebase.assertFails(x);
      pass = true;
    } catch (err) {}
    return {
      pass,
      message: () =>
        'Expected Firebase operation to be denied, but it was allowed'
    };
  }
});

module.exports.expect = expect;

let firebase = {

  INTERNAL: {
    registerService(type, factory, namespaceExports, x, y) {
    },
  },

  storage() {
    return {
      ref() {
        return {}
      }
    }
  },

  database() {
    return {}
  },

  firestore() {
    return {}
  },

  initializeApp() {
    return {
      auth() {
      },
      database() {
        return {
          ServerValue: {
            TIMESTAMP: { '.sv': "timestamp" }
          }
        };
      },
      messaging() {
      },
      storage() {
      },
    }
  }
}

firebase.database.ServerValue = { TIMESTAMP: { '.sv': "timestamp" } }
firebase.firestore.Timestamp = {
  fromDate(x) {
    return x + 'TODO'
  }
}

export default firebase;

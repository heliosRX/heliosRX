const firebase = {
  database: {
    ServerValue: {
      TIMESTAMP: {".sv": "timestamp"}
    }
  },
  firestore: {
    FieldValue: {
      serverTimestamp() {
        throw new Error('Not Implemented')
      }
    }
  }
}

export default firebase;

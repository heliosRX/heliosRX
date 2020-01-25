import Document from './Document'
import Collection from './Collection'

export class Database {
  getDocument( path = '/' ) {
    return new Document(path);
  }

  getCollection( path = '/' ) {
    return new Collection(path);
  }

  getQueryCollection({ // buildQueryRef
    path = '/',
    key = undefined,
    value = undefined,
    limit = undefined,
    startAt = undefined,
    endAt = undefined,
  }) {
    const query = { key, value, limit, startAt, endAt };
    return new Collection( path, query )
  }

  generateUniqueId() {
    return String; // PushID
  }
}

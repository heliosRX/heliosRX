import GenericStore from '@/store'
import { MockRef, MockBackend } from './mock-backend'
import GenericModel from '@/classes/GenericModel'
import { matcherHint, printReceived } from 'jest-matcher-utils';

jest.mock('./mock-backend');

/* eslint-disable quote-props */
const modelDefinition = {
  schema: {
    create({ strInput }) {
      return {
        strField: strInput || "Empty",
        numField: 8,
      }
    },
    fields: {
      timestampField: { type: 'Timestamp' },
      strField: { type: 'String' },
      boolField: { type: 'Boolean' },
      numField: { type: 'Number' },
      mapField: { type: 'Map<String, String>' },
      arrField: { type: 'String[]' },
      'nested.field': { type: 'String' },
      'nested.sub.field': { type: 'String' },
      "/dynField[0-9]+/": { type: "String" },
      // Special fields
      deleted: { type: 'Boolean' },
      sortidx: { type: 'Number' },
    },
  }
};

const store = new GenericStore(
  "/example/sub/*",
  modelDefinition
  // { enableTypeValidation: true }
);

const storeNested = new GenericStore(
  "/example/{testId}/sub/*",
  modelDefinition
);

const storeSuffixed = new GenericStore(
  "/example/{testId}/sub/*/meta",
  modelDefinition
);

const mockBackend = new MockBackend();
const mockContext = {}

beforeAll(() => {
  GenericStore.setDefaultDB( mockBackend );
  GenericStore._set_caller( mockContext )
});

beforeEach(() => {
  MockBackend.mockClear();
  // mockBackend.mockClear();
  // console.log(mockBackend)
});

describe('add', () => {

  const FAKE_ID = 2345678765;
  let mockRef = null;

  beforeAll(() => {
    mockBackend.ref.mockImplementation((path) => {
      const ref = new MockRef(path)

      ref.constructor.mockImplementation((path) => {
      })

      ref.push.mockImplementation(() => {
        return { key: FAKE_ID }
      })

      ref.update.mockResolvedValue(null)

      mockRef = ref;
      return ref
    });
  });

  beforeEach(() => {
    mockBackend.ref.mockClear();
    if ( mockRef ) {
      mockRef.constructor.mockClear();
      mockRef.push.mockClear();
      mockRef.update.mockClear();
    }
  });

  test('add 1', async () => {
    // add( overwrite_data <, new_id: string> <, options: object> ) ⇒ Promise<id: string>

    await store.add({ strInput: 'foo' }).then(data => {
      expect( data ).toBe( FAKE_ID )
      expect( mockBackend.ref ).toHaveBeenCalled()
      expect( mockRef.update ).toHaveBeenCalledWith({
        [FAKE_ID]: { strField: 'foo', numField: 8 }
      })
    });
  });

  test('add 2', async () => {
    await storeNested.with({ testId: 'ABC' }).add({ strInput: 'foo' }).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/ABC/sub/')
      expect( mockRef.update ).toHaveBeenCalledWith({
        [FAKE_ID]: { strField: 'foo', numField: 8 }
      })
    });
  });

  test('add 3', async () => {
    await storeSuffixed.with({ testId: 'ABC' }).add({ strInput: 'foo' }).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/ABC/sub/2345678765/meta')
      expect( mockRef.update ).toHaveBeenCalledWith({ strField: 'foo', numField: 8 })
    });
  });

  test('add 4', async () => {
    await store.add({ strInput: 'foo' }, 'CUSTOMID').then(data => {
      expect( data ).toBe( 'CUSTOMID' )
      expect( mockRef.update ).toHaveBeenCalledWith({
        'CUSTOMID': { strField: 'foo', numField: 8 }
      })
    });
  });

  test('add 5', async () => {
    await store.add({ strField: 'bar' }, null, { directWrite: true }).then(data => {
      expect( data ).toBe( FAKE_ID )
      expect( mockRef.update ).toHaveBeenCalledWith({
        [FAKE_ID]: { strField: 'bar' }
      })
    });
  });

  test.skip('add 6', async () => {
    // expect( store.add({}, -1) ).toThrow(/invalid/)
    // await expect( store.with({ testId: 1 }).add() ).toThrow()
  });
})

describe('update', () => {

  let mockRef = null;

  beforeAll(() => {
    mockBackend.ref.mockImplementation((path) => {
      const ref = new MockRef(path)

      ref.constructor.mockImplementation((path) => {
        // console.log("new Ref(", path, ")")
      })

      ref.update.mockResolvedValue(null)

      mockRef = ref;
      return ref
    });
  });

  beforeEach(() => {
    mockBackend.ref.mockClear();
    if ( mockRef ) {
      mockRef.constructor.mockClear();
      mockRef.update.mockClear();
    }
  });

  test('update 1', async () => {
    // update(id: string, data: object<string: any>) ⇒ Promise

    await store.update(123, { strField: 'foo' }).then(data => {
      expect( data ).toBe( null )
      // expect( data ).toBe( 123 ) // TODO
      // expect( mockBackend.ref ).toHaveBeenCalled()
      // console.log("mockRef.constructor", mockRef.constructor.mock.calls)
      expect( mockRef.constructor ).toHaveBeenCalledTimes(3) // TODO
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/123')
      expect( mockRef.update ).toHaveBeenCalledWith({ strField: 'foo' })
    });
  });

  test('update 2a', async () => {
    await storeNested.with({ testId: 789 }).update(123, { strField: 'foo' }).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledTimes(1)
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/789/sub/123')
      expect( mockRef.update ).toHaveBeenCalledWith({ strField: 'foo' })
    });
  });

  test('update 2b', async () => {
    await storeSuffixed.with({ testId: 789 }).update(1234, {}).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/789/sub/1234/meta')
    });
  });

  test('update 3a', async () => {
    await store.update(123, { 'nested.field': "foo" }).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/123')
      expect( mockRef.update ).toHaveBeenCalledWith({ 'nested.field': 'foo' })
    });
  });

  test.skip('update 3b', async () => { // TODO
    await store.update(123, { 'nested': { 'field': "foo" } }).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/789/sub/123')
      expect( mockRef.update ).toHaveBeenCalledWith({ strField: 'foo' })
    });
  });

  test('update 3c', async () => {
    await store.update(123, { 'mapField': { "foo": "bar" } }).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/123')
      expect( mockRef.update ).toHaveBeenCalledWith({ 'mapField': { 'foo': 'bar' } })
    });
  });

  test('update 3d', async () => {
    await store.update(123, { 'arrField': { 6: "bar" } }).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/123')
      expect( mockRef.update ).toHaveBeenCalledWith({ 'arrField': { 6: 'bar' } })
    });
  });

  test('update 4', async () => {
    // TODO: 'nested/sub/field'
    await store.update(123, { 'nested.sub.field': "foo" }).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/123')
      expect( mockRef.update ).toHaveBeenCalledWith({ 'nested.sub.field': 'foo' })
    });
  });

  test('update wrong id', async () => {
    await expect( () => store.update(undefined) ).toThrow(/missing/i)
    await expect( () => store.update({}) ).toThrow(/missing/i)
    await expect( () => store.update({}, -1) ).toThrow(/expected/i)
    await expect( () => store.update(-1, {}) ).toThrow(/invalid/i)
  });
});

describe('remove', () => {
  // remove(id: string <, soft_delete: DeleteMode> ) ⇒ Promise

  let mockRef = null;

  beforeAll(() => {
    mockBackend.ref.mockImplementation((path) => {
      const ref = new MockRef(path)

      ref.constructor.mockImplementation((path) => {
        // console.log("new Ref(", path, ")")
      })

      ref.update.mockResolvedValue(null)
      ref.remove.mockResolvedValue(null)

      mockRef = ref;
      return ref
    });
  });

  beforeEach(() => {
    mockBackend.ref.mockClear();
    if ( mockRef ) {
      mockRef.constructor.mockClear();
      mockRef.update.mockClear();
      mockRef.remove.mockClear();
    }
  });

  test('remove 1', async () => {
    await store.remove(1234).then(data => {
      expect( data ).toBe( null )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(1)
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/1234')
      expect( mockRef.remove ).toHaveBeenCalledWith()
    });
  });

  test('remove 2', async () => {
    await storeSuffixed.with({ testId: 789 }).remove(1234).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/789/sub/1234/meta')
      expect( mockRef.remove ).toHaveBeenCalledWith()
    });
  });

  test('remove 3', async () => {
    await store.remove(1234, true ).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/1234')
      expect( mockRef.update ).toHaveBeenCalledWith({ "deleted": true })
    });
  });

  test('remove 4a', async () => {
    await store.remove([5,6,7], true ).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/')
      expect( mockRef.update ).toHaveBeenCalledWith({
        "5/deleted": true,
        "6/deleted": true,
        "7/deleted": true,
      })
    });
  });

  test('remove 4b', async () => {
    await store.remove([5,6,7], false ).then(data => {
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/')
      expect( mockRef.update ).toHaveBeenCalledWith({
        "5": null,
        "6": null,
        "7": null,
      })
    });
  });

  test('remove 6', async () => {
    // await expect( () => store.remove({}) ).toThrow(/missing/i) // TODO
    await expect( () => store.remove(undefined) ).toThrow(/invalid/i)
    await expect( () => store.remove(null) ).toThrow(/invalid/i)
  });
});

describe('restore', () => {
  // restore( id ) ⇒ Promise

  let mockRef = null;

  beforeAll(() => {
    mockBackend.ref.mockImplementation((path) => {
      const ref = new MockRef(path)
      ref.update.mockResolvedValue(null)
      mockRef = ref;
      return ref
    });
  });

  beforeEach(() => {
    mockBackend.ref.mockClear();
    if ( mockRef ) {
      mockRef.constructor.mockClear();
      mockRef.update.mockClear();
    }
  });

  test('restore 1', async () => {
    await store.restore(1234).then(data => {
      expect( data ).toBe( null )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(1)
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/1234')
      expect( mockRef.update ).toHaveBeenCalledWith({
        "deleted": false
      })
    });
  });

  test.skip('restore 2', async () => {
    await expect( () => store.restore(undefined) ).toThrow(/missing/i)
    await expect( () => store.restore(null) ).toThrow(/missing/i)
    // TODO !!!!
    await expect( () => store.restore({}) ).toThrow(/missing/i)
  });
});

describe('reorder', () => {
  // reorder(sortidxList: object<string: string> <, options = {}>) ⇒ Promise

  let mockRef = null;

  beforeAll(() => {
    mockBackend.ref.mockImplementation((path) => {
      const ref = new MockRef(path)

      ref.constructor.mockImplementation((path) => {
        // console.log("new Ref(", path, ")")
      })

      ref.update.mockResolvedValue(null)

      mockRef = ref;
      return ref
    });
  });

  beforeEach(() => {
    mockBackend.ref.mockClear();
    if ( mockRef ) {
      mockRef.constructor.mockClear();
      mockRef.update.mockClear();
    }
  });

  test('reorder 1', async () => {
    await store.reorder([ 'id1', 'id2', 'id3']).then(data => {
      expect( data ).toBe( null )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(2) // TODO
      expect( mockRef.constructor ).toHaveBeenCalledWith(undefined) // root ref
      expect( mockRef.update ).toHaveBeenCalledWith({
        '/example/sub/id1/sortidx': 100,
        '/example/sub/id2/sortidx': 200,
        '/example/sub/id3/sortidx': 300,
      })
    });
  });

  test('reorder 2a', async () => {
    let data = [
      { '$id': 'id8', sortidx: -4 }, // sortidx ignore, since order is given by
      { '$id': 'id1', sortidx: -3 }, // list of GenericModels
      { '$id': 'id3', sortidx: -1 },
    ]
    await store.reorder(data).then(data => {
      expect( data ).toBe( null )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(1)
      expect( mockRef.constructor ).toHaveBeenCalledWith(undefined) // root ref
      expect( mockRef.update ).toHaveBeenCalledWith({
        '/example/sub/id8/sortidx': 100,
        '/example/sub/id1/sortidx': 200,
        '/example/sub/id3/sortidx': 300,
      })
    });
  });

  test('reorder 2b', async () => {
    let data = [
      new GenericModel(modelDefinition.schema, {}, "test"),
      new GenericModel(modelDefinition.schema, {}, "test"),
      new GenericModel(modelDefinition.schema, {}, "test"),
    ]
    data[0].$id = 'id10'
    data[1].$id = 'id30'
    data[2].$id = 'id20'
    await store.reorder(data).then(data => {
      expect( data ).toBe( null )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(1)
      expect( mockRef.constructor ).toHaveBeenCalledWith(undefined) // root ref
      expect( mockRef.update ).toHaveBeenCalledWith({
        '/example/sub/id10/sortidx': 100,
        '/example/sub/id30/sortidx': 200,
        '/example/sub/id20/sortidx': 300,
      })
    });
  });

  test('reorder 3', async () => {
    let data = [
      { 'id': 'id8', sortidx: 4 },
      { 'id': 'id1', sortidx: 3 },
      { 'id': 'id3', sortidx: 1 },
    ]
    await store.reorder(data).then(data => {
      expect( data ).toBe( null )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(1)
      expect( mockRef.constructor ).toHaveBeenCalledWith(undefined) // root ref
      expect( mockRef.update ).toHaveBeenCalledWith({
        '/example/sub/id3/sortidx': 1,
        '/example/sub/id1/sortidx': 3,
        '/example/sub/id8/sortidx': 4,
      })
    });
  });

  test('reorder 4', async () => {
    await store.reorder([]).then(data => {
      expect( data ).toBe( null )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(1)
      expect( mockRef.constructor ).toHaveBeenCalledWith(undefined) // root ref
      expect( mockRef.update ).toHaveBeenCalledWith({})
    });
  });

  test('reorder 5', async () => {
    await expect( () => store.reorder(undefined) ).toThrow(/undefined/i) // TODO
    await expect( () => store.reorder({}) ).toThrow(/not/i) // TODO
    await expect( () => store.reorder(null) ).toThrow(/null/i) // TODO
    await expect( () => store.reorder("string") ).toThrow(/function/i) // TODO
  });

  test('reorder 5b', async () => {
    let data1 = [
      { 'id': 'id1', sortidx: NaN },
    ]
    let data2 = [
      { 'id': 'id1', sortidx: 'invalid' },
    ]
    let data3 = [
      { 'id': undefined, sortidx: 1 },
    ]
    await expect( () => store.reorder(data1) ).toThrow(/invalid/i)
    await expect( () => store.reorder(data2) ).toThrow(/invalid/i)
    await expect( () => store.reorder(data3) ).toThrow(/invalid/i)
  });
});

describe('copy / move', () => {
  // copy(id, contextA, contextB) ⇒ Promise
  // move(id, contextA, contextB, { keepOriginal = false, keepId = true } = {}) ⇒ Promise

  let mockRef = null;

  beforeAll(() => {
    mockBackend.ref.mockImplementation((path) => {
      const ref = new MockRef(path)
      ref.update.mockResolvedValue(null)
      ref.remove.mockResolvedValue(null)
      ref.once.mockImplementation((type) => {
        return Promise.resolve({
          val: () => ({ 'strField': 'Foo', numField: 9 })
        })
      })
      mockRef = ref;
      return ref
    });
  });

  beforeEach(() => {
    mockBackend.ref.mockClear();
    if ( mockRef ) {
      mockRef.constructor.mockClear();
      mockRef.update.mockClear();
      mockRef.remove.mockClear();
      mockRef.once.mockClear();
    }
  });

  test('move 1', async () => {
    await store.move(5, {}, {}).then(data => {
      expect( data ).toBe( 5 )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(2)
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/5')
      expect( mockRef.update ).toHaveBeenCalledWith({
        "/example/sub/5": {
          "numField": 9,
          "strField": "Foo",
        },
      })
      // TODO !!! should throw error?
      // expect( mockRef.remove ).toHaveBeenCalledWith(9999)
      // DELETE???
    });
  });

  test('move 1', async () => {
    await storeNested.move(5, { testId: 'A' }, { testId: 'B' }).then(data => {
      expect( data ).toBe( 5 )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(2)
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/A/sub/5')
      // expect( mockRef.constructor ).toHaveBeenCalledWith('/example/B/sub/5')
      expect( mockRef.update ).toHaveBeenCalledWith({
        "/example/A/sub/5": null,
        "/example/B/sub/5": {
          "numField": 9,
          "strField": "Foo",
        },
      })
    });
  });

  test('copy 1', async () => {
    await storeNested.copy(5,
      { testId: 'A' },
      { testId: 'B' },
      { keepId: true }).then(data => {
      expect( data ).toBe( 5 )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(2)
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/A/sub/5')
      expect( mockRef.update ).toHaveBeenCalledWith({
        "/example/B/sub/5": {
          "numField": 9,
          "strField": "Foo",
        },
      })
    });
  });

  test('move 3', async () => {
    await expect( () => store.move(undefined, undefined, undefined) ).toThrow(/invalid/i)
    await expect( () => store.move(1, undefined, undefined) ).toThrow(/undefined/i) // TODO
    await expect( () => store.move(1, {}) ).toThrow(/undefined/i) // TODO
    await expect( () => storeNested.move(1, {}, { testId: 5 }) ).toThrow(/equal/i)
    await expect( () => storeNested.move(1, { testId: undefined }, { testId: 5 }) ).toThrow(/Required/i)
    await expect( () => storeNested.move(1, { testId: 5, otherId: 8 }, { testId: 5 }) ).toThrow(/equal/i)

    // TODO !!!!!
    // await expect( () => storeNested.move(1, { testId: 5 }, { testId: undefined }) ).toThrow(/Required/i)
    // await expect( () => storeNested.move(1, { testId: 5 }, { testId: 5 }) ).toThrow() // TODO
  });
});

expect.extend({
  toHaveBeenCalledWithFunction(expected, fn, testcases = []) {

    const predicate = (transaction, fn, testcases) => {
      const isFunction = typeof expected === 'function';
      return isFunction && testcases.every(test => {
        // console.log(fn(test), "===", transaction(test))
        return fn(test) === transaction(test);
      });
    }

    const transaction = expected.mock.calls[0][0];
    const pass = predicate(transaction, fn, testcases);

    const passMessage = received => () =>
      matcherHint('.not.toHaveBeenCalledWithFunction', 'received', '')
      + '\n\n'
      + 'Expected value to not be a function, received:\n'
      + `  ${printReceived(received)}`;

    const failMessage = received => () =>
      matcherHint('.toHaveBeenCalledWithFunction', 'received', '')
      + '\n\n'
      + 'Expected to receive a function, received:\n'
      + `  ${printReceived(received)}`;

    if (pass) {
      return { pass: true, message: passMessage(transaction) };
    }

    return { pass: false, message: failMessage(transaction) };
  }
});

describe('transaction', () => {
  // transaction( id: string, prop: string, transaction: string, value: numeric ) ⇒ Promise

  let mockRef = null;

  beforeAll(() => {
    mockBackend.ref.mockImplementation((path) => {
      const ref = new MockRef(path)
      ref.transaction.mockResolvedValue({ committed: true })
      ref.ref = {
        child: jest.fn()
      };
      ref.path = "FOOBAR"
      ref.ref.child.mockImplementation(x => {
        return mockRef
      })
      mockRef = ref;
      return ref
    });
  });

  beforeEach(() => {
    mockBackend.ref.mockClear();
    if ( mockRef ) {
      mockRef.constructor.mockClear();
      mockRef.transaction.mockClear();
      mockRef.ref.child.mockClear();
    }
  });

  test('transaction 1', async () => {
    await store.transaction(5, 'numField', 'inc').then(committed => {
      expect( committed ).toBe( true )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(1)
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/5')
      expect( mockRef.transaction ).toHaveBeenCalledWithFunction((x) => {
        return x + 1
      }, [4, 2, -5])
    });
  });

  test('transaction 2', async () => {
    await store.transaction(5, 'numField', 'dec', 5).then(committed => {
      expect( committed ).toBe( true )
      expect( mockRef.constructor ).toHaveBeenCalledTimes(1)
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/5')
      expect( mockRef.transaction ).toHaveBeenCalledWithFunction((x) => {
        return x - 5
      }, [4, 2, -5])
    });
  });

  test('transaction 3', async () => {
    const cb = (x) => x * 2
    await store.transaction(3, 'numField', cb).then(committed => {
      expect( committed ).toBe( true )
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/3')
      expect( mockRef.ref.child ).toHaveBeenCalledWith('numField')
      expect( mockRef.transaction ).toHaveBeenCalledWithFunction(cb, [4, 2, -5])
    });
  });

  test.skip('transaction 4', async () => {
    const cb = (obj) => {
      obj['numField'] *= 3
    }
    await store.transaction(3, 'numField', cb).then(committed => {
      expect( committed ).toBe( true )
      expect( mockRef.constructor ).toHaveBeenCalledWith('/example/sub/3')
      expect( mockRef.transaction ).toHaveBeenCalledWithFunction(cb, [4, 2, -5])
    });
  });

  test('transaction 5', async () => {
    // await expect( () => store.transaction(undefined) ).toThrow(/function/i)
    await expect( () => store.transaction(5) ).toThrow(/function/i) // TODO: better error

    // TODO
    //  await expect( () => store.transaction(5, null, () => {}) ).toThrow(/function/i) // TODO: better error
  });
});

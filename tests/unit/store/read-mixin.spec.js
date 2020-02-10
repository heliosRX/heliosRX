import GenericStore from '@/store'
import GenericModel from '@/classes/GenericModel'
import { MockRef, MockBackend } from './mock-backend'
import { matcherHint, printReceived } from 'jest-matcher-utils';
import registryModule from '@/registry/module'
import setupExternalDeps from '@/external-deps'
import { setup as storeSetup } from '@/store/GenericStore.js'
import {
  rtdbFetchAsObject,
  rtdbFetchAsArray,
  rtdbBindAsObject,
  rtdbBindAsArray,
} from '@/backends/firebase-rtdb/rtdb.js'

import Vue from 'vue'
// import Vue from 'vue/dist/vue.esm.js'
import Vuex from 'vuex'
Vue.config.productionTip = false;
Vue.config.devtools = false;

jest.mock('./mock-backend');
jest.mock('@/backends/firebase-rtdb/rtdb.js');

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
  "/example/sub/*/meta",
  modelDefinition
);

const mockBackend = new MockBackend();
const mockContext = {}
let registry = null;

beforeAll(() => {
  GenericStore.setDefaultDB( mockBackend );
  GenericStore._set_caller( mockContext )

  setupExternalDeps({
    Vue,
    // models: options.models,
    // db:     options.db,
  });

  storeSetup({
    Vue,
    // firebase: options.firebase || options.db.app.firebase_ // HACK: Figure out from rtdb
  })

  // Setup registry
  Vue.use( Vuex );
  registry = new Vuex.Store( registryModule( 'heliosRX' ) )
  setupExternalDeps({ Vuex, registry: registry });
  registry.commit('INIT_REGISTRY');
});

beforeEach(() => {
  // console.log("beforeEach - 1")
  MockBackend.mockClear();
  store.resetGlobalInstanceCache();
  registry.commit('RESET_REGISTRY');
  registry.commit('INIT_REGISTRY');
});

/*
rtdbFetchAsObject.mockImplementation(() => {
  console.log("rtdbFetchAsObject")
});
rtdbFetchAsArray.mockImplementation(() => {
  console.log("rtdbFetchAsArray")
});
rtdbBindAsObject.mockImplementation(() => {
  console.log("rtdbBindAsObject")
});
// rtdbFetchAsObject.mockClear();
// rtdbFetchAsArray.mockClear();
// rtdbBindAsObject.mockClear();
*/

describe('subscribeList / subscribeQuery', () => {
  // subscribeList( <idList: array<string>> <, option:object>) ⇒ GenericList
  // subscribeQuery( <query:QueryDefinition> <, option:object>) ⇒ GenericList

  let mockRef = null;
  let mockRefList = [];
  const mockHelpers = {
    setList: null,
    addItem: null,
    removeItem: null,
    changeItem: null,
  }

  beforeAll(() => {
    mockBackend.ref.mockImplementation((path) => {
      const ref = new MockRef(path)
      ref.constructor.mockImplementation((path) => {
        // console.log("PATH", path)
      })
      ref.update.mockResolvedValue(null)
      ref.path = path;
      mockRef = ref;
      mockRefList.push(ref)
      return ref
    });

    rtdbBindAsArray.mockImplementation(({ collection, ops, resolve, reject }) => {
      const { target } = ops.init()

      mockHelpers.addItem = (key, data) => {
        ops.add( target, key, data )
      }
      mockHelpers.removeItem = (key) => {
        ops.remove( target, key )
      }
      mockHelpers.changeItem = (key, data) => {
        ops.set( target, key, data )
      }
      mockHelpers.setList = (data, exists = true) => {
        ops.once( target, data, exists )
        resolve();
      }

      return () => {
        console.log("UNSUBSCRIBE")
      }
    });
  });

  beforeEach(() => {
    // console.log("beforeEach - 2")
    mockBackend.ref.mockClear();
    if ( mockRef ) {
      mockRef.constructor.mockClear();
      mockRef.push.mockClear();
      mockRef.update.mockClear();
      rtdbBindAsArray.mockClear();
    }
  });

  test('subscribeList 1', async () => {

    const list = store.subscribeList();

    const data = {
      'A': { numField: 9 },
      'B': { numField: 11 },
    };

    setTimeout(() => {
      mockHelpers.setList( data );
    }, 10)

    setTimeout(() => {
      Object.keys(data).forEach(key => {
        mockHelpers.addItem( key, data[key] );
      })
    }, 20)

    await new Promise(res => setTimeout(res, 30))

    await list.$promise

    /*
    console.log(list.items)
    console.log(list.items['A'].$state)
    console.log(list.$promise)
    console.log(registry.state.initialized)
    console.log(registry.state.ready)
    console.log(registry.state.res)
    console.log(registry.state.res.example.sub)
    console.log(JSON.stringify(registry.state, null, 2))
    */

    expect( registry.state.sync ).toHaveProperty('/example/sub/{id}')
    expect( registry.state.sync['/example/sub/{id}'].query ).toBe(null)
    expect( registry.state.sync['/example/sub/{id}'].status ).toBe('Ready')

    expect( list.$idList.length ).toBe(2)
    expect( list.items['A'].$state ).toEqual({ numField: 9 })
    expect( list.items['B'].$state ).toEqual({ numField: 11 })
    expect( registry.state.res.example.sub.A ).toEqual({ numField: 9 })

    mockHelpers.addItem("C", { strField: "foo" });

    await new Promise(res => setTimeout(res, 10))

    expect( list.items['C'].$state ).toEqual({ strField: "foo" })
    expect( registry.state.res.example.sub.C ).toEqual({ strField: "foo" })

    let list_from_cache = store.subscribeList();
    expect( list_from_cache.$idList ).toHaveLength(3)
    expect( list_from_cache ).toBe( list ) // Check for referential identity

    mockHelpers.removeItem('A');
    expect( list.items ).not.toHaveProperty('A')
    // expect( list.$numReady ).toBe(2) // TODO

    // mockHelpers.addItem(key, data);
    mockHelpers.changeItem('B', { numField: 250 });
    await new Promise(res => setTimeout(res, 30))

    // TODO !!
    /*
    console.log(list.items['B'].$state)
    console.log(JSON.stringify(registry.state, null, 2))
    expect( list.items['B'].$state ).toEqual({ numField: 25 })
    */
  });

  test.todo('subscribeList with already synced parent')

  test('subscribeQuery 1', async () => {

    let mockRefs = [];

    mockBackend.ref.mockImplementation((path) => {
      const ref = new MockRef(path)
      ref.orderByValue.mockReturnValue(ref)
      ref.orderByKey.mockReturnValue(ref)
      ref.orderByChild.mockReturnValue(ref)
      ref.equalTo.mockReturnValue(ref)
      ref.startAt.mockReturnValue(ref)
      ref.endAt.mockReturnValue(ref)
      ref.limitToFirst.mockReturnValue(ref)
      ref.limitToLast.mockReturnValue(ref)
      // ref.update.mockResolvedValue(null)
      ref.path = path;
      mockRefs.push(ref);
      return ref
    });

    // SELECT * WHERE numField < 20 LIMIT 3
    const list = store.subscribeQuery({ key: 'numField', endAt: 20, limit: 3 });

    let mockRefQuery = mockRefs[0];

    await new Promise(res => setTimeout(res, 30))

    expect( mockRefQuery.endAt ).toHaveBeenCalledWith(20)
    expect( mockRefQuery.orderByChild ).toHaveBeenCalledWith('numField')
    expect( mockRefQuery.limitToFirst ).toHaveBeenCalledWith(3)

    const data = {
      'A': { numField: 9 },
      'B': { numField: 11 },
      'C': { numField: 15 },
      'D': { numField: 25 },
      'E': { numField: 95 },
    };

    setTimeout(() => {
      mockHelpers.setList( data );
    }, 10)

    setTimeout(() => {
      mockHelpers.addItem( 'A', data['A'] );
      mockHelpers.addItem( 'B', data['B'] );
      mockHelpers.addItem( 'C', data['C'] );
    }, 20);

    await new Promise(res => setTimeout(res, 30))
    await list.$promise;

    expect( list.$idList.length ).toBe(3)
    expect( list.items['A'].$state ).toEqual(data['A'])
    expect( list.items['B'].$state ).toEqual(data['B'])
    expect( list.items['C'].$state ).toEqual(data['C'])

    list.itemsAsArray().map( item => {
      expect( item.numField ).toBeLessThan(20)
    })
  })
});

describe('subscribeNode', () => {
  // subscribeNode( <id: string> <, option:object>) ⇒ GenericModel

  let mockRef = null;
  const mockHelpers = {
    setItem: null,
  }

  beforeAll(() => {
    // console.log("beforeAll - 2")
    mockBackend.ref.mockImplementation((path) => {
      console.log('* creating ref with path <' + path + '> *')
      const ref = new MockRef(path)
      ref.constructor.mockImplementation((path) => {
        console.log('* creating NEW ref with path <' + path + '> *')
      })
      ref.path = path;
      mockRef = ref;
      return ref
    });

    rtdbBindAsObject.mockImplementation(({ collection, ops, resolve, reject }) => {

      const { target } = ops.init()

      mockHelpers.setItem = (data, exists = true) => {
        ops.set( target, data ) // TODO: Also pass { .exists } here?
        resolve(data);
      }

      return () => {
        console.log("UNSUBSCRIBE")
      }
    });
  });

  beforeEach(() => {
    console.log("beforeEach - 2")
    mockBackend.ref.mockClear();
    if ( mockRef ) {
      mockRef.constructor.mockClear();
      mockRef.push.mockClear();
      rtdbBindAsObject.mockClear();
    }
  });

  test('subscribeNode 1', async () => {

    const node = store.subscribeNode('id1');

    const data = { numField: 9, strField: 'foo', boolField: true };

    setTimeout(() => {
      mockHelpers.setItem( data );
    }, 10)

    await node.$promise

    expect(mockRef.path).toBe('/example/sub/id1')

    expect(node.$ready).toBe(true)
    expect(node.$dirty).toEqual({})
    expect(node.$noaccess).toBe(false)

    expect( store.getData( 'id1' ) ).toEqual( data )
    expect( node.$state ).toEqual( data )

    expect( registry.state.res.example.sub['id1'] ).toEqual(data);
    expect( registry.state.sync ).toEqual({
      "/example/sub/id1": {
        "id": "id1",
        "status": "Ready"
      }
    })
    expect( registry.state ).toMatchSnapshot()

    expect( store.getAllSyncedPaths() ).toEqual({ '/example/sub/id1': 'Ready' })

    // console.log(JSON.stringify(registry.state, null, 2))
  });
});

describe.skip('fetchNode', () => {
  // fetchNode( <id:string>, <option:object> ) ⇒ GenericModel
});

describe.skip('fetchQuery', () => {
  // fetchQuery( <query:QueryDefinition> <, option:object> ) ⇒ GenericList
});

describe.skip('getList', () => {
  // getList( <idList:array<string>> <, option:object>) ⇒ GenericList
});

describe.skip('getNode', () => {
  // getNode( <id:string> <, option:object>) ⇒ GenericModel
});

describe.skip('getData', () => {
  // getData( <id:string> <, option:object>) ⇒ Object<string:any>
});

/*
describe.skip('exists', () => {
  // exists( <id:string> ) ⇒ boolean
});

describe.skip('getRegistryState', () => {
  // getRegistryState() => object
});

describe.skip('getAllSyncedPaths', () => {
  // getAllSyncedPaths() => object<string:string>
});
*/

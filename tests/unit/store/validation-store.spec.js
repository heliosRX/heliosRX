// eslint-disable-next-line import/no-unresolved
import Vue from 'vue'

import firebase from 'firebase'
import GenericStore from '@/store'
import { setup } from '@/store/GenericStore'
import { DeleteMode, UIDMethod } from '@/store/enums'
// import { isValidId } from '@/util/types.js'

setup({ Vue, firebase });

const storeNoSchema = new GenericStore(
  "/example/*",
  {},
);

const storeEmptySchema = new GenericStore(
  "/example/*",
  { schema: null },
);

const storeInvalidSchema = new GenericStore(
  "/example/*",
  { schema: { fields: null } },
);

const storeUnsafeSchema = new GenericStore(
  "/example/*",
  { schema: { unsafe_disable_validation: true } },
);

const abstracStore = new GenericStore(
  "/example/*",
  { schema: { fields: {} } },
  {
    isAbstract: true,
  }
);

test('store without schema', () => {
  const spy = jest.spyOn(global.console, 'warn')

  expect(() => {
    storeNoSchema._validate_schema({}, false)
  }).not.toThrow();

  expect(spy).toHaveBeenCalled();
  spy.mockClear()

  expect(() => {
    storeEmptySchema._validate_schema({}, false)
  }).not.toThrow();

  expect(spy).toHaveBeenCalled();
})

test('store with invalid schema', () => {
  expect(() => {
    // TODO: Better error message
    storeInvalidSchema._validate_schema({}, false)
  }).toThrow();
})

test('store with unsafe schema', () => {
  expect(() => {
    storeUnsafeSchema._validate_schema({}, false)
  }).not.toThrow();

  expect(() => {
    storeUnsafeSchema._validate_schema({
      unknownField: "value",
    }, false)
  }).not.toThrow();
})

test('default values set', () => {
  expect( storeNoSchema.enableTypeValidation ).toBeTruthy()
})

test('abstracStore', () => {
  expect(() => {
    abstracStore._validate_schema({}, false)
  }).not.toThrow();
})

/* eslint-disable no-new */
test('creating invalid stores', () => {
  expect(() => {
    new GenericStore( "" );
  }).toThrow();

  expect(() => {
    new GenericStore( null );
  }).toThrow();

  // TODO:
  // expect(() => {
  //   new GenericStore( "/ex am//ple/*" );
  // }).toThrow();

  expect(() => {
    new GenericStore( "/exam/foo/bar" );
  }).toThrow();

  expect(() => {
    new GenericStore( "/exam/*ple/*" );
  }).toThrow();

  // TODO:
  // expect(() => {
  //   new GenericStore( "/example/*/" );
  // }).toThrow();

  expect(() => {
    new GenericStore( "example/*/" );
  }).toThrow();

  expect(() => {
    new GenericStore( "/example/bbb/*/aa" );
  }).not.toThrow();
})

test('providing options to store', () => {
  let store = new GenericStore( "/a/*", {}, {
    defaultDeleteMode: DeleteMode.SOFT,
    enableTypeValidation: false,
    uidMethod: () => {}
  });

  expect(store.defaultDeleteMode).toBe(DeleteMode.SOFT);
  expect(store.enableTypeValidation).toBe(false);
  expect(store.uidMethod).toBe(UIDMethod.CUSTOM);
})

test('create substore with "with"', () => {
  let store = new GenericStore( "/foo/{itemId}/bar/*/sub", {}, {
    defaultDeleteMode: DeleteMode.SOFT,
    enableTypeValidation: false,
    uidMethod: () => {}
  });

  let newStore = store.with({ itemId: 1 });

  expect(store.isSuffixed).toBe(true)
  expect(newStore.definedProps['itemId']).toBe(1)
  expect(newStore.path).toBe("/foo/1/bar/{id}/sub")
  expect(newStore.previewPath(5)).toBe("/foo/1/bar/5/sub")
  expect(newStore.previewPath()).toBe("/foo/1/bar/{id}/sub")
})

test('reset store', () => {
  let store = new GenericStore( "/a/{a}/b/{b}/*", {}, {});

  let newStore1 = store.with({ a: 1 })
  let newStore2 = store.with({ a: 2 })
  let newStore3 = store.with({ a: 1, b: 2 })
  let newStore4 = newStore1.with({ b : 3 })

  expect(newStore4.definedProps).toMatchObject({ a: 1, b: 3 })

  store.reset();

  expect(newStore1.definedProps).toMatchObject({})
  expect(newStore2.definedProps).toMatchObject({})
  expect(newStore3.definedProps).toMatchObject({})
  expect(newStore4.definedProps).toMatchObject({})
})

test('uid methods', () => {

})

expect.extend({
  toBeValidId(received) {
    // const pass = isValidId( received );
    // eslint-disable-next-line no-control-regex, no-useless-escape
    const pass = /^((?![\/\[\]\.\#\$\/\u0000-\u001F\u007F]).)*$/.test( received )
    if (pass) {
      return {
        message: () => `expected ${received} to be valid id`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be valid id`,
        pass: false,
      };
    }
  },
});

describe.skip("uid methods", () => {

  GenericStore.setDefaultDB({
    ref() {
      return {
        push() {
          return 'PUSHID'
        },
      }
    }
  })
  let testCases = [];
  Object.keys(UIDMethod).forEach(method => {
    testCases.push([ method ])
  })
  // console.log(testCases)

  test.each(testCases)(
    "checking method %p",
    (method) => {
      if ( method === 'CUSTOM' ) {
        method = () => 'ABC-' + Math.random()
      }
      let store = new GenericStore( "/a/{a}/b/{b}/*", {}, {
        uidMethod: UIDMethod[ method ],
      });

      let id = store.generateId()
      expect(id).toBeValidId();
    }
  );
});

import GenericStore from '@/store'

const store = new GenericStore(
  "/example/*",
  {
    schema: {
      fields: {
        // createdAt: { type: 'ServerTimestamp' },
        // created:  { type: 'InitialTimestamp' },
        // modified: { type: 'CurrentTimestamp' },
        timestampField: { type: 'Timestamp' },
        strField: { type: 'String' },
        boolField: { type: 'Boolean' },
        numField: { type: 'Number' },
        mapField: { type: 'Map<String, String>' },
        arrField: { type: 'String[]' },
        "/dynField[0-9]+/": { type: "String" },
        custValidatorField: {
          type: 'String',
          validator: (s) => s.length < 5
        },
      },
    }
  },
  // { enableTypeValidation: true }
);

const storeWithReqField = new GenericStore(
  "/example/*",
  {
    schema: {
      fields: {
        strField: { type: 'String' },
        reqField: { type: 'String', required: true },
      },
    }
  },
);

test('unkown field', () => {
  expect(() => {
    store._validate_schema({
      unknownField: "value",
    }, false)
  }).toThrow();
});

test('valid field', () => {
  expect(() => {
    store._validate_schema({
      strField: "value",
    }, false)
  }).not.toThrow();
});

test('writing map', () => {
  expect(() => {
    store._validate_schema({
      mapField: {
        foo: "bar",
        bar: "foo",
      },
    }, false)
  }).not.toThrow();

  expect(() => {
    store._validate_schema({
      mapField: {
        true: 1,
        false: 2,
      },
    }, false)
  }).toThrow();
});

test('writing array', () => {
  expect(() => {
    store._validate_schema({
      arrField: ["A", "B"],
    }, false)
  }).not.toThrow();

  expect(() => {
    store._validate_schema({
      arrField: ["C", 5],
    }, false)
  }).toThrow();
});

test('writing dynamic field', () => {
  expect(() => {
    store._validate_schema({
      dynField62: "abc",
    }, false)
  }).not.toThrow();

  expect(() => {
    store._validate_schema({
      dynField62: 1,
    }, false)
  }).toThrow();

  expect(() => {
    store._validate_schema({
      dynFieldAB: 1,
    }, false)
  }).toThrow();
});

test('know field, but invalid data', () => {
  expect(() => {
    store._validate_schema({
      strField: false,
    }, false)
  }).toThrow();
});

test('custValidatorField', () => {
  expect(() => {
    store._validate_schema({
      custValidatorField: 'abc'
    }, false)
  }).not.toThrow();

  expect(() => {
    store._validate_schema({
      custValidatorField: 'abcdefghijkl'
    }, false)
  }).toThrow();
})

test('custom validator', () => {
  expect(() => {
    store._validate_schema({
      timestampField: 123456789
    }, false)
  }).not.toThrow();

  // TODO
  // expect(() => {
  //   store._validate_schema({
  //     timestampField: moment()
  //   })
  // }).not.toThrow();
})

test('required field', () => {
  expect(() => {
    storeWithReqField._validate_schema({
      strField: "a"
    }, false)
  }).toThrow();

  expect(() => {
    storeWithReqField._validate_schema({
      strField: "a"
    }, true)
  }).not.toThrow();

  expect(() => {
    storeWithReqField._validate_schema({
      strField: "a",
      reqField: "a"
    }, false)
  }).not.toThrow();
})

test('rules', () => {
  let rules = store.rules;
  let validator = rules['custValidatorField'][0].validator;

  const callback = jest.fn();
  validator(null, "abc", callback)
  expect(callback).toHaveBeenCalled();

  Object.values(rules).map( rule => {
    expect(rule[0].trigger).toBe('blur')
    // TODO:
    // console.log(rule[0].validator())
  })
})

import GenericStore from '@/store'

export const store = new GenericStore(
  "/example/*",
  {}
);

const types = [
  'String',
  'Number',
  'Boolean',
  'Object',
  'Any',
  'Null',
  'Map',
  'Array',
];

const testCaseList = [
  { value: "zzz",       types: ["String", "Any", "Unknown"] },
  { value: "",          types: ["String", "Any"] },
  { value: "foo",       types: ["String", "Any"] },
  { value: 0,           types: ["Number", "Any"] },
  { value: 1,           types: ["Number", "Any"] },
  { value: -1e29,       types: ["Number", "Any"] },
  { value: true,        types: ["Boolean", "Any"] },
  { value: false,       types: ["Boolean", "Any"] },
  { value: null,        types: ["Null"] },
  { value: undefined,   types: [] }, // --> always fail
  { value: NaN,         types: ["Any"] },
  { value: {},          types: ["Map", "Array", "Object", "Any"], info: { key: 'Any', val: 'Any' } },
  { value: [],          types: ["Array", "Any"], info: { type: 'Any' } },
];

// type: 'Map<String,String>',
testCaseList.push({
  value: {
    s1: 'bar',
    s2: 'foo',
  },
  types: ['Map', "Array", 'Object', "Any"],
  info: {
    key: 'String',
    val: 'String',
  }
})

// type: 'Map<String,Number>',
testCaseList.push({
  value: {
    n1: 4,
    n2: 6,
  },
  types: ['Map', "Array", 'Object', "Any"],
  info: {
    key: 'String',
    val: 'Number',
  }
})

function generateTestCases() {
  let testMatrix = [];
  for ( let type of types ) {
    for ( let testCase of testCaseList ) {
      let expectedResult = testCase.types.includes( type );
      testMatrix.push([ testCase.value, type, testCase.info || {}, expectedResult ])
      // store._validate_bolt_type( testCase.value, type, expectedResult );
    }
  }
  return testMatrix;
}

describe("_validate_bolt_type utility", () => {
  test.each(generateTestCases())(
    "checking if %p is of type %p (info %p), _validate_bolt_type did not return %p",
    (value, type, info, expectedResult) => {
      const result = store._validate_bolt_type( value, type, info );
      if ( result !== expectedResult ) {
        console.log("value =", value, typeof value, "type =", type, "->", result)
      }
      expect(result).toEqual(expectedResult);
    }
  );
});

test('_validate_bolt_type', () => {
  expect( store._validate_bolt_type( NaN, 'Any' ) ).toBe(true)
  expect( store._validate_bolt_type( {}, 'Array' ) ).toBe(true)
  expect( store._validate_bolt_type( true, 'String' ) ).toBe(false)
  expect( store._validate_bolt_type( true, 'string' ) ).toBe(false)
  expect( store._validate_bolt_type( { 3: "foo" }, 'Map', { key: 'String', val: 'String' } ) ).toBe(true)
})

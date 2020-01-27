import GenericModel from '@/classes/GenericModel'
import GenericList from '@/classes/GenericList'
import factory from '@/classes/factory'
import { create_context } from './mock-context';

describe('GenericList', () => {

  factory.configure({ GenericList, GenericModel });

  const modelDefinition = {
    listGetters: {
      example: ( $models, $registry, $store ) => {
        return 'return-example'
      },
    },
    listActions: {
      exampleAction({ $store, $models }) {
        return "return-action"
      },
    },
    schema: {
      fields: {
        tsField: { validate_bolt_type: 'Timestamp' },
        strField: { validate_bolt_type: 'String' },
        boolField: { validate_bolt_type: 'Boolean' },
        numField: { validate_bolt_type: 'Number' },
      },
    }
  }

  let context = create_context( modelDefinition )

  test('make_reactive_list', () => {

    let dataList = {
      id1: { strField: 'abc', boolField: true },
      id2: { strField: 'def', boolField: true },
      id3: { strField: 'ghi', boolField: true },
    };

    let list = factory.make_reactive_list(
      modelDefinition,
      dataList,
      context,
    );

    expect(list).toBeInstanceOf(GenericList)

    // console.log("asArraySorted", list.asArraySorted() );
    // console.log("asArraySortedBy", list.asArraySortedBy('strField') );
    // console.log("asArrayFilteredBy", list.asArrayFilteredBy('strField', 'abc') );
    // console.log("itemsAsArray", list.itemsAsArray() );

  });
})

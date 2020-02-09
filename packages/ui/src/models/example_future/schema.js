import * as validators from './validators'
import taskChecklistItem from '../taskChecklistItem'

/*
let fields = []
for ( var exportName in schema ) {
  fields.push( { model: exportName, ...schema[ exportName ] } );
}
*/

export default {

  // Syntax: create( required, optional, BACKEND )
  create({ name }, data, BACKEND) {
    return {
      name:                 name,
      a:                    'X',
      b:                    0,
      nested: {
        c:                  'string',
        d:                  true,
      },
      goalId:               null,
      checklist_item_list:  {}
    };
  },

  fields: {
    'name': {
      validator: () => true,
      type: 'String',
      required: true,
      db_identifier: 'n',
      /* vue-form-generator
      label: 'Name of goal',
      type: 'input',
      inputType: 'text',
      readonly: false,
      disabled: false,
      */
    },
    'a': {
      validate: v => v.length < 30,
      type: 'String',
    },
    'b': {
      validator: () => true,
      type: 'Boolean',
    },
    'nestedA': {
      isNested: true,
      'c': {
        validate: validators.isStringOrNull,
        type: 'String | Null',
      },
      'd': {
        type: 'Boolean',
      },
    },
    'nestedB': {
      isNested: true,
      'c': {
        validate: validators.isStringOrNull,
        type: 'String | Null',
      },
      'nestedC': {
        isNested: true,
        'c': {
          validate: validators.isStringOrNull,
          type: 'String | Null',
        },
        'd': {
          type: 'Boolean',
        },
      },
    },
    'nested.c': {
      validate: validators.isStringOrNull,
      type: 'String | Null',
    },
    'nested.d': {
      type: 'Boolean',
    },
    'goalId': {
      validate: validators.isUUID,
      type: 'ID',
      reference: 'goalMeta'
      /* reference can be used to check if referenced data exists */
    },
    'checklist_item_list': {
      validate: validators.isListOfType( taskChecklistItem ),
      type: 'Map<ID, taskChecklistItem>'
      // or: type: 'taskChecklistItem[]'
    },

    'someNumber': {
      type: 'Number',
      validator: () => true
    },
    'created': {
      type: 'InitialTimestamp',
      validator: () => true
    },
    'modified': {
      type: 'CurrentTimestamp',
      validator: () => true
    }
  },

  unsafe_disable_validation: true,
};

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
      validate: () => true,
      validate_bolt_type: 'String',
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
      validate_bolt_type: 'String',
    },
    'b': {
      validate: () => true,
      validate_bolt_type: 'Boolean',
    },
    'nestedA': {
      isNested: true,
      'c': {
        validate: validators.isStringOrNull,
        validate_bolt_type: 'String | Null',
      },
      'd': {
        validate_bolt_type: 'Boolean',
      },
    },
    'nestedB': {
      isNested: true,
      'c': {
        validate: validators.isStringOrNull,
        validate_bolt_type: 'String | Null',
      },
      'nestedC': {
        isNested: true,
        'c': {
          validate: validators.isStringOrNull,
          validate_bolt_type: 'String | Null',
        },
        'd': {
          validate_bolt_type: 'Boolean',
        },
      },
    },
    'nested.c': {
      validate: validators.isStringOrNull,
      validate_bolt_type: 'String | Null',
    },
    'nested.d': {
      validate_bolt_type: 'Boolean',
    },
    'goalId': {
      validate: validators.isUUID,
      validate_bolt_type: 'ID',
      reference: 'goalMeta'
      /* reference can be used to check if referenced data exists */
    },
    'checklist_item_list': {
      validate: validators.isListOfType( taskChecklistItem ),
      validate_bolt_type: 'Map<ID, taskChecklistItem>'
      // or: validate_bolt_type: 'taskChecklistItem[]'
    },

    'someNumber': {
      validate_bolt_type: 'Number',
      validate: () => true
    },
    'created': {
      validate_bolt_type: 'InitialTimestamp',
      validate: () => true
    },
    'modified': {
      validate_bolt_type: 'CurrentTimestamp',
      validate: () => true
    }
  },

  unsafe_disable_validation: true, // entfällt später
};

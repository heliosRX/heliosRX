import { moment } from 'heliosrx'

export default {

  // Syntax: create( required, optional, BACKEND )
  create({ name }, data, BACKEND) {
    return {
      createdAt:     moment.currentTimeServer(BACKEND),
      name:          name,
      a:             'X',
      b:             false,
      someNumber:    data.someNumber || null,
    };
  },

  create_required: [ 'name' ],
  // unsafe_disable_validation: true,

  fields: {
    createdAt: {
      validate_bolt_type: 'ServerTimestamp',
    },
    name: {
      validate: () => true,
      validate_bolt_type: 'String',
      required: true,
      abbrv: 'n'
    },
    a: {
      validate_bolt_type: 'String',
      validate: v => v.length < 30
    },
    b: {
      validate_bolt_type: 'Boolean',
      validate: () => true
    },
    someNumber: {
      validate_bolt_type: 'Number',
      validate: () => true
    },
    created: {
      validate_bolt_type: 'InitialTimestamp',
      validate: () => true
    },
    modified: {
      validate_bolt_type: 'CurrentTimestamp',
      validate: () => true
    }
  },
};

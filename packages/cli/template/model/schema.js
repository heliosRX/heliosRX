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
      validator: () => true,
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
      validator: () => true
    },
    someNumber: {
      validate_bolt_type: 'Number',
      validator: () => true
    },
    created: {
      validate_bolt_type: 'InitialTimestamp',
      validator: () => true
    },
    modified: {
      validate_bolt_type: 'CurrentTimestamp',
      validator: () => true
    }
  },
};

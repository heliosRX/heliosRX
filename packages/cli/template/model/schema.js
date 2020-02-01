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
      type: 'ServerTimestamp',
    },
    name: {
      validator: () => true,
      type: 'String',
      required: true,
      abbrv: 'n'
    },
    a: {
      type: 'String',
      validate: v => v.length < 30
    },
    b: {
      type: 'Boolean',
      validator: () => true
    },
    someNumber: {
      type: 'Number',
      validator: () => true
    },
    created: {
      type: 'InitialTimestamp',
      validator: () => true
    },
    modified: {
      type: 'CurrentTimestamp',
      validator: () => true
    }
  },
};

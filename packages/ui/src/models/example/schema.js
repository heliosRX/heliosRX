import { moment } from 'heliosrx'

export default {

  // Syntax: create( required, optional, BACKEND )
  create({ name }, data, BACKEND) {
    return {
      createdAt:     moment.currentTimeServer(BACKEND),
      name:          name,
      // a:             'X',
      // b:             false,
      someNumber:    data.someNumber || null,
      /*
      pos: {
        x: 10,
        y: 10
      }
      */
    };
  },

  create_required: [ 'name' ],

  fields: [
    {
      model: 'createdAt',
      type: 'ServerTimestamp',
    },
    {
      model: 'name',
      validator: () => true,
      type: 'String',
      required: true,
      abbrv: 'n'
    },
    {
      model: 'a',
      type: 'String',
      validate: v => v.length < 30
    },
    {
      model: 'b',
      type: 'Boolean',
      validator: () => true
    },
    {
      model: 'someNumber',
      type: 'Number',
      validator: () => true
    },
    {
      model: 'created',
      type: 'InitialTimestamp',
      validator: () => true
    },
    {
      model: 'modified',
      type: 'CurrentTimestamp',
      validator: () => true
    }
  ],

  // unsafe_disable_validation: true,
};

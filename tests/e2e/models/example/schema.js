import { moment } from 'heliosrx'

export default {

  create({ name }, data, BACKEND) {
    return {
      createdAt:     moment.currentTimeServer(BACKEND),
      name:          name,
      someNumber:    data.someNumber || null,
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
};

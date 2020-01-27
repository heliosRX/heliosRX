import { moment } from 'heliosrx'

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
      validate_bolt_type: 'ServerTimestamp',
    },
    {
      model: 'name',
      validator: () => true,
      validate_bolt_type: 'String',
      required: true,
    },
    {
      model: 'a',
      validate_bolt_type: 'String',
      validate: v => v.length < 30
    },
    {
      model: 'b',
      validate_bolt_type: 'Boolean',
      validator: () => true
    },
    {
      model: 'someNumber',
      validate_bolt_type: 'Number',
      validator: () => true
    },
    {
      model: 'created',
      validate_bolt_type: 'InitialTimestamp',
      validator: () => true
    },
    {
      model: 'modified',
      validate_bolt_type: 'CurrentTimestamp',
      validator: () => true
    }
  ],
};

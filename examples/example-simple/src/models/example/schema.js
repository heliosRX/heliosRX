import moment from 'heliosrx/src/moment'

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
      validate_bolt_type: 'ServerTimestamp',
    },
    {
      model: 'name',
      validate: () => true,
      validate_bolt_type: 'String',
      required: true,
      abbrv: 'n'
    },
    {
      model: 'a',
      validate_bolt_type: 'String',
      validate: v => v.length < 30
    },
    {
      model: 'b',
      validate_bolt_type: 'Boolean',
      validate: () => true
    },
    {
      model: 'someNumber',
      validate_bolt_type: 'Number',
      validate: () => true
    },
    {
      model: 'created',
      validate_bolt_type: 'InitialTimestamp',
      validate: () => true
    },
    {
      model: 'modified',
      validate_bolt_type: 'CurrentTimestamp',
      validate: () => true
    }
  ],

  // unsafe_disable_validation: true, // entfällt später
};

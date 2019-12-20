import moment from 'heliosrx/src/moment'

export default {
  create( { title, creatorUserId }, data, BACKEND ) {

    return {
      title:          title,
      createdAt:      moment.currentTimeServer(BACKEND),
      createdBy:      creatorUserId,
      description:    data.description || "",
      picture:        data.picture || '',
    };
  },

  fields: [
    {
      model: 'title',
      label: 'Name of tasklist',
      type: 'input',
      inputType: 'text',
      readonly: false,
      disabled: false,
      validate_bolt_type: 'String'
    },
    { model: 'createdBy', validate_bolt_type: 'UserID' },
    { model: 'createdAt', validate_bolt_type: 'ServerTimestamp' },
    { model: 'done', validate_bolt_type: 'Boolean' },
    {
      model: 'description',
      label: 'This is the tasklist description',
      type: 'textarea',
      inputType: 'text',
      readonly: false,
      disabled: false,
      validate_bolt_type: 'String'
    },
    {
      model: 'picture',
      label: 'picture',
      type: 'image',
      validate_bolt_type: 'String'
    },
  ]
};

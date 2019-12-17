import moment from '@/moment-gp'

export default {
  modelActions: {},
  modelGetters: {},
  staticGetters: {},
  staticActions: {},

  schema: {

    VALID_MESSAGE_TYPES: [
      'TASK:ASSIGNED',
      'TASK:DELETED',
      'TASK:DONE',
    ],

    create({ senderUserId, message, type = null }, data) {

      if ( type && !this.VALID_MESSAGE_TYPES.includes(type) ) {
        throw new Error('Invalid message type: ' + type)
      }

      let messageObject = {
        senderUserId: senderUserId,
        createdAt:    moment.currentTimeServer('REALTIMEDB'),
        message:      message,
        unread:       true,
        type:         type, // No type means messages
      };

      if ( type ) {
        Object.assign(
          messageObject,
          this.additional_type_specific_fields(type, data)
        );
      }

      return messageObject;
    },

    additional_type_specific_fields(type, data) {

      switch (type) {
        case 'TASK:DELETED':
        case 'TASK:ASSIGNED':
        case 'TASK:DONE':

        return {
          /* */
          taskId:             data.taskId || null,

          /* cached task name */
          cachedName:         data.cachedName || null,
        }
      }
    },

    fields: {
      senderUserId: { validate_bolt_type: 'UserID' },
      createdAt: { validate_bolt_type: 'ServerTimestamp' },
      message: { validate_bolt_type: 'String' },
      unread: { validate_bolt_type: 'Boolean' },
      type: { validate_bolt_type: 'String' },

      /* type TASK */
      taskId: { validate_bolt_type: 'AnyID' },
      cachedName: { validate_bolt_type: 'String' },
    }
  }
};

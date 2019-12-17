import moment from '@/moment-gp'

export default {
  create( { authorUserId, message }, data ) {
    return {
      authorUserId: authorUserId,
      createdAt:    moment.currentTimeServer('REALTIMEDB'),
      message:      message,
    }
  },

  fields: {
    authorUserId: { validate_bolt_type: 'UserID' },
    createdAt: { validate_bolt_type: 'ServerTimestamp' },
    message: { validate_bolt_type: 'String' },
  }
};

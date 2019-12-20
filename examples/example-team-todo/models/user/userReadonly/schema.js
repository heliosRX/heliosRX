import moment from 'heliosrx/src/moment'

export const VALID_USER_STATUS = [
  "init",
  "creating",
  "active",
  "inactive",
  "deleted",
];

export default {
  create( _, data ) {
    return {
      createdAt:      moment.currentTimeServer('REALTIMEDB'),

      /* User account status */
      status:         data.status || "creating",
    }
  },

  fields: {
    createdAt: { validate_bolt_type: 'ServerTimestamp' },
    status: { validate_bolt_type: 'String' },
  }
};

import { moment } from 'heliosrx'

export default {
  <% if (exampleIncludeCreateFunc) { %>
  create({ userId, value }) {
    return {
      createdAt: moment.currentTimeServer('REALTIMEDB'),
      value:     value,
      userId:    userId,
    };
  },
  <% } %>
  fields: {
    createdAt: { validate_bolt_type: 'ServerTimestamp' },
    userId:    { validate_bolt_type: 'UserID' },
    value:     { validate_bolt_type: 'Number' },
  },
};

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
    createdAt: { type: 'ServerTimestamp' },
    userId:    { type: 'UserID' },
    value:     { type: 'Number' },
  },
};

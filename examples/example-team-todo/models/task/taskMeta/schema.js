import moment from '@/moment-gp'

export default {
  create({ userId }, data, BACKEND) {

    return {
      createdAt:          moment.currentTimeServer(BACKEND),
      createdBy:          userId,
      title:              data.title || "New task",
      deleted:            data.deleted || false,
      sortidx:            data.sortidx || 100,
      finishedAt:         data.finishedAt || 0,
      description:        data.description || "",
      done:               data.done || false,
    }
  },

  fields: {
    createdAt: { validate_bolt_type: 'ServerTimestamp' },
    createdBy: { validate_bolt_type: 'MemberID' },
    title: { validate_bolt_type: 'String' },
    deleted: { validate_bolt_type: 'Boolean' },
    sortidx: { validate_bolt_type: 'Number' },
    done: { validate_bolt_type: 'Boolean' },
    finishedAt: { validate_bolt_type: 'Timestamp' },
  }
};

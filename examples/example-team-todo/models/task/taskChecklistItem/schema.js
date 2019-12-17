export default {
  create( _, data ) {
    return {
      text:       data.text       || "",
      done:       data.done       || false,
      sortidx:    data.sortidx    || 0,
    }
  },

  fields: {
    text: { validate_bolt_type: 'String' },
    done: { validate_bolt_type: 'Boolean' },
    sortidx: { validate_bolt_type: 'Number' },
  }
};

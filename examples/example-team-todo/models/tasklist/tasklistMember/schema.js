export default {
  create({ title }) {
    return {
      isOwner: true,
    };
  },
  fields: {
    isOwner: { validate_bolt_type: 'Boolean' },
  }
};

export default {

  // Contact = Somebody I trust

  create({ contactUserId }, data) {
    return {
      contactUserId: contactUserId, // stored in key
      numNewMessages: 0,
    };
  },

  fields: {
    contactUserId: { validate_bolt_type: 'UserID' },
    numNewMessages: { validate_bolt_type: 'Number' },
  }
};

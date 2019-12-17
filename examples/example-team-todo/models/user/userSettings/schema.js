export default {
  create( { userEmail }, data ) {
    return {
      /* This is special field that new users can write to.
      A cloud function listens for changes of this value */
      clientActivationRequest: null,

      /* This is a special field that user can use to request
         a permanent deletion of their account and personal data */
      clientWipeoutRequest: null,

      settings: {
        nightMode:  false,
      },
    }
  },

  fields: {
    clientActivationRequest: { validate_bolt_type: 'ServerTimestamp' },
    clientWipeoutRequest: { validate_bolt_type: 'ServerTimestamp' },
    settings: { validate_bolt_type: 'UserSettingsSettings' },
    'settings/nightMode': { validate_bolt_type: 'Boolean' },
  }
};

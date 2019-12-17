import schema from './schema'

export default {
  modelActions: {},
  modelGetters: {},
  staticGetters: {

    contact_list: ( $models, $registry, $store ) => {
      $registry.state.res.users.map(contactId => {
        return this.$models.userContact.get_contact_by_id(contactId) // TODO: Rename
      });
    },

    /*
    Returns chat history with user
    */
    chat_history_with_contact_id: ( $models, $registry, $store ) => { // TODO: Rename
      if ( !( 'contactId' in $store.definedProps ) ) {
        throw new Error('Please define contactId in "with".')
      }

      let contactId = $store.definedProps[ 'contactId' ]
      console.log("TODO", contactId)
    },

    /*
    Returns unread messages by user
    */
    get_unread_messages_with_contact_id: ( $models, $registry, $store ) => { // TODO: Rename
      if ( !( 'contactId' in $store.definedProps ) ) {
        throw new Error('Please define contactId in "with".')
      }

      let contactId = $store.definedProps[ 'contactId' ]
      console.log("TODO", contactId)
    },

    numOfAllUnreadMessages: ( $models, $registry, $store ) => {
      let contacts = $models.userContact.getList()
      if ( contacts.$readySome ) {
        return contacts.itemsAsArray().reduce((acc, contact) => acc + contact.numNewMessages, 0);
      }
      return 0
    },
  },
  staticActions: {

    get_contact_status_by_id({ $store, $models, $registry }, contactUserId) {

      if ( contactUserId in $registry.state.res.user ) {
        let data = $registry.state.res.user[ contactUserId ].status || {};
        data.displayName = data.displayName || 'N/A';
        data.profilePic  = data.profilePic || '';
        return data;
      } else {
        return null;
      }
    },
  },
  schema:  schema,
};

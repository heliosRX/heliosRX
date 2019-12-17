export default {
  modelActions: {},
  modelGetters: {},
  staticGetters: {
  },
  staticActions: {
    currentUserId({ $store }) {
      return $store.defaultUserId;
    },
  },
  schema: {}
};

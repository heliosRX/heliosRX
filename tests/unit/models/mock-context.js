export function create_context( modelDefinition, name = null ) {
  return {
    registry: {},
    model: {
      modelDefinition: modelDefinition,
      name: name || "default",
      _validate_schema() {
        return true
      },
      _get_uid() {
        return 'abc';
      },
      update: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      restore: jest.fn(() => Promise.resolve()),
      // update( id, payload ) {
      //   console.log("update called")
      //   return Promise.resolve();
      // },
      // remove( id, soft_delete ) {
      //   console.log("remove called")
      //   return Promise.resolve();
      // },
      // restore( id ) {
      //   console.log("restore called")
      //   return Promise.resolve();
      // },
    }
  }
}

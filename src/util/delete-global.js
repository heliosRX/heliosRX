// DEPRECATED
export default {
  actions: {
    customAction: () => {
      console.log("custom action 1");
    },

    rules({ store }) {
      /* TODO: Return custom validation rules for elements
       * See: https://element.eleme.io/#/en-US/component/form#custom-validation-rules
       */
      let schema = store.modelDefinition.schema.fields;
      let rules = {};
      schema.forEach(field => {
        rules[ field.model ] = { validator: field.validator, trigger: 'blur' };
      });
      return rules;
    },
  },

  getters: {
    dynamic_custom_getter( $models ) {
      /* INFO: This getter is cached! */
      console.log("[GETTER] dynamic_custom_getter");

      let goals = $models.goalMeta.requireAll()
      if ( !goals.$ready ) {
        return 0;
      }
      return Object.keys( goals.items ).length;
    }
  }
}

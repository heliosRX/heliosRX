import moment from './moment-enhanced.js'

export default /* MomentPlugin */ {

  install(Vue, options) {
    console.log("[EMO] Installing momentPlugin");

    if ( options && options.store ) {
      let unwatch = options.store.watch(
        (state, getters) => getters["app/user_get_dateformat"],
        user_timezone => {
          if ( unwatch ) {
            console.log("[EMO] Self destroying watcher");
            unwatch(); // Self destroy
          }
        },
        { immediate: true }
      );
    }

    Object.defineProperties(Vue.prototype, {
      $moment: {
        get() {
          return moment;
        },
      },
    });
  }
}

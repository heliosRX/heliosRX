import moment from './moment-enhanced.js'
import { info, INFO_MOMENT } from "../util/log"

export default /* MomentPlugin */ {

  install(Vue, options) {
    info( INFO_MOMENT, "Installing momentPlugin");

    if ( options && options.store ) {
      let unwatch = options.store.watch(
        (state, getters) => getters["app/user_get_dateformat"],
        user_timezone => {
          if ( unwatch ) {
            info( INFO_MOMENT, "Self destroying watcher");
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

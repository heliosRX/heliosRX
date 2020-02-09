/* momen plugin for helios specific date time conversions */
// import { _Vue as Vue } from '../external-deps'
// import moment from "moment-timezone/builds/moment-timezone-with-data-2012-2022.min.js"
// const moment = {}
// import momentDurationFormatSetup from "moment-duration-format"
// import firebase from "@firebase/app"; // TODO: Remove dependency
// import "@firebase/database";

import firebase from "./firebase-shim";
import { matchUserInputDuration } from '../util/types'
import { info, warn, INFO_MOMENT, WARNING_MOMENT_INVALID_DATE } from "../util/log"

const moment = require("moment-timezone/builds/moment-timezone-with-data-2012-2022.min.js")

/*******************************************************************************

TODO: Check out Vue.util.defineReactive

TODO: Load tz data async:
    - moment.tz.load(require('./data/packed/latest.json'));
    - check with: moment.tz.zone("UnloadedZone");

TODO: prevent moment from being called directly moment()

*******************************************************************************/

var localStorage
if ( !process.browser ) {
  localStorage = {
    getItem() { return 'Europe/Berlin' }, /* This will cause a death spiral, when enabled in a browser! */
    setItem() {}
  };
} else {
  localStorage = window.localStorage;
}

const convert_timezoneNeutral_to_qualifiedMomentObj = (momentObj, userTimezone) => {

  /* This funcion is used to convert 'timezone neutral' moment object, that are
  used to describe timeslots in timeslot collection, into 'qualified moment object',
  which means that the current user timezone gets 'appended' making the moment
  object timezone specific or 'timezoned'. */

  // moment.parseZone() ?

  /* Get utc formated ISO string like "2018-12-09T03:41:19Z" and remove last character 'Z' */
  let isoString = momentObj.clone().utc().format();
  let timezoneNeutralIsoString = isoString.substring(0, isoString.length - 1)

  /* Append the current user timezone to the "timezone neutral" datetime, so that
      '2018-05-06T14:00'
             +
      'America/New_York'
          becomes
      '2018-05-06T14:00:00-04:00'.
  */
  return moment.tz(timezoneNeutralIsoString, userTimezone);
}

export function enhanceMomentJS( moment ) {

  info(INFO_MOMENT, "enhanceMomentJS");

  /* ... */
  moment.isEnhanced = true;
  moment.prototype.isEnhanced = true;

  /* ------------------------------------------------------------------------ */

  moment.fromFirestore = ( firestoreDatetimeObject ) => {
    /* This funcion is mostly called to convert exceptions timestamps to
       moment object. It can probably be used to convert 'neutral' utc
      timestmaps to qualified calendar input.
      ( Also we have to check if it is used anywhere else )
    */

    if ( firestoreDatetimeObject
      && typeof firestoreDatetimeObject === 'object'
      && firestoreDatetimeObject.constructor.name === 'Timestamp' ) { // TODO: might not work in production
      return moment( firestoreDatetimeObject.toDate() );
    } else {
      return moment( firestoreDatetimeObject )
    }
  }

  moment.fromRealtimeDB = ( timestamp ) => {
    return moment.unix( timestamp );
  }

  moment.fromRealtimeServerTime = ( timestamp ) => {
    return moment( timestamp );
  }

  moment.fromStore = (ISOString) => {
    return moment( ISOString ); /* Deserialize moment object */
  }

  /* ------------------------------------------------------------------------ */

  moment.prototype.toFirestore = function() {
    // TODO: Check timezones
    return firebase.firestore.Timestamp.fromDate( this.toDate() );
  }

  moment.prototype.toRealtimeDB = function() {
    return this.unix();
  }

  moment.prototype.toRealtimeServerTime = function() {
    // We store timestmaps in seconds, while ServerTime is in milliseconds
    return this.valueOf();
  }

  moment.prototype.toBackend = function(backend) {
    return backend === 'REALTIMEDB'
      ? this.toRealtimeDB()
      : this.toFirestore()
  }

  moment.prototype.toStore = function () {
    return this.format(); /* Serialize moment object */
  }

  moment.prototype.formatDateLong = function () {
    return this.format(this.user_dateformat); /* Serialize moment object */
  }

  /* ------------------------------------------------------------------------ */

  moment.prototype.isTimezoneNeutral = false; // TODO

  moment.fromDateAndTime = (ISODate, time) => {
    if ( !time ) {
      throw new Error('Not implemented');
    }
    /*
    Moment's string parsing functions like moment(string) and moment.utc(string)
    accept offset information if provided, but convert the resulting Moment object
    to local or UTC time. In contrast, moment.parseZone() parses the string but keeps
    the resulting Moment object in a fixed-offset timezone with the provided offset
    in the string.

    What parseZone really means here, is:
    parseZone => createDateWithoutZone

    Why so complicated?
    */
    // let momentObj = moment.parseZone( ISODate + 'T' + time );

    /* The moment.tz constructor takes all the same arguments as the moment
    constructor, but uses the last argument as a time zone identifier. */
    let momentObj = moment.tz( ISODate + 'T' + time, moment.user_timezone);

    /* This function is used when creating timeslot for a given time and a give date.
       Usually we want to treat time preferences in the user timezone */
    momentObj.isTimezoneNeutral = true;

    return momentObj;
  }

  moment.fromTimezoneNeutral = ( date ) => {
    if ( !moment.isValidDate( date ) ) {
      warn(WARNING_MOMENT_INVALID_DATE, "[fromTimezoneNeutral]", "Invalid date", date)
      return null
    }
    if ( !date.isTimezoneNeutral ) {
      throw new Error('Input is not timezone neutral')
    }
    // TODO: How do we want to handle 'timezone neutral'?
    return convert_timezoneNeutral_to_qualifiedMomentObj( date, moment.user_timezone );
  }

  moment.prototype.changeTimezoneButKeepTime = function(timezone) {
    return convert_timezoneNeutral_to_qualifiedMomentObj( this, timezone );
  }

  /* ------------------------------------------------------------------------ */

  moment.isValidDate = function(obj) {
    return obj
        && moment.isMoment(obj)
        && !!obj.isEnhanced
        && obj.isValid();
    // TODO: move util function here
  }

  moment.currentTime = () => {
    /* WHY: This function should return the same result as moment(), even when
            a custom timezone is set, since we set .locale().
            Using this function is still the prefered way to get the current
            time, because it adds an extra layer of control.
    */
    if ( !moment.user_timezone ) {
      throw new Error('User timezone is not set')
    }

    return moment().tz( moment.user_timezone );
  }

  moment.currentTimeUTC = () => {
    return moment().utc();
  }

  moment.currentDate = ( ) => {
    return moment().tz( moment.user_timezone ).startOf('day');
  }

  moment.currentDateISO = ( ) => {
    moment().tz( moment.user_timezone ).format('YYYY-MM-DD')
  }

  moment.currentDateSleepCorrected = () => {
    const sleepDayBreak = 3 // Daybreak at 3 AM in the morning
    return moment()
            .tz(moment.user_timezone)
            .subtract(sleepDayBreak, 'hours')
            .startOf('day');
  }

  moment.currentCalendarweek = () => {
    return moment().tz( moment.user_timezone ).format('W');
  }

  moment.currentTimeServer = ( backend ) => {
    return backend === 'REALTIMEDB'
           ? firebase.database.ServerValue.TIMESTAMP // {".sv": "timestamp"}
           : firebase.firestore.FieldValue.serverTimestamp();
  }

  /* converts 'HH:mm' to fractional time in hours */
  moment.convertHHmmToFractional = (value) => {
    return (moment(value, 'HH:mm') - moment().startOf('day')) / 3600 / 1e3
  }

  /* converts fractional time in hours to 'HH:mm' */
  moment.convertFractionalToHHmm = (value) => {
    return moment.utc( value * 3600 * 1e3 ).format('HH:mm')
  }

  /* Parse time */
  moment.parseTimeNatural = (input, referenceTime = null ) => {
    let formats = ["HH:mm", "HH:mm A", "HH A", "HH"];
    input = (input || '').trim();
    if ( !input ) {
      return null
    }
    if ( input[0] === '+' || input[0] === '-' ) {

      let sign = input[0] === '-' ? -1 : +1;
      let text = input.slice(1);

      if ( !/[mhs]/i.test(text) ) {
        text += "m"
      }

      let durationInfo = matchUserInputDuration('!' + text);

      if ( !durationInfo.match ) {
        return null;
      }

      let duration = sign * durationInfo.duration
      return moment( referenceTime, 'HH:mm' ).add( duration, 'seconds' )
    } else if ( input === 'now' ) {
      return moment();
    }
    return moment(input, formats);
  }

  if ( process.browser ) {
    window.moment = moment;
  }
}

// export function attachTimezoneWatcher( moment, store ) {
//
//     info(INFO_MOMENT, "attaching timezone watcher");
//
//     /* Install watcher in store and wait until we get the user timezone. This
//       also means that the store is now initialized and was using a moment
//       object with a potentially different timezone... we have to take care of
//       that */
//     let unwatch_user_get_timezone = store.watch(
//       (state, getters) => getters["app/user_get_timezone"],
//       user_timezone => {
//
//         info(INFO_MOMENT, "got new user_timezone", user_timezone);
//
//         // TODO: The user might not have a timezone configured, in this case
//         //       we use the timezone of the operating system, which is perfectly
//         //       fine.
//
//         if ( user_timezone === 'I/DONT/KNOW' ) {
//           /* HACK: we don't know the TZ yet - do nothing */
//           // TODO: null
//           return;
//         }
//
//         if ( localStorage.getItem('timezone') !== user_timezone ) {
//           /* We have a problem: The user has a different timezone then we
//             assumed, this means the store is fucked up */
//           warn(WARNING_DIFFERENT_LOCAL_TIMZONE, "locally saved timezone does not match user timezone",
//             localStorage.getItem('timezone'), "!=", user_timezone);
//
//           /* Update local storage */
//           localStorage.setItem('timezone', user_timezone);
//
//           // TODO: Ask the user if we should set his timezone to moment.tz.guess,
//           //       but only ask once
//
//           // TODO: Also we should check if the users operating system changed
//           //       the timezone (e.g. travel)
//           //       We can do this by further checking if
//           //        localStorage.timezone  !== moment.tz.guess
//           //       Again, we should only ask once after every change and only
//           //       if the user has a timezone configured.
//
//           if ( location /* check if this is a browser */ ) {
//             // TODO: Make absolutly sure, that we don't end up in a death sprial */
//             location.reload()
//           } else {
//             throw new Error('Timezone mismatch detected. Timezone consistency can not be guaranteed.')
//           }
//         }
//
//         info(INFO_MOMENT, "Setting user timezone in moment object");
//
//         /* Set default timezone */
//         moment.tz.setDefault(user_timezone)
//         // moment.tz.setDefault("Europe/Berlin"); // Don't do that, see FAQ
//         // moment.tz.setDefault(String);
//
//         // TODO: This only works because it is fast
//         // but moment.user_timezone is not reactive!
//         moment.user_timezone = user_timezone;
//         // Either create getter that will tell templates when tz is ready
//         // or delay everything
//
//         // TODO: Testen...
//         Vue.util.defineReactive(moment, 'user_timezone', user_timezone, null, true)
//
//         // info(INFO_MOMENT, "unwatch_user_get_timezone", unwatch_user_get_timezone);
//         if ( unwatch_user_get_timezone ) {
//           info(INFO_MOMENT, "Self destroying watcher");
//           unwatch_user_get_timezone(); // Self destroy
//         }
//       },
//       { immediate: true }
//     );
//     /// or ... store.subscribe((mutation, state))
// }

export let localeSetUp = (function () {

  info(INFO_MOMENT, "set up");
  info(INFO_MOMENT, "localStorage.getItem('timezone')", localStorage.getItem('timezone'));

  if ( !localStorage.getItem('timezone') ) {
    /* Let's be optimistic and assume that the user configured the same timezone
       that moment.tz.guess will give us. If not we deal with that later... */
    localStorage.setItem('timezone', moment.tz.guess());
  }

  /* Set default values */
  let user_timezone = localStorage.getItem('timezone');
  info(INFO_MOMENT, "Setting user timezone to", user_timezone);
  moment.tz.setDefault(user_timezone)
  moment.user_timezone = user_timezone;

  // moment.locale("en"); // -> i18n

  // momentDurationFormatSetup( moment );
  enhanceMomentJS( moment );
})();

export default moment;

/**
 * heliosRX v0.2.4
 * (c) 2020 Thomas Weustenfeld
 * @license MIT
 */
import Vue from 'vue';
import Vuex from 'vuex';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var loglevel = createCommonjsModule(function (module) {
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    if ( module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(commonjsGlobal, function () {

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";
    var isIE = (typeof window !== undefinedType) && (
        /Trident\/|MSIE /.test(window.navigator.userAgent)
    );

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // Trace() doesn't print the message in IE, so for that case we need to wrap it
    function traceForIE() {
        if (console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                // In old IE, native console methods themselves don't have apply().
                Function.prototype.apply.apply(console.log, [console, arguments]);
            }
        }
        if (console.trace) { console.trace(); }
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (methodName === 'trace' && isIE) {
            return traceForIE;
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType) { return; }

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          if (typeof window === undefinedType) { return; }

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          // Fallback to cookies if local storage gives us nothing
          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location !== -1) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Top-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    return defaultLogger;
}));
});

var WARNING_DEFINE_UNKNOWN_PROP         = 'store/define-unknown-prop';
var WARNING_RESET_MAX_DEPTH             = 'store/reset-max-depth-reached';
var WARNING_NO_CREATE_FUNCTION          = 'model/no-create-function';
var WARNING_INVALID_ID                  = 'model/invalid-id';
var WARNING_EMPTY_SCHEMA                = 'model/empty-schema';
var WARNING_UKNONWN_VALIDATION_TYPE     = 'model/unknown-validation-type';
var WARNING_MODEL_INVALID_MOMENT        = 'model/invalid-moment';
var WARNING_MODEL_OTHER                 = 'model/other';
var WARNING_NO_SCHEMA                   = 'model/no-schema';
var WARNING_NAME_CONFLICT               = 'model/no-name-conflict';
var WARNING_CLIENT_VALIDATION           = 'model/client-validation-failed';
var WARNING_UNKNOWN_TIMESTAMP_TYPE      = 'model/unknown-timestamp-type';
var WARNING_WRITING_UNDEFINED           = 'model/writing-undefined';
var WARNING_INVALID_TIMESTAMP_SERVER    = 'model/invalid-timestamp-from-server';
var WARNING_MOMENT_INVALID_DATE         = 'moment/invalid-date';
var WARNING_DEPRECATED                  = 'common/deprecated';
var WARNING_COMMON                      = 'common/common';
var WARNING_SYNCING_SUBSET_DATA         = 'read/sync-subset-data';
var WARNING_SYNCING_INDIVIDUAL          = 'read/sync-individial-but-list-supported';
var WARNING_SYNCING_EXISTING_QUERY_PATH = 'read/sync-existing-query-path';
var WARNING_ACCESSING_UNSYNCED_DATA     = 'read/accessing-unsynced-data';
var WARNING_PERMISSION_DENIED           = 'read/permission-denied';

var INFO_COMMON            = 'common';
var INFO_MODEL             = 'model';
var INFO_COLLECTION        = 'collection';
var INFO_STORE             = 'store';
var INFO_STORE_WRITE       = 'store-write';
var INFO_MOMENT            = 'moment';
var INFO_REGISTRY          = 'registry';
var INFO_DEEPMERGE         = 'deep-merge';
var INFO_PERMISSION        = 'permission';
var INFO_AUTO_UNSUBSCRIBE  = 'store/unsubscribe/auto';
var INFO_SUBSCRIBE         = 'store/subscribe';
var INFO_SUBSCRIBE_QUERY   = 'store/subscurbe/query';
var INFO_SUBSCRIBE_DETAILS = 'store/subscribe/details';
var INFO_READ_INIT         = 'store/subscribe/init';
var INFO_READ_REMOVE       = 'store/unsubscribe';

var loggerChannel = /*#__PURE__*/Object.freeze({
	__proto__: null,
	WARNING_DEFINE_UNKNOWN_PROP: WARNING_DEFINE_UNKNOWN_PROP,
	WARNING_RESET_MAX_DEPTH: WARNING_RESET_MAX_DEPTH,
	WARNING_NO_CREATE_FUNCTION: WARNING_NO_CREATE_FUNCTION,
	WARNING_INVALID_ID: WARNING_INVALID_ID,
	WARNING_EMPTY_SCHEMA: WARNING_EMPTY_SCHEMA,
	WARNING_UKNONWN_VALIDATION_TYPE: WARNING_UKNONWN_VALIDATION_TYPE,
	WARNING_MODEL_INVALID_MOMENT: WARNING_MODEL_INVALID_MOMENT,
	WARNING_MODEL_OTHER: WARNING_MODEL_OTHER,
	WARNING_NO_SCHEMA: WARNING_NO_SCHEMA,
	WARNING_NAME_CONFLICT: WARNING_NAME_CONFLICT,
	WARNING_CLIENT_VALIDATION: WARNING_CLIENT_VALIDATION,
	WARNING_UNKNOWN_TIMESTAMP_TYPE: WARNING_UNKNOWN_TIMESTAMP_TYPE,
	WARNING_WRITING_UNDEFINED: WARNING_WRITING_UNDEFINED,
	WARNING_INVALID_TIMESTAMP_SERVER: WARNING_INVALID_TIMESTAMP_SERVER,
	WARNING_MOMENT_INVALID_DATE: WARNING_MOMENT_INVALID_DATE,
	WARNING_DEPRECATED: WARNING_DEPRECATED,
	WARNING_COMMON: WARNING_COMMON,
	WARNING_SYNCING_SUBSET_DATA: WARNING_SYNCING_SUBSET_DATA,
	WARNING_SYNCING_INDIVIDUAL: WARNING_SYNCING_INDIVIDUAL,
	WARNING_SYNCING_EXISTING_QUERY_PATH: WARNING_SYNCING_EXISTING_QUERY_PATH,
	WARNING_ACCESSING_UNSYNCED_DATA: WARNING_ACCESSING_UNSYNCED_DATA,
	WARNING_PERMISSION_DENIED: WARNING_PERMISSION_DENIED,
	INFO_COMMON: INFO_COMMON,
	INFO_MODEL: INFO_MODEL,
	INFO_COLLECTION: INFO_COLLECTION,
	INFO_STORE: INFO_STORE,
	INFO_STORE_WRITE: INFO_STORE_WRITE,
	INFO_MOMENT: INFO_MOMENT,
	INFO_REGISTRY: INFO_REGISTRY,
	INFO_DEEPMERGE: INFO_DEEPMERGE,
	INFO_PERMISSION: INFO_PERMISSION,
	INFO_AUTO_UNSUBSCRIBE: INFO_AUTO_UNSUBSCRIBE,
	INFO_SUBSCRIBE: INFO_SUBSCRIBE,
	INFO_SUBSCRIBE_QUERY: INFO_SUBSCRIBE_QUERY,
	INFO_SUBSCRIBE_DETAILS: INFO_SUBSCRIBE_DETAILS,
	INFO_READ_INIT: INFO_READ_INIT,
	INFO_READ_REMOVE: INFO_READ_REMOVE
});

loglevel.noConflict();
loglevel.setDefaultLevel('warn');
loglevel.setLevel('warn');

var PREFIX_LIST = {};
PREFIX_LIST[INFO_COMMON] = 'heliosRX';
PREFIX_LIST[INFO_MODEL] = 'heliosRX';
PREFIX_LIST[INFO_COLLECTION] = 'heliosRX';
PREFIX_LIST[INFO_STORE] = 'heliosRX';
PREFIX_LIST[INFO_STORE_WRITE] = 'heliosRX:write';
PREFIX_LIST[INFO_MOMENT] = 'heliosRX:moment';
PREFIX_LIST[INFO_REGISTRY] = 'heliosRX:REGISTRY';
PREFIX_LIST[INFO_DEEPMERGE] = 'heliosRX:DEEPMERGE';
PREFIX_LIST[INFO_PERMISSION] = 'heliosRX:permission';
PREFIX_LIST[INFO_AUTO_UNSUBSCRIBE] = 'heliosRX:auto-unsubscribe';
PREFIX_LIST[INFO_SUBSCRIBE] = 'heliosRX:subscribe';
PREFIX_LIST[INFO_SUBSCRIBE_DETAILS] = 'heliosRX:subscribe';
PREFIX_LIST[INFO_SUBSCRIBE_QUERY] = 'heliosRX:query';
PREFIX_LIST[INFO_READ_INIT] = 'heliosRX:moment';
PREFIX_LIST[INFO_READ_REMOVE] = 'heliosRX:moment';

/*
USAGE:
import { warn, WARNING_MODEL_INVALID_MOMENT } from "../util/log"
warn( WARNING_MODEL_INVALID_MOMENT, ... )
*/
function warn ( warning ) {
  var ref;

  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
  return (ref = loglevel.getLogger( warning )).warn.apply( ref, args )
}

/*
USAGE:
import { info, INFO_MODEL } from "../util/log"
info( INFO_MODEL, ... )
*/
function info ( target ) {
  var ref;

  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
  var prefix = PREFIX_LIST[ target ] || target;
  return (ref = loglevel.getLogger( target )).info.apply( ref, [ ("[" + prefix + "]") ].concat( args ) )
}

function trace ( target ) {
  var ref;

  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
  var prefix = PREFIX_LIST[ target ] || target;
  return (ref = loglevel.getLogger( target )).info.apply( ref, [ ("[" + prefix + "]") ].concat( args ) )
}

loglevel.getLogger( WARNING_SYNCING_INDIVIDUAL ).setLevel('silent');

/*
const _log_group = (name, id, ...args) => {
  console.groupCollapsed('[GENS:READ:' + name + '] ' + ( id ? '{' + id + '}' : '*'));
  args.forEach(arg => console.log('INFO:', arg));
  console.trace();
  console.groupEnd();
}
*/

/*
const _log = (name, ...args) => {
  // Enable logging per store instance
  if ( !name.includes('commitmentDailySettings') ) {
    return
  }
  console.log("[GENS:READ:" + name + "]", ...args)
};
*/

/* let originalFactory = log.methodFactory;

log.methodFactory = function (methodName, logLevel, loggerName) {
  let rawMethod = originalFactory(methodName, logLevel, loggerName);

  return function (message) {
    rawMethod("Newsflash: " + message);
  };
}; */

function isValidId( id ) {
  // length slugid = 22, length pushid = 20
  return isString( id ) && id.length && id.length >= 20;
}

function isString (obj) {
  return (Object.prototype.toString.call(obj) === '[object String]');
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isValue(v) {
  return /* !isNaN(v) && */ v !== undefined && v !== null
}

function isFunction(f) {
  return (typeof f === "function");
}

function isObject(o) {
  return typeof o === 'object' && o !== null;
}

function isArray(a) {
  return Array.isArray( a );
}

function matchUserInputDuration(str) {
  return null // TODO
}

function isBoolean(v) {
  return v === true || v === false;
}

var firebase = {
  database: {
    ServerValue: {
      TIMESTAMP: {".sv": "timestamp"}
    }
  },
  firestore: {
    FieldValue: {
      serverTimestamp: function serverTimestamp() {
        throw new Error('Not Implemented')
      }
    }
  }
};

/* momen plugin for helios specific date time conversions */

var moment = require("moment-timezone/builds/moment-timezone-with-data-2012-2022.min.js");

/*******************************************************************************

TODO: Check out Vue.util.defineReactive

TODO: Load tz data async:
    - moment.tz.load(require('./data/packed/latest.json'));
    - check with: moment.tz.zone("UnloadedZone");

TODO: prevent moment from being called directly moment()

*******************************************************************************/

var localStorage;
if ( !process.browser ) {
  localStorage = {
    getItem: function getItem() { return 'Europe/Berlin' }, /* This will cause a death spiral, when enabled in a browser! */
    setItem: function setItem() {}
  };
} else {
  localStorage = window.localStorage;
}

var convert_timezoneNeutral_to_qualifiedMomentObj = function (momentObj, userTimezone) {

  /* This funcion is used to convert 'timezone neutral' moment object, that are
  used to describe timeslots in timeslot collection, into 'qualified moment object',
  which means that the current user timezone gets 'appended' making the moment
  object timezone specific or 'timezoned'. */

  // moment.parseZone() ?

  /* Get utc formated ISO string like "2018-12-09T03:41:19Z" and remove last character 'Z' */
  var isoString = momentObj.clone().utc().format();
  var timezoneNeutralIsoString = isoString.substring(0, isoString.length - 1);

  /* Append the current user timezone to the "timezone neutral" datetime, so that
      '2018-05-06T14:00'
             +
      'America/New_York'
          becomes
      '2018-05-06T14:00:00-04:00'.
  */
  return moment.tz(timezoneNeutralIsoString, userTimezone);
};

function enhanceMomentJS( moment ) {

  info(INFO_MOMENT, "enhanceMomentJS");

  /* ... */
  moment.isEnhanced = true;
  moment.prototype.isEnhanced = true;

  /* ------------------------------------------------------------------------ */

  moment.fromFirestore = function ( firestoreDatetimeObject ) {
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
  };

  moment.fromRealtimeDB = function ( timestamp ) {
    return moment.unix( timestamp );
  };

  moment.fromRealtimeServerTime = function ( timestamp ) {
    return moment( timestamp );
  };

  moment.fromStore = function (ISOString) {
    return moment( ISOString ); /* Deserialize moment object */
  };

  /* ------------------------------------------------------------------------ */

  moment.prototype.toFirestore = function() {
    // TODO: Check timezones
    return firebase.firestore.Timestamp.fromDate( this.toDate() );
  };

  moment.prototype.toRealtimeDB = function() {
    return this.unix();
  };

  moment.prototype.toRealtimeServerTime = function() {
    // We store timestmaps in seconds, while ServerTime is in milliseconds
    return this.valueOf();
  };

  moment.prototype.toBackend = function(backend) {
    return backend === 'REALTIMEDB'
      ? this.toRealtimeDB()
      : this.toFirestore()
  };

  moment.prototype.toStore = function () {
    return this.format(); /* Serialize moment object */
  };

  moment.prototype.formatDateLong = function () {
    return this.format(this.user_dateformat); /* Serialize moment object */
  };

  /* ------------------------------------------------------------------------ */

  moment.prototype.isTimezoneNeutral = false; // TODO

  moment.fromDateAndTime = function (ISODate, time) {
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
    var momentObj = moment.tz( ISODate + 'T' + time, moment.user_timezone);

    /* This function is used when creating timeslot for a given time and a give date.
       Usually we want to treat time preferences in the user timezone */
    momentObj.isTimezoneNeutral = true;

    return momentObj;
  };

  moment.fromTimezoneNeutral = function ( date ) {
    if ( !moment.isValidDate( date ) ) {
      warn(WARNING_MOMENT_INVALID_DATE, "[fromTimezoneNeutral]", "Invalid date", date);
      return null
    }
    if ( !date.isTimezoneNeutral ) {
      throw new Error('Input is not timezone neutral')
    }
    // TODO: How do we want to handle 'timezone neutral'?
    return convert_timezoneNeutral_to_qualifiedMomentObj( date, moment.user_timezone );
  };

  moment.prototype.changeTimezoneButKeepTime = function(timezone) {
    return convert_timezoneNeutral_to_qualifiedMomentObj( this, timezone );
  };

  /* ------------------------------------------------------------------------ */

  moment.isValidDate = function(obj) {
    return obj
        && moment.isMoment(obj)
        && !!obj.isEnhanced
        && obj.isValid();
    // TODO: move util function here
  };

  moment.currentTime = function () {
    /* WHY: This function should return the same result as moment(), even when
            a custom timezone is set, since we set .locale().
            Using this function is still the prefered way to get the current
            time, because it adds an extra layer of control.
    */
    if ( !moment.user_timezone ) {
      throw new Error('User timezone is not set')
    }

    return moment().tz( moment.user_timezone );
  };

  moment.currentTimeUTC = function () {
    return moment().utc();
  };

  moment.currentDate = function ( ) {
    return moment().tz( moment.user_timezone ).startOf('day');
  };

  moment.currentDateISO = function ( ) {
    moment().tz( moment.user_timezone ).format('YYYY-MM-DD');
  };

  moment.currentDateSleepCorrected = function () {
    var sleepDayBreak = 3; // Daybreak at 3 AM in the morning
    return moment()
            .tz(moment.user_timezone)
            .subtract(sleepDayBreak, 'hours')
            .startOf('day');
  };

  moment.currentCalendarweek = function () {
    return moment().tz( moment.user_timezone ).format('W');
  };

  moment.currentTimeServer = function ( backend ) {
    return backend === 'REALTIMEDB'
           ? firebase.database.ServerValue.TIMESTAMP // {".sv": "timestamp"}
           : firebase.firestore.FieldValue.serverTimestamp();
  };

  /* converts 'HH:mm' to fractional time in hours */
  moment.convertHHmmToFractional = function (value) {
    return (moment(value, 'HH:mm') - moment().startOf('day')) / 3600 / 1e3
  };

  /* converts fractional time in hours to 'HH:mm' */
  moment.convertFractionalToHHmm = function (value) {
    return moment.utc( value * 3600 * 1e3 ).format('HH:mm')
  };

  /* Parse time */
  moment.parseTimeNatural = function (input, referenceTime ) {
    if ( referenceTime === void 0 ) referenceTime = null;

    var formats = ["HH:mm", "HH:mm A", "HH A", "HH"];
    input = (input || '').trim();
    if ( !input ) {
      return null
    }
    if ( input[0] === '+' || input[0] === '-' ) {

      var sign = input[0] === '-' ? -1 : +1;
      var text = input.slice(1);

      if ( !/[mhs]/i.test(text) ) {
        text += "m";
      }

      var durationInfo = matchUserInputDuration();

      if ( !durationInfo.match ) {
        return null;
      }

      var duration = sign * durationInfo.duration;
      return moment( referenceTime, 'HH:mm' ).add( duration, 'seconds' )
    } else if ( input === 'now' ) {
      return moment();
    }
    return moment(input, formats);
  };

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

var localeSetUp = (function () {

  info(INFO_MOMENT, "set up");
  info(INFO_MOMENT, "localStorage.getItem('timezone')", localStorage.getItem('timezone'));

  if ( !localStorage.getItem('timezone') ) {
    /* Let's be optimistic and assume that the user configured the same timezone
       that moment.tz.guess will give us. If not we deal with that later... */
    localStorage.setItem('timezone', moment.tz.guess());
  }

  /* Set default values */
  var user_timezone = localStorage.getItem('timezone');
  info(INFO_MOMENT, "Setting user timezone to", user_timezone);
  moment.tz.setDefault(user_timezone);
  moment.user_timezone = user_timezone;

  // moment.locale("en"); // -> i18n

  // momentDurationFormatSetup( moment );
  enhanceMomentJS( moment );
})();

var UIDMethod = {
  CUSTOM:          1,
  SLUGID:          2, // R0qHTeS8TyWfV2_thfFn5w (Default)
  PUSHID:          3, // -JhLeOlGIEjaIOFHR0xd
  TIMESTAMP:       4, // 1548573128294 (unix?)
  LOCAL_TIMESTAMP: 5, // 1553700866
  DATE:            6, // DDMMYYYY / 01032019
  OTHER_USER_ID:   7,
  MY_USER_ID:      8, // fOjaiwtyxoQdOGe6Z2zULK18ggv2
  ARRAY:           9, // 0,1,2,3,...
  EMAIL:          10, // test@test.de
};

var DeleteMode = {
  SOFT: 0,
  HARD: 1
};

/*
Variant 1:
Source: https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string
Source : https://stackoverflow.com/questions/30003353/can-es6-template-literals-be-substituted-at-runtime-or-reused

Example:
  const template = 'Example text: ${text}';
  const result = interpolate(template, { text: 'Foo Boo' });

Beware: That this template string is kinda 'hidden' to transpilation (i.e. webpack)
        and thus will NOT transpile into something sufficiently compatible
        (i.e. IE11) on client-side...!
*/

/*
export function tplInterpolate(template, params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${template}\`;`)(...vals);
}
*/

/*
Variant 2:
Source: https://gist.github.com/smeijer/6580740a0ff468960a5257108af1384e#file-parse-es6-template-js

Example:
  const template = '{name} is now master of the {galaxy}'
  parseTpl(template, { name: 'John', galaxy: 'Milky Way' });

*/

// function get(path, obj, fb = `$\{${path}}`) {
function get(path, obj, fb) {
  if ( fb === void 0 ) fb = "{" + path + "}";

  return path.split('.').reduce(function (res, key) { return res[key] || fb; }, obj);
}

function parseTpl(template, map, fallback) {
  // return template.replace(/\$\{.+?}/g, (match) => {
  return template.replace(/\{.+?}/g, function (match) {
    // const path = match.substr(2, match.length - 3).trim();
    var path = match.substr(1, match.length - 2).trim();
    return get(path, map, fallback);
  });
}

/* Example:
  analyzeTpl(parseTpl("/test/${test}/${uid}/ABC/${abc}", {abc: 1}))
  (2) ["test", "uid"]
*/

function analyzeTpl(template) {
  // return template.match(/\$\{.+?}/g).map(match => match.slice(2, -1));
  return ( template.match(/\{.+?}/g) || [] ).map(function (match) { return match.slice(1, -1); });
}

/*
const template = 'Example text: ${text}';
const result = interpolate(template, { text: 'Foo Boo' });
*/

// TODO: Make sure it's the same 'Vue'

// bind on install
var _Vue = Vue;
var _Vuex = Vuex;
var _Firebase;
var _registry;
var _models = {};
var _db = {};

function setup( options ) {
  if ( options.Vue ) { _Vue = options.Vue; }
  if ( options.Vuex ) { _Vuex = options.Vuex; }
  if ( options.Firebase ) { _Firebase = options.Firebase; }
  if ( options.registry ) { _registry = options.registry; }
  if ( options.models ) { _models = options.models; }
  if ( options.db ) { _db = options.db; }
}

function getRegistry() {
  return _registry;
}

// import { info, INFO_HMR } from "../util/log"

var factory = {

  configure: function configure(ref) {
    var GenericList = ref.GenericList;
    var GenericModel = ref.GenericModel;

    this.GenericList = GenericList;
    this.GenericModel = GenericModel;
  },

  // -----------------------------------------------------------------------------
  make_reactive_list: function make_reactive_list( modelDefinition, dataList, context, no_reactive_getters ) {
    if ( no_reactive_getters === void 0 ) no_reactive_getters = false;


    // TODO: Error when not inintialized

    var name = context.model.name;
    var reactive_list = new this.GenericList( name );

    if ( dataList ) {
      for ( var id in dataList ) {
        var item = this.make_reactive_model( modelDefinition, dataList[ id ], context );
        item.$id = id;
        item._update_data( dataList[ id ], modelDefinition.schema.fields ); // DOPPELT?
        reactive_list._add_child( id, item );
      }
      reactive_list.$readyAll = true;
      reactive_list.$numReady = Object.keys( dataList ).length;
    }

    // TODO: Implementd custom global actions / getters here too

    if ( modelDefinition.listActions ) {
      reactive_list._decorate_actions( modelDefinition.listActions, context );
    }

    if ( modelDefinition.listGetters
         && !no_reactive_getters
         && !modelDefinition.no_reactive_getters ) {
      reactive_list._decorate_getters( modelDefinition.listGetters, context );
    }

    _Vue.observable( reactive_list );
    return reactive_list
  },

  // -----------------------------------------------------------------------------
  make_reactive_model: function make_reactive_model(
    modelDefinition,
    data,
    context,
    is_dirty,
    no_reactive_getters
  ) {
    if ( is_dirty === void 0 ) is_dirty = false;
    if ( no_reactive_getters === void 0 ) no_reactive_getters = false;


    // TODO: Error when not inintialized

    var name = context.model.name;
    var load_result = new this.GenericModel( null, null, name );
    load_result._set_generic_store( context.model );

    if ( modelDefinition.schema && modelDefinition.schema.fields ) {
      load_result._autogenerate_props( modelDefinition.schema.fields, data, is_dirty );
    } else {
      warn(WARNING_NO_SCHEMA, 'Making a reactive model without schema. This means props are not autogenerated and only accessible through model.$state. Please provide a schema for ' + name + '.');
    }

    if ( data ) {
      load_result._update_data( data, modelDefinition.schema.fields );
      load_result.$ready = true;
    }

    if ( modelDefinition.modelActions ) {
      load_result._decorate_actions( modelDefinition.modelActions, context );
    }

    /* add model getters:
       - attach vm only if there are getters - otherwise there is no need
       - attach vm only if flag 'no_reactive_getters' is not set in model definition
       - attach vm only if flag 'no_reactive_getters' is not set during model instantiation
    */
    if ( modelDefinition.modelGetters
         && !no_reactive_getters
         && !modelDefinition.no_reactive_getters ) {
      load_result._decorate_getters( modelDefinition.modelGetters, context );
    }

    /*
    TODO: Implement HMR

    if ( module.hot && modelDefinition.hotUpdate ) {
      // TODO: Testen
      let hotUpdateList = modelDefinition.hotUpdate();
      let filelist = []
      for ( let relative_filename in hotUpdateList ) {
        let filename = './src/models/' + name + '/' + relative_filename;
        filelist.push( filename )
      }
      info(INFO_HMR, "list", filelist);
      module.hot.accept([filelist], (updated_file, deps) => {
        info(INFO_HMR, "update model", updated_file, deps);
        // Parse "./src/api/<moduleName>.js"
        let moduleName = updated_file[0].split('/').pop();
        info(INFO_HMR, "update model %c<" + moduleName + ">", 'color: #42b983');
        let target = hotUpdateList[ moduleName ];
        let moduleData = require('./src/models/' + name + '/' + moduleName)
        for ( var prop in moduleData ) {
          target[ prop ] = moduleData[ prop ]
        }
        // Why not just update entire model?
      })
    }
    */

    _Vue.observable( load_result );

    return load_result;
  }
};

var lodash_clonedeep = createCommonjsModule(function (module, exports) {
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, true, true);
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = cloneDeep;
});

// -----------------------------------------------------------------------------
function add_custom_getters( context, target, getters ) {

  if ( target.getters ) {
    warn(WARNING_NAME_CONFLICT, "Name conflict: property getters already exists");
  } else {
    target.getters = {};
  }

  var computed = {};
  var loop = function ( key ) {

    var fn = getters[key];
    computed[ key ] = function () { return fn.apply(target, context); };

    /*
    if ( Object.prototype.hasOwnProperty.call( target, key ) ) {
      let name = context.$model.name;
      warn(WARNING_NAME_CONFLICT, `Name conflict: property "${key}" has same name as an existing class property "${key}" in ${name}`);
      continue
    }
    */

    Object.defineProperty( target.getters, key, {
      get: function () { return _vm[key]; },
      enumerable: true
    });
  };

  for ( var key in getters ) loop( key );

  var _vm = new _Vue({
    computed: computed
  });

  return _vm;
}

// -----------------------------------------------------------------------------
function add_custom_actions( context, target, actions, reset ) {
  var loop = function ( key ) {
    var action = actions[ key ];
    if ( reset ) {
      delete target[ key ];
    }
    if ( Object.prototype.hasOwnProperty.call( target, key ) ) {
      var name = context.$model.name;
      warn(WARNING_NAME_CONFLICT, ("Name conflict: action \"" + key + "\" has same name as another method or property \"" + key + "\" in " + name));
      return
    }
    Object.defineProperty( target, key, {
      value: function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        // Assign $models at run time
        if ( context.$modelsGetter ) {
          context.$models = context.$modelsGetter();
        }
        return action.apply(target, [context ].concat( args) );
      },
      enumerable: true // otherwise not cloned
    });
  };

  for ( var key in actions ) loop( key );
}

// export default from './moment-enhanced';

/**
 *
 * @param {any} o
 * @returns {boolean}
 */
function isObject$1 (o) {
  return o && typeof o === 'object' && !Array.isArray(o);
}

/**
 * walkGet
 *
 * first item in path MUST exist
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @returns {any} or undefined if path not found
 */
function walkGet (obj, path) {
  return path.split('.').reduce(function (target, key) { return target[key]; }, obj)
}

/**
 * walkGet
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @returns {any} or {} if path not found
 */
function walkGetObjectSave (obj, path) {
  return path.split('.').reduce(function (target, key) { return target[key] || {}; }, obj)
}

function walkGetPropSave (obj, path) {
  // return path.split('.').reduce((target, key) => target[key] || {}, obj)

  var keys = ('' + path).split('.');
  var key = keys.pop();
  var target = keys.reduce(function (target, key) { return target[key] || {}; }, obj);
  return target[ key ]
}

/**
 *
 * @param {Record<string, any>} obj
 * @param {string} path
 * @param {object} data
 * @returns
 *
 * @exammple
 * let obj = { a: { b: { p1: 'A', p2: 'B', p3: { p31: 'C'}, _tasks: {} } } }
 * let data = { p1: 'A*', p3: { p31: 'C*', p32: 'D*' } } // p2 has been deleted, p32 was added
 * walkSetMerge( obj, 'a.b', data)
 * > obj = { a: { b: { p1: 'A*', p3: { p31: 'C*', p32: 'D*'}, _tasks: {} } } }
 *
 * let obj = { a: { b: { ... } } }
 * walkSetMerge( obj, 'a.c', data)
 * > obj = { a: { b: { ... }, c: data } }
 */
function walkSetVueProp (obj, path, data) {
  // TODO: What if path does not exist? option -p ?
  var keys = ('' + path).split('.'); // keys = 'a.b' => ['a', 'b'] (e.g a = 'goal', b = 'ASD1S4DA5S4D3')
  var key = keys.pop(); // key = 'b'
  // const target = keys.reduce((target, key) => target[key], obj) // object at location obj['a']

  var target = keys.reduce(function (target, key) {
    if ( !( key in target ) ) {
      _Vue.set( target, key, {} );
    }
    return target[key]
  }, obj);

  /* if ( !( key in target ) ) {
    target[ key ] = data;
    return
  } */

  // TODO: Improve error message. Something better than:
  // Uncaught (in promise) TypeError: Cannot read property 'res' of undefined
  //  at eval (utils.js?7e75:109)

  /* Backup everything that starts with '_' */
  /*
  let backup = {};
  Object.keys(target[ key ])
        .filter( k => k.startsWith('_') )
        .forEach( k => { backup[ k ] = target[ key ][ k ] } )
  */

  /* Merge data with backup */
  // target[ key ] = Object.assign({}, data, backup) --> geht nicht!!!

  _Vue.set( target, key, data );
  return target[ key ];
}

/* function mergeDeep(target, source) {
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return target;
} */

/**
 * Deep merge two objects.
 * @param {Object} target - Target
 * @param {Object} data - Data to merge
 * @param {Boolean} delete_missing_fields - Delete fields that are missing in data?
 */
function deepMergeVue( target, data, delete_missing_fields ) {
  if ( delete_missing_fields === void 0 ) delete_missing_fields = true;

  var map = delete_missing_fields ? Object.assign({}, target) : {};
  for ( var prop in data ) {
    var target_is_object = null;
    var source_is_object = null;
    if (target) {
      target_is_object = isObject$1(target[ prop ]);
    }
    if (data) {
      source_is_object = isObject$1(data[ prop ]);
    }

    if ( target_is_object && source_is_object ) {
      deepMergeVue( target[ prop ], data[ prop ], delete_missing_fields );
    } else {
      /* All other cases we can safely overwrite the data in target */
      _Vue.set( target, prop, data[ prop ] );
    }

    delete map[ prop ];
  }
  // trace( INFO_DEEPMERG, "Remaining fields", map, data);
  for ( var prop$1 in map ) {
    trace( INFO_DEEPMERGE, "Deleting <", prop$1, ">");
    _Vue.delete( target, prop$1 );
  }
  return map
}

function walkSetAndMerge (obj, path, data) {
  // TODO: What if path does not exist? option -p ?
  var keys = ('' + path).split('.'); // keys = 'a.b' => ['a', 'b'] (e.g a = 'goal', b = 'ASD1S4DA5S4D3')
  var key = keys.pop(); // key = 'b'
  var target = keys.reduce(function (target, key) { // object at location obj['a']
    if ( !( key in target ) ) {
      _Vue.set( target, key, {} );
    }
    return target[key]
  }, obj);

  if ( key in target ) {
    // INFO: Sollte nicht mehr auftreten - trozdem warning ausgeben
    // TODO: What about deleting items?
    trace( INFO_DEEPMERGE, "Existing data found -> Performing deep merge at '",
      key, "' of target", target, "with source", data);

    if ( '.value' in data && data['.value'] === null ) {
      trace( INFO_DEEPMERGE, "New data is null, deleting node at <", key, ">");
      _Vue.delete( target, key );
      return
    }

    /* for ( let prop in data ) {
      Vue.set( target[key], prop, data[ prop ] )
    } */
    deepMergeVue( target[key], data, true );

  } else {
    _Vue.set( target, key, data );
  }

  return target[ key ];
}

var externalVMStore = new WeakMap(); // Exclude vm from instance, so it can be serialized
var externalModelStore = new WeakMap(); // Stores generic store references

var SERVER_TIMESTAMP_ALIASES = [
  'ServerTimestamp',
  'CurrentTimestamp',
  'InitialTimestamp'
];

var GenericModel = function GenericModel( schema, data, name ) {

  // TODO: Hide internal data from user
  this.$ready     = false;
  /* This promise will resolve once the data is ready */
  this.$promise   = Promise.resolve();
  this.$state     = {};
  this.$dirty     = {};
  this.$invalid   = {};
  this.$id        = null;
  this.$idx       = null;
  this.$noaccess  = null;
  this._store_name= name;
  this._validation_behaviour = 'WARNING';

  _Vue.observable( this.$state ); // TODO: Check if we get an error here
  // Vue.observable( this.$ready );
  // this.$state = Vue.oberservable({});
};

var prototypeAccessors = { $isValid: { configurable: true },$key: { configurable: true },$vm: { configurable: true },$model: { configurable: true },$exists: { configurable: true } };

// ---------------------------------------------------------------------------
GenericModel.prototype._update_data = function _update_data ( data, schema, make_dirty ) {
    if ( make_dirty === void 0 ) make_dirty = false;

  this.$state = data; // otherwise no reactivity

  if ( make_dirty ) {
    for ( var key in data ) {
      this.$dirty[ key ] = true;
    }
  }

  /*schema.forEach(field => {
    let propName = field.model;
    if ( propName in data ) {
      this.$state[ propName ] = data[ propName ];
    }
  })*/
};

// ---------------------------------------------------------------------------
GenericModel.prototype.clone = function clone () {
  var copy = Object.assign( Object.create( Object.getPrototypeOf(this)), this);
  copy.$state = lodash_clonedeep( copy.$state );
  copy.$dirty = lodash_clonedeep( copy.$dirty );
  copy.$invalid = lodash_clonedeep( copy.$invalid );
  copy._autogenerate_props( this.$model.modelDefinition.schema.fields, copy.$state, false );
  copy._set_generic_store( this.$model );
  externalVMStore.set( copy, this.$vm );
  return copy;
};

// ---------------------------------------------------------------------------
/* _write_field(key, value) {
  // TODO: We should not alter the state here!!!
  // Create a copy!
  this.$state[ key ] = value;
  this.$dirty[ key ] = true;
} */

GenericModel.prototype.setValidationBehaviour = function setValidationBehaviour ( value ) {
  // TODO: Use enum
  if ( ['ERROR', 'WARNING', 'ELEMENT_VALIDATION', 'NONE'].includes( value ) ) {
    this._validation_behaviour = value;
  }
};

GenericModel.prototype._update_field = function _update_field ( propName, value, field ) {
    var this$1 = this;

  var validation_behaviour = this._validation_behaviour || 'WARNING';

  var prop_set = field.is_nested
                 ? function () { return walkSetVueProp( this$1.$state, propName, value ); }
                 : function () { return _Vue.set( this$1.$state, propName, value ); };

  if ( moment.isMoment( value ) ) {
    /* Handle moment object as input */
    if ( !moment.isValidDate( value ) ) {
      warn( WARNING_MODEL_INVALID_MOMENT,
        "Got invalid (enhanced) moment object",
        value, "for prop", propName);
    }
    value = value.toRealtimeDB(); /* convert to internal timestamp */
    delete this.$invalid[ propName ];
    this.$dirty[ propName ] = true;
    prop_set();
    return
  }

  if ( !field.validator ) {
    /* No validate callback found */

    /* Fixes bug where non existing fields are assigned */
    // Vue.set( this.$state, propName, value );
    prop_set();
    // this.$state[ propName ] = value;

    this.$dirty[ propName ] = true;
    return
  }

  // TODO: bolt type validation

  if ( field.validator( value ) ) {
    // this._write_field( propName, value );
    // this.$state[ propName ] = value;
    delete this.$invalid[ propName ];
    this.$dirty[ propName ] = true;
    prop_set();
  } else {
    // this._write_field( propName, value );
    // this.$state[ propName ] = value;
    this.$invalid[ propName ] = true;
    this.$dirty[ propName ] = true;
    prop_set();

    if ( validation_behaviour === 'ERROR' ) {
      throw new Error(("Validation failed for field '" + propName + "' with value " + value + "."));
    }
    if ( validation_behaviour === 'WARNING' ) {
      warn(WARNING_CLIENT_VALIDATION, ("Validation failed for field '" + propName + "' with value " + value + "."));
    }
  }
};

// ---------------------------------------------------------------------------
GenericModel.prototype._on_remove = function _on_remove () {
  this.$deleted = true; // TODO
  // This is called when the item is going to be removed
  //- maybe allow subscribers and call them here
};

// ---------------------------------------------------------------------------
prototypeAccessors.$isValid.get = function () {
  return Object.keys( this.$invalid ).length === 0;
};

// ---------------------------------------------------------------------------
prototypeAccessors.$key.get = function () {
  return 'KEY-' + this._store_name + '-' + this.$id;
};

// ---------------------------------------------------------------------------
prototypeAccessors.$vm.get = function () {
  return externalVMStore.get( this )
};

// ---------------------------------------------------------------------------
prototypeAccessors.$model.get = function () {
  return externalModelStore.get( this )
};

// ---------------------------------------------------------------------------
prototypeAccessors.$exists.get = function () {
  return this.$state[ '.exists' ] !== false;
};

// ---------------------------------------------------------------------------
GenericModel.prototype._autogenerate_props = function _autogenerate_props ( schema, data, is_dirty ) {
    var this$1 = this;
    if ( is_dirty === void 0 ) is_dirty = false;
 // TODO: move to util

  if ( !Array.isArray( schema ) ) {
    schema = Object.keys(schema).map(function (key) {
      return Object.assign({}, {model: key}, schema[key])
    });
  }

  schema.forEach(function (field) {
    var propName = field.model;

    if ( data && propName in data ) {
      this$1.$state[ propName ] = data[ propName ];
    }
    /* else {
      this.$state[ propName ] = field.placeholder;
    } */

    if ( is_dirty ) {
      this$1.$dirty[ propName ] = true;
    }

    if ( Object.prototype.hasOwnProperty.call(this$1, propName ) ) {
      warn(WARNING_NAME_CONFLICT, ("Name conflict: property \"" + propName + "\" has same name as global action/global getter \"" + propName + "\" in " + (this$1._store_name)));
      return
    }

    var prop_getter = function () {};
    var prop_path = '';

    if ( propName.includes('/') || propName.includes('.') ) {
      prop_path = propName.replace(/\//g, '.');
      var prop_keys = prop_path.split('.');
      var prop_last_key = prop_keys.pop();
      prop_keys = prop_keys.join('.');

      prop_getter = function () {
        // return walkGetPropSave( this.$state, prop_path )
        var parent = walkGetObjectSave( this$1.$state, prop_keys );
        return parent[ prop_last_key ]
      };
      field.is_nested = true;
    } else {
      prop_path = propName;
      prop_getter = function () {
        return this$1.$state[ propName ];
      };
      field.is_nested = false;
    }

    if ( field.type ) {

      var validate_timestamp = function (value, moment_conversion_func, min_date, max_date) {
        if ( value === 0 || value === null ) {
          return value // TODO: Allow null instead of 0
        } else if ( moment.isMoment( value ) ) {
          throw new Error("Assigning moment objects directly to property is not allowed.");
        } else if ( isFinite( value ) && value > min_date && value < max_date ) {
          return moment_conversion_func( value );
        } else if ( value === undefined ) {
          // This is potentially dangerous, since it could return the current time
          // NaN should usually create an invalid moment object
          return moment_conversion_func( NaN );
        } else {
          warn(WARNING_INVALID_TIMESTAMP_SERVER, "Schema defined", propName, "as Timestamp, but got invalid data:", value);
          // return value
          return moment(value)
        }
      };

      var prop_getter_original = prop_getter;

      if ( field.type === 'Timestamp' ) {
        prop_getter = function () {
          var min_date = 200000000; // '1976-05-03'
          var max_date = 30000000000; // '2065-01-24'
          return validate_timestamp(
            prop_getter_original(),
            moment.fromRealtimeDB,
            min_date,
            max_date)
        };
      } else if ( SERVER_TIMESTAMP_ALIASES.includes( field.type ) ) {
        prop_getter = function () {
          var min_date = 200000000 * 1000; // '1976-05-03'
          var max_date = 30000000000 * 1000; // '2065-01-24'
          return validate_timestamp(
            prop_getter_original(),
            moment.fromRealtimeServerTime,
            min_date,
            max_date)
        };
      } else if ( field.type.includes( 'Timestamp' ) ) {
        warn(
          WARNING_UNKNOWN_TIMESTAMP_TYPE,
          "Found validation type that contains 'Timestamp' but is not recognized.",
          field.type
        );
      }

      // TODO: Also validate other types
    }

    Object.defineProperty(this$1, prop_path, {
      set: function (value) { return this$1._update_field( prop_path, value, field ); },
      get: prop_getter
    });
  });
};

// ---------------------------------------------------------------------------
GenericModel.prototype._decorate_actions = function _decorate_actions ( modelActions, context ) {
  if ( !modelActions ) {
    return
  }

  /*
  context.model = this; // HACK
  for ( let key in modelActions ) {
    let action = modelActions[ key ];
    if ( Object.prototype.hasOwnProperty.call( this, key ) ) {
      warn(WARNING_NAME_CONFLICT, `Name conflict: action "${key}" has same name as property/global action/global getter "${key}" in ${this._store_name}`);
      continue
    }
    Object.defineProperty( this, key, { value: () => action(context) } ) // TODO: bind this?
  }
  */

  var action_context = {
    $instance: this,
    $model: context.model,
    $models: context.models,
  };
  add_custom_actions( action_context, this, modelActions, false );
};

// ---------------------------------------------------------------------------
GenericModel.prototype._decorate_getters = function _decorate_getters ( modelGetters, context ) { // TODO: move to util
  if ( !modelGetters ) {
    return
  }

  for ( var key in modelGetters ) {
    if ( Object.prototype.hasOwnProperty.call( this, key ) ) {
      warn(WARNING_NAME_CONFLICT, ("Name conflict: getter \"" + key + "\" has same name as property/custom action/global action/global getter \"" + key + "\" in " + (this._store_name)));
      delete modelGetters[ key ]; // ?
      continue
    }
  }

  /* Embed getter in vue instance */
  var getter_context = [ this, context.model, context.models ];
  var vm = add_custom_getters( getter_context, this, modelGetters );
  externalVMStore.set( this, vm );
};

// ---------------------------------------------------------------------------
GenericModel.prototype._set_generic_store = function _set_generic_store ( store ) {
  externalModelStore.set( this, store );
};

// ---------------------------------------------------------------------------
GenericModel.prototype.write = function write () {
    var this$1 = this;

  // TODO: Nested data
  // TODO: Also check if moment objects were changed!

  info( INFO_MODEL, "Writing $dirty fields", JSON.stringify(this.$dirty));

  var payload = {};
  for ( var prop in this.$dirty ) {
    var value = (void 0);
    var prop_path = (void 0);
    if ( prop.includes('.') ) {
      prop_path = prop.replace(/\./g, '/');
      value = walkGetPropSave( this.$state, prop );
    } else {
      prop_path = prop;
      value = this.$state[ prop ];
    }
    if ( typeof value === 'undefined' ) {
      warn(WARNING_WRITING_UNDEFINED, "Trying to write undefined for prop", prop);
      continue
    }
    payload[ prop_path ] = value;
  }

  var model = this.$model;
  if ( !model ) {
    throw new Error('Model reference not set with _set_generic_store');
  }

  var is_update = true;
  var temp_id = this.$id;
  if ( !temp_id ) {
    temp_id = model._get_uid();
    is_update = false;
  }

  /* Check if all required fields are present */
  if ( model.modelDefinition && model.modelDefinition.schema ) {
    model._validate_schema( payload, is_update ); // DOPPELT ?
  } else {
    warn(WARNING_NO_SCHEMA, "No schema found to validate input" );
  }

  return model.update( temp_id, payload ).then(function () {
    this$1.$id = temp_id;
    this$1.$dirty = {};
    return temp_id;
  });

  /* 'store.add' would call 'create' - not what we want here */
  // TODO: Alternative { directWrite: true }
};

/* ------------------------------------------------------------------------ */
GenericModel.prototype._get_model_for_write = function _get_model_for_write () {
  if ( !this.$id ) {
    throw new Error('Write operations are not allowed for new models.');
  }

  var model = this.$model;
  if ( !model ) {
    throw new Error('Model reference not set with _set_generic_store');
  }
  return model
};

/* ------------------------------------------------------------------------ */
GenericModel.prototype.update = function update ( payload ) {
    var this$1 = this;

  var model = this._get_model_for_write();
  return model.update( this.$id, payload ).then(function () {
    for ( var propName in payload ) {
      delete this$1.$dirty[ propName ];
    }
    return this$1.$id;
  });
};

/* ------------------------------------------------------------------------ */
GenericModel.prototype.remove = function remove ( soft_delete ) {
    var this$1 = this;
    if ( soft_delete === void 0 ) soft_delete = null;

  var model = this._get_model_for_write();
  if ( soft_delete == null ) {
    soft_delete = model.defaultDeleteMode === DeleteMode.SOFT;
  }
  return model.remove( this.$id, soft_delete ).then(function () {
    if ( soft_delete ) {
      delete this$1.$dirty[ 'deleted' ]; // ?
    }
    // TODO Mark model as deleted?
  })
};

/* ------------------------------------------------------------------------ */
GenericModel.prototype.restore = function restore () {
    var this$1 = this;

  var model = this._get_model_for_write();
  return model.restore( this.$id ).then(function () {
    delete this$1.$dirty[ 'deleted' ]; // ?
  })
};

// -----------------------------------------------------------------------------
GenericModel.prototype.reset = function reset () {
  // ...
};

Object.defineProperties( GenericModel.prototype, prototypeAccessors );

function sortidx_sorter(a, b) {
  if (a.sortidx < b.sortidx) { return -1; }
  if (a.sortidx > b.sortidx) { return 1; }
  // if (a.$state.sortidx < b.$state.sortidx) return -1;
  // if (a.$state.sortidx > b.$state.sortidx) return 1;
  return 0;
}

function make_property_sorter(prop) {
  var sorter = null;
  if ( prop[0] === '-' ) {
    prop = prop.slice(1);
     sorter = function (a, b) {
      if (a[prop] < b[prop]) { return 1; }
      if (a[prop] > b[prop]) { return -1; }
      return 0;
    };
  } else {
    sorter = function (a, b) {
      if (a[prop] < b[prop]) { return -1; }
      if (a[prop] > b[prop]) { return 1; }
      return 0;
    };
  }
  return sorter;
}

var externalVMStore$1 = new WeakMap(); // Exclude vm from instance, so it can be serialized

// TODO: Always save items as array, but keep index {id to idx} for quick access via id
//       This is rather an exception, since we would normally use getNode instead

var GenericList = function GenericList( name ) {
  this.items      = {}; // $items?
  this.$readyAll  = false;
  this.$readySome = false;
  /* This promise will resolve once ALL the data is ready */
  this.$promise   = Promise.resolve();
  this.$numReady  = 0; // TODO
  this.$noaccess  = null;
  this.$numChildren = 0;
  this._store_name= name;
  this._unwatch   = null;
  // this.$lastUpdated = null;
};

var prototypeAccessors$1 = { $vm: { configurable: true },itemsSorted: { configurable: true },$idList: { configurable: true } };

// -----------------------------------------------------------------------------
GenericList.prototype._clone = function _clone () {
  // --> this needs more work
  return Object.assign( Object.create( Object.getPrototypeOf(this)), this);
};

// -----------------------------------------------------------------------------
GenericList.prototype._add_child = function _add_child ( id, child ) {
  // TODO: Check if this.items is an array
  this.$readySome = true;
  // this.$lastUpdated = Date.now();
  _Vue.set( this.items, id, child );
  this.$numChildren += 1;
  this.items[ id ].$idx = this.$numChildren;
};

// -----------------------------------------------------------------------------
GenericList.prototype._rem_child = function _rem_child ( id ) {
  // TODO: Check if this.items is an array
  if ( id in this.items ) {
    this.items[ id ]._on_remove();
  }
  _Vue.delete( this.items, id );
  this.$numChildren -= 1;
};

// ---------------------------------------------------------------------------
prototypeAccessors$1.$vm.get = function () {
  return externalVMStore$1.get( this )
};

// -----------------------------------------------------------------------------
GenericList.prototype._decorate_actions = function _decorate_actions ( listActions, context ) {
  if ( !listActions ) {
    return
  }

  /*
  context.model = this; // HACK
  for ( let key in listActions ) {
    let action = listActions[ key ];
    if ( Object.prototype.hasOwnProperty.call( this, key ) ) {
      warn(WARNING_NAME_CONFLICT, `Name conflict: list action "${key}" has same name as existing method "${key}" in ${this._store_name}`);
      continue
    }
    Object.defineProperty( this, key, { value: () => action(context) } ) // TODO: bind this?
  }
  */

  var action_context = {
    $instance: this,
    $model: context.model,
    $models: context.models,
  };

  add_custom_actions( action_context, this, listActions, false );
};

// -----------------------------------------------------------------------------
GenericList.prototype._decorate_getters = function _decorate_getters ( listGetters, context ) { // TODO: move to util
  if ( !listGetters ) {
    return
  }

  for ( var key in listGetters ) {
    if ( Object.prototype.hasOwnProperty.call( this, key ) ) {
      warn(WARNING_NAME_CONFLICT, ("Name conflict: list getter \"" + key + "\" has same name as existing property getter \"" + key + "\" in " + (this._store_name)));
      delete listGetters[ key ]; // ?
      continue
    }
  }

  /* Embed getter in vue instance */
  var getter_context = [ this, context.model, context.models ];
  var vm = add_custom_getters( getter_context, this, listGetters );
  externalVMStore$1.set( this, vm );

  // "Self destroy"
};

// -----------------------------------------------------------------------------
GenericList.prototype.getItemByIdx = function getItemByIdx ( idx ) {
  for ( var id in this.items ) {
    if ( this.items[ id ].$idx === idx) {
      return this.items[ id ]
    }
  }
  return null;
};

// -----------------------------------------------------------------------------
GenericList.prototype.asArraySorted = function asArraySorted () {
  // TODO: This should not mutate item!!!
  var new_this = this._clone();
  new_this.items = this.itemsAsArray();
  new_this.items.sort(sortidx_sorter);
  return new_this;

  // let items = this.asArray();
  // return items.sort(sortidx_sorter);
};

// -----------------------------------------------------------------------------
GenericList.prototype.asArraySortedBy = function asArraySortedBy (prop) {
  var new_this = this._clone();
  new_this.items = this.itemsAsArray();
  new_this.items.sort(make_property_sorter( prop ));
  return new_this;

  // let items = this.asArray();
  // return items.sort(make_property_sorter( prop ));
};

// -----------------------------------------------------------------------------
GenericList.prototype.asArrayFilteredBy = function asArrayFilteredBy (prop, value) {
  var new_this = this._clone();
  new_this.items = this.itemsAsArray();
  new_this.items = new_this.items.filter(function (item) {
    return ( item[ prop ] === value )
  });
  return new_this;

  // let items = this.asArray();
  // return items.filter((item) => {
  // return ( item.prop === value )
  // });
};

// -----------------------------------------------------------------------------
// Nicht sortiert!!, Why not a getter?
GenericList.prototype.itemsAsArray = function itemsAsArray () {
    var this$1 = this;

  if ( Array.isArray( this.items ) ) {
    return this.items;
  }
  return Object.keys( this.items ).map( function (id) {
    return this$1.items[ id ];
  })
};

// -----------------------------------------------------------------------------
prototypeAccessors$1.itemsSorted.get = function () {
  return this.itemsAsArray().sort(sortidx_sorter);
};

// -----------------------------------------------------------------------------
GenericList.prototype.itemsAsArrayWithoutDeleted = function itemsAsArrayWithoutDeleted ( custom_sortidx ) {
  // otherwise no reactivity
  return this.itemsAsArray().filter(function (item) {
    return item.deleted === false || item.deleted === undefined
  }).sort( custom_sortidx ? make_property_sorter(custom_sortidx) : sortidx_sorter);
};

// -----------------------------------------------------------------------------
GenericList.prototype.itemsAsArrayOnlyDeleted = function itemsAsArrayOnlyDeleted ( custom_sortidx ) {
  return this.itemsAsArray().filter(function (item) {
    return item.deleted === true
  }).sort( custom_sortidx ? make_property_sorter(custom_sortidx) : sortidx_sorter);
};

// -----------------------------------------------------------------------------
prototypeAccessors$1.$idList.get = function () {
  // TODO: Here or static in $models.example?
  return Object.keys( this.items );
};

// -----------------------------------------------------------------------------
GenericList.prototype.reset = function reset () {
  if ( this._unwatch ) {
    info(INFO_COLLECTION, "Found local un-watcher in", this._store_name);
    this._unwatch();
  }
};

Object.defineProperties( GenericList.prototype, prototypeAccessors$1 );

/**
 * Joint for joining more than 2 functions.
 * Joins an array of functions together to return a single function
 *
 * Source: https://github.com/Dayjo/joint
 *
 * @param  {array} a An array of functions
 * @return {function} Returns a function which is an accumilation of functions in 'a'
 */
function joint( a ) {
  var b = a[(a.length - 1)];
  a.pop();

  a = a.length > 1 ? joint( a ) : a[0];

  return function() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    // eslint-disable-next-line
    // b.apply( new a(...args), args );
    /*
    // args is object
    var ra = a(args)
    var rb = b(args)
    return Object.assign(args, ra, rb)
    */
    var ra = a.apply(void 0, args);
    var rb = b.apply(void 0, args); // can overwrite result from a
    return Object.assign(ra || {}, rb)
  };
}

// types.js
var HELIOSRX_INIT_VALUE      = 'heliosrx/INIT_VALUE';
var HELIOSRX_UNSET_VALUE     = 'heliosrx/UNSET_VALUE';
var HELIOSRX_ARRAY_SET       = 'heliosrx/ARRAY_SET';
var HELIOSRX_ARRAY_ADD       = 'heliosrx/ARRAY_ADD';
var HELIOSRX_ARRAY_REMOVE    = 'heliosrx/ARRAY_REMOVE';
var HELIOSRX_SET             = 'heliosrx/SET';

/*
export const HELIOSRX_INIT_REGISTRY            = 'heliosrx/INIT_REGISTRY'
export const HELIOSRX_RESET_REGISTRY           = 'heliosrx/RESET_REGISTRY'
export const HELIOSRX_ADD_ENTRY                = 'heliosrx/ADD_ENTRY'
export const HELIOSRX_SET_ENTRY_STATUS         = 'heliosrx/SET_ENTRY_STATUS'
export const HELIOSRX_SET_GLOBAL_READY_STATE   = 'heliosrx/SET_GLOBAL_READY_STATE'
export const HELIOSRX_REM_GLOBAL_READY_STATE   = 'heliosrx/REM_GLOBAL_READY_STATE'
*/

// -----------------------------------------------------------------------------
function rtdbFetchAsObject (ref) {
  var document = ref.document;
  var ops = ref.ops;
  var resolve = ref.resolve;
  var reject = ref.reject;

  var ref$1 = ops.init();
  var target = ref$1.target;

  document.once('value', function (snapshot) {

    // INFO: This is not called, when the data does not exist

    var data = snapshot.val();
    if ( !snapshot.exists() ) {
      data = { '.exists': false };
    }
    ops.set( target, data );
    resolve( data );

  }, function (err) {
    if ( err ) {
      reject(err);
    }
  });

  return function () {}
}

// -----------------------------------------------------------------------------
function rtdbFetchAsArray (ref) {
  var collection = ref.collection;
  var ops = ref.ops;
  var resolve = ref.resolve;
  var reject = ref.reject;

  var ref$1 = ops.init();
  var target = ref$1.target;

  collection.once('value', function (snapshot) {
    var data = snapshot.val();
    ops.once(target, data, snapshot.exists());
    resolve(data);
  }, function (err) {
    if ( err ) {
      reject(err);
    }
  });

  return function () {}
}

// -----------------------------------------------------------------------------
function rtdbBindAsObject (ref) {
  var document = ref.document;
  var ops = ref.ops;
  var resolve = ref.resolve;
  var reject = ref.reject;

  /* INFO: Single value is not supported */

  // const target = {};
  var ref$1 = ops.init();
  var target = ref$1.target;

  var listener = document.on(
    'value',
    function (snapshot) {
      // let target = snapshot.ref.path.toString();
      var data = snapshot.val();

      // TODO: Handle snapshot.exists
      if ( !snapshot.exists() ) {
        data = { '.exists': false };
      }

      ops.set( target, data ); // TODO: Also pass { .exists } here?
      resolve( data ); // Only one argument allowed!
    }, function (err) {
      if ( err ) {
        reject(err);
      }
    }
  );

  return function () {
    document.off('value', listener);
  }
}

// -----------------------------------------------------------------------------
function rtdbBindAsArray (ref) {
  var collection = ref.collection;
  var ops = ref.ops;
  var resolve = ref.resolve;
  var reject = ref.reject;

  // const target = {}; // []
  var ref$1 = ops.init();
  var target = ref$1.target;

  // TODO: Handle snapshot.exists

  collection.once('value', function (snapshot) {
    // INFO: This operation is currently unused!
    ops.once(target, snapshot.val(), snapshot.exists());
    resolve();
  }, function (err) {
    if ( err ) {
      reject(err);
    }
  });

  var childAdded = collection.on(
    'child_added',
    function (snapshot, prevKey) {
      // TWE: We're not really intersted in the order, since we ensure order via sortidx
      // TODO: Add sortidx for ordered queries
      ops.add(target, snapshot.key, snapshot.val());
    },
    reject
  );

  var childRemoved = collection.on(
    'child_removed',
    function (snapshot) {
      ops.remove(target, snapshot.key);
    },
    reject
  );

  var childChanged = collection.on(
    'child_changed',
    function (snapshot) {
      ops.set( target, snapshot.key, snapshot.val() );
    },
    reject
  );

  var childMoved = collection.on( // ATTENTION: This is also used for orderByChild
    'child_moved',
    function (snapshot, prevKey) {
      // const index = indexForKey(target, snapshot.key)
      // const oldRecord = ops.remove(target, index)[0]
      // const newIndex = prevKey ? indexForKey(target, prevKey) + 1 : 0
      // ops.add(target, newIndex, oldRecord)

      // TODO: Update target.sortidx
      // oldKey = prevKey
      // newKey = snapshot.key
      // ops.order(  )
    },
    reject
  );

  return function () {
    collection.off('child_added',   childAdded);
    collection.off('child_changed', childChanged);
    collection.off('child_removed', childRemoved);
    collection.off('child_moved',   childMoved);
  }
}

/* Defines a promise that can be resolved outside of it's scope
*
* Usage:
* let d = defer()
* d.then((x) => console.log('Hello World', x))
* d.resolve(123)
* Output > Hello World 123
*/
// See: http://lea.verou.me/2016/12/resolve-promises-externally-with-this-one-weird-trick/
function defer() {
  var res, rej;

  var promise = new Promise(function (resolve, reject) {
    res = resolve;
    rej = reject;
  });

  promise.resolve = res;
  promise.reject = rej;

  return promise;
}

/* Extend native Array. Not best practive, but at least it's done the
   right way (prototype, non enumerable) */

// TODO: Do not extend native types

var proto = Array.prototype;

Object.defineProperty(proto, 'clone', {
  value: function() {
    return this.slice(0);
  },
  enumerable: false,
  configurable: true,
  writable: true
});

Object.defineProperty(proto, 'move', {
  value: function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
  },
  enumerable: false,
  configurable: true,
  writable: true
});

function arrayDiff( array1, array2 ) {
  return array1.filter(function (i) { return array2.indexOf(i) < 0; } );
}

function arrayDiffTwoWay( new_list, old_list ) {
  return {
    removed: arrayDiff( old_list, new_list ),
    added:   arrayDiff( new_list, old_list )
  }
}

/*******************************************************************************

- xTODO: status should be stores in root.status or delete 'sync' / 'status'
- xTODO: reg.*.data should be created "on-the-fly" without storing it in the db
- xTODO: Return classes instead of object (tested - works with observable)
- TODO: sharding support

*******************************************************************************/

var LOCAL_PATH_PREFIX = 'res.';

var log0 = function (name) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  return trace.apply( void 0, [ INFO_SUBSCRIBE_QUERY, ("[" + name + "]") ].concat( args ));
};
var log1 = function (name) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  return trace.apply( void 0, [ INFO_SUBSCRIBE, ("[" + name + "]") ].concat( args ));
};
var log2 = function (name) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  return trace.apply( void 0, [ INFO_SUBSCRIBE_DETAILS, ("[" + name + "]") ].concat( args ));
};
var log3 = function (name) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  return trace.apply( void 0, [ INFO_READ_INIT, ("[" + name + "]") ].concat( args ));
};
var log4 = function (name) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  return trace.apply( void 0, [ INFO_READ_REMOVE, ("[" + name + "]") ].concat( args ));
};

// const log_stringify = (v) => JSON.stringify(v)
var log_stringify = function (v) { return null; };

var subscriptions        = new WeakMap();
var _autoUnsubscribeMap  = new Map();
var _resultInstanceCache = new Map();
var _resultListCache     = new Map();

if ( String(process.env.VUE_APP_PRODUCTION) === 'false' ) {
  window.helioRxDev = window.helioRxDev || {};
  window.helioRxDev._resultInstanceCache = _resultInstanceCache;
  window.helioRxDev._resultListCache     = _resultListCache;
  window.helioRxDev._autoUnsubscribeMap  = _autoUnsubscribeMap;
}

// -----------------------------------------------------------------------------
var ReadMixin = {

  // ---------------------------------------------------------------------------
  _read_mixin_init: function _read_mixin_init() {
    log2(this.name, "[GENS:LOADER] init");

    if ( this.modelDefinition ) {
      if ( this.modelDefinition.staticGetters ) {
        // Careful: $store will point to the root instance not a with/clone-instance!

        // const context = [ this, _models, registry ];
        // const context = this._create_context()
        var context = [ this, _models ];
        this._vm = add_custom_getters( context, this, this.modelDefinition.staticGetters );
      }
    }
  },

  // ---------------------------------------------------------------------------
  /**
   * get subscriptions - Returns subscriptions that were create by this store
   *
   * @return {list} list of subscriptions
   */
  get subscriptions() { // TODO: might not work
    return subscriptions.get( this );
  },

  // ---------------------------------------------------------------------------
  /**
   * _bind_rtdb - Firebase binding
   *
   * Adapted from:
   * see: https://github.com/vuejs/vuefire/blob/feat/rtdb/packages/vuexfire/src/rtdb/index.js
   *
   * @param {{ key, ref, ops, bindAsArray }} obj - config
   * @param {string} obj.key                - Key where the data is stored locally
   * @param {firebase.database.ref} obj.ref - Firebase Realtime Database reference
   * @param {type} obj.ops                  - operations {init, add, remove, set, set_sync}
   * @param {boolean} obj.bindAsArray.      - bind as list (true), bind as document (false)
   */
  _bind_rtdb: function _bind_rtdb(ref$1) {
    var this$1 = this;
    var key = ref$1.key;
    var ref = ref$1.ref;
    var ops = ref$1.ops;
    var bindAsArray = ref$1.bindAsArray;

    // TODO check ref is valid
    // TODO check defined in vm

    // INFO: Why do we need subscriptions? Isn't that the same as the instance cache and the registry?
    //       subscritions is a liittle bit more fundamental = real listeners

    // registry = reactive data (but used where?)
    // instance cache = cached subscriptions (real and 'simulated') as generic models

    // Keep track of of Vue components that subscribed to data and automatically
    // unsubscribe when the component is destroyed.
    var last_caller = this._last_caller || null;
    if ( this.autoUnsubscribe && last_caller ) {

      // Create or update an existing unsubscribe function nd save it to _autoUnsubscribeMap
      var unsubscribeFn = function () {
        var obj;

        this$1._unbind_rtdb(key);
        return ( obj = {}, obj[key] = true, obj );
      };
      var existingFn = _autoUnsubscribeMap.get( last_caller.uid );
      if ( existingFn ) {
        unsubscribeFn = joint([ unsubscribeFn, existingFn ]);
      }
      _autoUnsubscribeMap.set( last_caller._uid, unsubscribeFn );

      // Register beforeDestroy life-cycle hook on the vue component.
      // TODO: Maybe _autoUnsubscribeMap can be removed entirely
      last_caller.$once('hook:beforeDestroy', function () {
        this$1._clean_up_refs( last_caller );
      });
    }

    var sub = subscriptions.get(this);
    if (!sub) {
      sub = Object.create(null);
      subscriptions.set(this, sub);
    }

    // unbind if ref is already bound
    if (key in sub) {
      this._unbind_rtdb(key);
    }

    // if ( subscriptions.get(key) ) { }

    return new Promise(function (resolve, reject) {
      sub[ key ] = bindAsArray
        ? rtdbBindAsArray({ key: key, collection: ref, ops: ops, resolve: resolve, reject: reject })
        : rtdbBindAsObject({ key: key, document: ref, ops: ops, resolve: resolve, reject: reject });
      // subscriptions.set(key, unsubscribe)
    })
  },

  // ---------------------------------------------------------------------------
  /**
   * Will be called on hook:beforeDestroy for each VueComponent that accessed
   * this.$models and then made a subscription (via _bind_rtdb).
   *
   */
  _clean_up_refs: function _clean_up_refs( caller ) {
    var unsubscribeFn = _autoUnsubscribeMap.get( caller._uid );
    var name = caller.$options.name || caller.$options._componentTag;
    if ( unsubscribeFn ) {
      var keys = unsubscribeFn();
      info(INFO_AUTO_UNSUBSCRIBE, "%cIt seems that the VueComponent \"" + name + "\" (" + (caller.$vnode.tag) + "), \n"
        + "accessed this.$models and created a subscriptions. The components \n"
        + "just got destroyed and so did it's subscription to " + (JSON.stringify(Object.keys(keys))) + ".",
        'color: green');
    } else {
      info(INFO_AUTO_UNSUBSCRIBE, "%cIt seems that the VueComponent \"" + name + "\" (" + (caller.$vnode.tag) + "), \n"
        + "accessed this.$models, but it either didn't create any subscriptions or \n"
        + "the subscription was already removed. The component just got destroyed \n"
        + "so there is nothing to clean up.", 'color: darkgoldenrod');
    }
    _autoUnsubscribeMap.delete( caller._uid );
  },

  // ---------------------------------------------------------------------------
  /**
   * _fetch_rtdb - Firebase binding
   *
   */
  _fetch_rtdb: function _fetch_rtdb(ref$1) {
    var key = ref$1.key;
    var ref = ref$1.ref;
    var ops = ref$1.ops;
    var bindAsArray = ref$1.bindAsArray;

    return new Promise(function (resolve, reject) {
      bindAsArray
        ? rtdbFetchAsArray({ key: key, collection: ref, ops: ops, resolve: resolve, reject: reject })
        : rtdbFetchAsObject({ key: key, document: ref, ops: ops, resolve: resolve, reject: reject });
    })
  },

  // ---------------------------------------------------------------------------
  /**
   * _unbind_rtdb - Unbind firebase from location
   *
   * @param  {type} { key } description
   */
  _unbind_rtdb: function _unbind_rtdb(ref) {
    var key = ref.key;

    var sub = subscriptions.get(this);
    if (!sub || !sub[key]) { return }

    // subscriptions.delete( key );
    // const sub = subscriptions.get(key)

    sub[key]();
    delete sub[key];
  },

  // ---------------------------------------------------------------------------
  /**
   * _infer_local_path_from_ref - Converts a firebase ref into a "walkable" path
   *
   * @param  {type} ref description
   * @return {type}     description
   *
   *   Converts
   *   "/goal/{goalId}/user_list/{uid}/task_details/ * /task_subscription",
   *   to
   *   "goal.{goalId}.user_list.{uid}.task_details.{id}.task_subscription",
   *   which refers to
   *   state.res.goal[ goalId ].user_list[ uid ].task_details[ ].task_subscription
   *
   *   TODO:
   *   state.res.goal[ goalId ].children.user_list[ uid ].children.task_details[ ].task_subscription.data
   *
   */
  _infer_local_path_from_ref: function _infer_local_path_from_ref( ref ) {
    var path = ref.path.toString();
    // return path.replace(/\//g, '.')
    return path.split('/').filter(function (p) { return p; }).join('.');
  },

  // ---------------------------------------------------------------------------
  /**
   * unsync - Stop syncing.
   *
   * @param  {type} id = null                 description
   * @param  {type} { clean_up = false } = {} description
   */
  unsync: function unsync( id, ref ) {
    if ( id === void 0 ) id = null;
    if ( ref === void 0 ) ref = {};
    var clean_up = ref.clean_up; if ( clean_up === void 0 ) clean_up = false;

    log2(this.name, "[GENS] unsync", id, clean_up);

    // TODO: Document difference between unsync( without id ) and unsyncAll()

    var key = id !== null
            ? this.global_store_path_array[ id ]
            : this.global_store_path;

    if ( key ) {
      this._unbind_rtdb({ key: key });
    }

    if ( id !== null && !( id in this.global_store_path_array ) ) {
      // This is the case, when we do unsync with id, even though
      // a data was synced with subscribeList().

      if ( this.isSuffixed ) {
        throw new Error('Unsync with id for data retrieved via subscribeList() is not supported.')
      }

      key = this.global_store_path + '.' + id;
    }

    if ( clean_up ) {
      log4(this.name, "unsync: clean up state. id:", id, "path:", key);

      // Find entry in GenericList and delete model
      if ( id !== null && _resultListCache.has( this.path ) ) {
        var list = _resultListCache.get( this.path );
        list._rem_child( id );
      }

      /*
      // TODO: Use this._match_existing_synced_nodes?
      let existing_path = id !== null
          ? this.previewPath( id )
          : this.path

      if ( _resultInstanceCache.has( existing_path ) ) {
        let model = _resultInstanceCache.get( existing_path )
        model.reset();
        model.$noaccess = true;
      }
      */

      _registry.commit(
        HELIOSRX_UNSET_VALUE,
        { path: key },
        { root: true }
      );
    }
  },

  // ---------------------------------------------------------------------------
  /**
   * unsyncAll - Stop sycning all subscriptions of this store.
   *
   * @param  {type} { clean_up = false } = {} description
   */
  unsyncAll: function unsyncAll(ref) {
    var this$1 = this;
    if ( ref === void 0 ) ref = {};
    var clean_up = ref.clean_up; if ( clean_up === void 0 ) clean_up = false;

    log2(this.name, "[GENS] unsyncAll", clean_up);

    // Make sure there is only one sync per store
    // Currently it is possible to sync, then change prop, then sync again - but never unsync

    if (!subscriptions) { return }

    // TODO: Testen!
    if ( clean_up && _resultListCache.has( this.path ) ) {
      var list = _resultListCache.get( this.path );
      list.$idList.forEach(function (id) { return list._rem_child( id ); });
      list.reset(); // ?/
    }

    Object.keys(subscriptions).forEach(function (key) {

      this$1._unbind_rtdb({ key: key });

      // TODO: Testen!
      if ( clean_up ) {
        _registry.commit(
          HELIOSRX_UNSET_VALUE,
          { path: key },
          { root: true }
        );
      }
    });
  },

  // ---------------------------------------------------------------------------
  /**
   * _fetch_individual - fetch an individual item of the collection
   *
   * @param  {type} id                            description
   * @param  {type} { overwriteKey = false } = {} description
   */
  _fetch_individual: function _fetch_individual( id, ref ) {
    if ( ref === void 0 ) ref = {};
    var overwriteKey = ref.overwriteKey; if ( overwriteKey === void 0 ) overwriteKey = false;
    var customOps = ref.customOps; if ( customOps === void 0 ) customOps = {};

    return this._sync_individual(id, { overwriteKey: overwriteKey, customOps: customOps, fetchOnce: true })
  },

  // ---------------------------------------------------------------------------
  /**
   * fetch - fetch all items in this collection
   *
   * @param  {type} { overwriteKey = false } = {} description
   */
  _fetch_list: function _fetch_list( ref ) {
    if ( ref === void 0 ) ref = {};
    var overwriteKey = ref.overwriteKey; if ( overwriteKey === void 0 ) overwriteKey = false;
    var customOps = ref.customOps; if ( customOps === void 0 ) customOps = {};
    var customRef = ref.customRef; if ( customRef === void 0 ) customRef = null;

    return this._sync_list({ overwriteKey: overwriteKey, customOps: customOps, customRef: customRef, fetchOnce: true })
  },

  // ---------------------------------------------------------------------------
  /**
   * _sync_individual - sync an individual item of the collection
   *
   * @param  {type} id                        description
   * @param  {type} { overwriteKey = false    description
   * @param  {type} fetchOnce = false }  = {} description
   */
  _sync_individual: function _sync_individual( id, ref$1 ) {
    var this$1 = this;
    if ( ref$1 === void 0 ) ref$1  = {};
    var overwriteKey = ref$1.overwriteKey; if ( overwriteKey === void 0 ) overwriteKey = false;
    var fetchOnce = ref$1.fetchOnce; if ( fetchOnce === void 0 ) fetchOnce = false;
    var customOps = ref$1.customOps; if ( customOps === void 0 ) customOps = {};

    if ( !this.isSuffixed && !fetchOnce ) {
      warn(WARNING_SYNCING_INDIVIDUAL, "Syncing individually in " + this.name + ", even though list would be supported");
    }

    var ref          = this.childRef( id );
    var key_from_ref = this._infer_local_path_from_ref( ref );
    var key          = LOCAL_PATH_PREFIX + key_from_ref;

    this.global_store_path_array[ id ] = key;

    log1(this.name, "_sync_individual:", this.name, key, overwriteKey, fetchOnce);
    log2(this.name, "[GENS] - sync ref", ref.path.toString());
    log2(this.name, "[GENS] - sync key", key);
    log2(this.name, "[GENS] - sync target", this.global_store_path_array[ id ]);

    var ops = {
      init: function () {
        /* We have to make sure, we don't trigger init here and 'set' of a list at the same time */
        var data = {};
        log2(this$1.name, '[OPS:INIT (individual)]', data);
        _registry.commit(HELIOSRX_INIT_VALUE,
          { path: this$1.global_store_path_array[ id ], data: data },
          { root: true });
        return { target: data }
      },
      set: function ( target, data ) {
        /* When using Server.TIMESTAMP this will get triggered twice.
         * Throtteling this function by approx 100ms should avoid unnecessary updates. */
        log2(this$1.name, '[OPS:SET (individual)]', target, log_stringify());

        // Check if data[.exists] = false ?
        _registry.commit(HELIOSRX_SET,
          { target: target, data: data },
          { root: true });
      }
    };

    if ( fetchOnce ) {
      ops = {
        init: function () {
          log3(this$1.name, '[OPS:INIT] (fetch, individial)');
          var data = {};
          return { target: data }
        },
        set: function (target, data) {
          log3(this$1.name, '[OPS:SET] (fetch, individial)', target, log_stringify());
        }
      };
    }

    /* Join custom ops and regular ops together */
    Object.keys(customOps).forEach(function (op) {
      ops[ op ] = joint([ ops[ op ], customOps[ op ] ]);
    });

    return fetchOnce
      ? this._fetch_rtdb({ key: key, ref: ref, ops: ops, bindAsArray: false })
      : this._bind_rtdb({ key: key, ref: ref, ops: ops, bindAsArray: false })
  },

  // ---------------------------------------------------------------------------
  /**
   * sync - sync entire collection (also track child added, child removed)
   *
   * @param  {type} { overwriteKey = false    description
   * @param  {type} fetchOnce = false }  = {} description
   *
   *  Returns a promise, that will resolve, when all items are ready
   *
   */
  _sync_list: function _sync_list( ref$1 ) {
    var this$1 = this;
    if ( ref$1 === void 0 ) ref$1  = {};
    var overwriteKey = ref$1.overwriteKey; if ( overwriteKey === void 0 ) overwriteKey = false;
    var fetchOnce = ref$1.fetchOnce; if ( fetchOnce === void 0 ) fetchOnce = false;
    var customOps = ref$1.customOps; if ( customOps === void 0 ) customOps = {};
    var customRef = ref$1.customRef; if ( customRef === void 0 ) customRef = null;


    if ( this.isSuffixed ) {
      throw new Error('Suffixed store does not support bind to array')
    }

    var ref          = customRef || this.parentRef;
    var key_from_ref = overwriteKey || this._infer_local_path_from_ref( ref );
    var key          = LOCAL_PATH_PREFIX + key_from_ref;

    log1(this.name, "sync:", this.name, key, overwriteKey, fetchOnce);
    log2(this.name, "[GENS] - ref", this.parentRef);
    log2(this.name, "[GENS] - key", key);

    this.global_store_path = key; // ??

    var commitOptions = { root: true }; // TODO: move to factory in vuefire
    var ops = {
      init: function () {
        /* This is ANNOTIATION#1, see subscribeNode for more information. */
        // log2(this.name, "[GENS-ops] init", registry.commit, HELIOSRX_INIT_VALUE, { path: this.global_store_path, data }, commitOptions);
        log2(this$1.name, '[OPS:INIT]', this$1.global_store_path, _registry.state);

        var data = {};

        /* Check if there is existing data, if yes it means _sync_individual already synced data, which we should keep. */
        var existing_data = walkGetObjectSave( _registry.state, this$1.global_store_path );
        if ( Object.keys(existing_data).length > 0 ) {
          log2(this$1.name, "[OPS:INIT] existing_data", existing_data);
          data = existing_data;
        }

        log2(this$1.name, "[OPS:INIT] data", log_stringify());
        _registry.commit(HELIOSRX_INIT_VALUE, { path: this$1.global_store_path, data: data }, commitOptions);
        return { target: data }
      },
      add: function (target, newId, data) {
        log2(this$1.name, '[OPS:ADD]', target, newId, data, log_stringify());
        _registry.commit(HELIOSRX_ARRAY_ADD, { target: target, newId: newId, data: data }, commitOptions);
      },
      remove: function (target, oldId) {

        var deleted_item = target[ oldId ];

        // Check if this data is still needed by another query
        var synced_queries = this$1._match_all_existing_synced_queries( this$1.path );

        log4(this$1.name, '[OPS:REMOVE]', target, oldId);
        log4(this$1.name, "entry_name", this$1.path );
        log4(this$1.name, "deleted_item", deleted_item );
        log4(this$1.name, "_match_existing_synced_nodes", synced_queries );

        for ( var idx in synced_queries ) {
          var query = synced_queries[idx].query;

          if ( this$1._item_matches_query( query, deleted_item ) ) {
            log4(this$1.name, "ITEM STILL IN USE", oldId, deleted_item);
            return // Cancel deletion of entry
          }
        }

        _registry.commit(HELIOSRX_ARRAY_REMOVE, { target: target, oldId: oldId }, commitOptions);
        // return [ target[ oldId ] ]
      },
      set: function (target, currentId, data) {
        log2(this$1.name, '[OPS:SET]', target, currentId, data);
        _registry.commit(HELIOSRX_ARRAY_SET, { target: target, currentId: currentId, data: data }, commitOptions);
      },
      once: function (target, data, exists) {
        log2("[OPS:ONCE]", data, exists);
      }
      // set_sync: (target, path, value ) => {
      //   registry.commit(HELIOSRX_SET_SYNC_STATE, { target, path, value }, commitOptions)
      // }
    };

    if ( fetchOnce ) {
      ops = {
        init: function () {
          log3(this$1.name, '[OPS:INIT] (fetch)', key);
          var data = {};
          return { target: data }
        },
        once: function (target, data, exists) {
          log3(this$1.name, "[OPS:ONCE] (fetch)", data, exists);
        }
      };
    }

    /* Join custom ops and regular ops together */
    Object.keys(customOps).forEach(function (op) {
      ops[ op ] = joint([ ops[ op ], customOps[ op ] ]);
    });

    log2(this.name, "[GENS] - ops", ops);
    log2(this.name, "[GENS] - payload", { key: key, ref: ref, ops: ops, bindAsArray: true });

    return fetchOnce
      ? this._fetch_rtdb({ key: key, ref: ref, ops: ops, bindAsArray: true })
      : this._bind_rtdb({ key: key, ref: ref, ops: ops, bindAsArray: true })
  },

  // ---------------------------------------------------------------------------
  _item_matches_query: function _item_matches_query(query, item) {
    // info(INFO_SUBSCRIBE_QUERY, "[_item_matches_query]", query, item)
    // TODO: Implement this function
    return true;
  },

  // ---------------------------------------------------------------------------
  _create_context: function _create_context() { // move to generic store
    return {
      model:  this,
      models: _models, // will return undefined, when called before setup
    }
  },

  // ---------------------------------------------------------------------------
  _match_all_existing_synced_queries: function _match_all_existing_synced_queries( requested_path, only_active ) {
    if ( only_active === void 0 ) only_active = true;

    // INFO: Returns all nodes that

    if ( requested_path.includes('#') ) {
      requested_path = requested_path.split('#').shift();
    }

    var match_list = [];
    for ( var existing_path in _registry.state.sync ) {

      var existing_path_without_query = existing_path.split('#').shift();
      if ( requested_path.startsWith( existing_path_without_query ) ) {

        var existing_query = _registry.state.sync[ existing_path ];
        if ( !( only_active
           && ( existing_query.status === 'Ready'
             || existing_query.status === 'Loading' ) ) ) {
          continue;
        }

        match_list.push(Object.assign({}, {path: existing_path,
          path_without_query: existing_path_without_query},
          existing_query));
      }
    }

    return match_list;
  },

  // ---------------------------------------------------------------------------
  _match_existing_synced_nodes: function _match_existing_synced_nodes( requested_path,
    subnodes_can_match_lists) {
    if ( subnodes_can_match_lists === void 0 ) subnodes_can_match_lists = false;


    // INFO: This functions is not meant to match list paths, when requesting a
    //       child node (e.g. /test/123 wont match for existing node /test/{id}).
    //       Instead this case is covered by the GenericModel-Cache
    //       and GenercList-Cache.

    /* Remove hash key, since subscribeList has a wider scope then subscribeQuery
     * ( e.g. /test/{id}#---2-- should therefor match /test/{id})
     *
     * Example:
     * existing_path  = /goal/BWpG75DcRs-kqVPPdRbxzg/meta#hashkey
     * requested_path = /goal/BWpG75DcRs-kqVPPdRbxzg/meta/commitment_meta/{id}
     */

    if ( requested_path.includes('#') ) {
      requested_path = requested_path.split('#').shift();
    }
    for ( var existing_path in _registry.state.sync ) {
      // if ( requested_path === existing_path ) {
      //   /* This is fine, just means we found the same node */
      //   continue
      // }

      var existing_path_unmodified = existing_path;

      // Check if path is covered by query cache (e.g. id > limit)
      if ( existing_path.includes('#') ) {
        var existing_path_without_query = existing_path.split('#').shift();
        if ( requested_path.startsWith( existing_path_without_query ) ) {
          warn(WARNING_SYNCING_EXISTING_QUERY_PATH, "You're trying to sync a path that has already been synced by a query. This is not supported.",
            "requested_path", requested_path,
            "existing_path", existing_path);
        }
      }

      if ( subnodes_can_match_lists && existing_path.includes('{id}') ) {
        existing_path = existing_path.replace('{id}', '');
        // TODO: Does not work for suffixed stores
        // e.g. syncing: /goal/{id}/meta
        //      lookup:  /goal/18479723/meta/abc
      }

      if ( requested_path.startsWith( existing_path ) ) {
        if ( _registry.state.sync[ existing_path_unmodified ].status === 'Ready'
          || _registry.state.sync[ existing_path_unmodified ].status === 'Loading' ) {
          warn(WARNING_SYNCING_SUBSET_DATA, this.name, "Found node of higher hierarchy that is already syncing:",
            existing_path, "vs.", requested_path);
          return existing_path_unmodified
        }
      }
    }
    return false;
  },

  // ---------------------------------------------------------------------------
  _get_sync_state: function _get_sync_state( path  ) {
    return (_registry.state.sync[ path ] || {}).status || null
  },

  // ---------------------------------------------------------------------------
  getList: function getList( idList, ref ) {
    if ( ref === void 0 ) ref = {};
    var noReactiveGetter = ref.noReactiveGetter; if ( noReactiveGetter === void 0 ) noReactiveGetter = false;

    log1(this.name, "getList", idList || '*');
    return this.subscribeList( idList, {
      noSync: true,
      createModelFromExistingCache: true,
      noReactiveGetter: noReactiveGetter
    });
  },

  // ---------------------------------------------------------------------------
  getNode: function getNode( id, ref ) {
    if ( ref === void 0 ) ref = {};
    var noReactiveGetter = ref.noReactiveGetter; if ( noReactiveGetter === void 0 ) noReactiveGetter = false;

    log1(this.name, "getNode", id);
    if ( !id ) {
      throw new Error('getNode: got invalid id: ' + id )
    }
    return this.subscribeNode( id, {
      noSync: true,
      createModelFromExistingCache: true,
      noReactiveGetter: noReactiveGetter
    })
  },

  /* --------------------------------------------------------- subscribe list */
  subscribeList: function subscribeList(idList, ref) {
    var this$1 = this;
    if ( ref === void 0 ) ref = {};
    var noSync = ref.noSync; if ( noSync === void 0 ) noSync = false;
    var noReactiveGetter = ref.noReactiveGetter; if ( noReactiveGetter === void 0 ) noReactiveGetter = false;
    var createModelFromExistingCache = ref.createModelFromExistingCache; if ( createModelFromExistingCache === void 0 ) createModelFromExistingCache = false;
    var queryParams = ref.queryParams; if ( queryParams === void 0 ) queryParams = null;

    // INFO: Different subscribeQuery's or mixing subscribeList with subscribeQuery
    //       on the same node is currently not allowed!!

    // TODO: Cache instance somewhere
    // TODO: Save idlist internally! and call subscribeNode for each item - but still return a GenericList

    var customRef = null;
    var queryHash = '';
    var entry_name = this.path;

    if ( queryParams ) {
      customRef  = this.buildQueryRef( queryParams );
      queryHash  = this._query_hash( queryParams );
      entry_name = entry_name + '#' + queryHash;

      log0(this.name, 'QUERYHASH:' + entry_name, "Using query hash in entry_name", entry_name);
    }

    log1(this.name, "subscribeList", entry_name);
    if ( _resultListCache.get(entry_name) ) {
      log1(this.name, "subscribeList - returning list cache");
      return _resultListCache.get(entry_name);
    }

    var registry_entry = _registry.getters.get_registry_entry( entry_name );
    // TODO: Check if data is in 'res'

    if ( registry_entry ) {
      log1(this.name, "subscribeList - WARN - found registry entry, but no local cache!");
    }

    /*
    if ( registry_entry ) {
      if ( registry_entry.status === 'Loading' ) {
        return factory.make_reactive_list( this.modelDefinition, null );
      }
      if ( registry_entry.status === 'Ready' ) {
        return factory.make_reactive_list( this.modelDefinition, this.getData(), this._create_context() );
      }
    }*/

    /* Check if parent path exists */
    var existing_path = this._match_existing_synced_nodes( entry_name, true );

    if ( existing_path ) {
      if ( createModelFromExistingCache ) {
        /* Maybe we don't have an instance in the cache, but still the data is
         * already here. We can use the data to create a model */

        var existing_data = this.getData(); // Should automatically return the correct data node
        log1(this.name, "Found node in existing synced data making list model from existing data", existing_data);

        // TODO: This model is not reactive for some reason

        var list = factory.make_reactive_list(
          this.modelDefinition,
          existing_data,
          this._create_context(),
          noReactiveGetter );

        /* This promise will get resolved as soon as everything is loaded */
        list.$promise = defer(); // new Deferer()

        var sync_state = this._get_sync_state( existing_path  );
        log1(this.name, "checking sync state - is data already fully synced?", sync_state );
        if ( sync_state === 'Ready' ) {
          list.$promise.resolve(true);
        }

        log4(this.name, "[Watcher] Registering Watcher");
        var unwatch = _registry.watch(
          function (state) {
            log4(this$1.name, "[Watcher]  -- asking for value");
            // ONLY FOR TESTING:
            // log4(this.name, "[Watcher]  -- existing_data", existing_data)
            // log4(this.name, "[Watcher]  -- reference", state.res.goal["BWpG75DcRs-kqVPPdRbxzg"].meta.commitment_meta)
            // log4(this.name, "[Watcher]  -- this.getData()", this.getData())
            return this$1.getData(null, true) // should be safe, when unsyncing data of a higher hierachy node
          },
          function (new_value, old_value) {
            log4(this$1.name, "[Watcher]  -- watcher triggered", new_value, old_value);

            if ( new_value === undefined || new_value === null ) {
              /* This means the list was deleted */
              list.$idList.forEach(function (old_id) {
                log4(this$1.name, "[Watcher]  -- ELIMINATIING LIST", old_id);
                list._rem_child( old_id );
              });
              list.$numReady = false;
              list.$readyAll = false;
              list.$readySome = false;
              // list.$deleted = true;
              list.$promise.resolve(true);
              return
            }

            var ids_new = Object.keys( new_value );
            var ids_old_via_watcher = old_value ? Object.keys( old_value ) : [];
            var ids_old = list.$idList;

            if ( ids_new.toString() === ids_old_via_watcher.toString() ) {
              log4(this$1.name, "[Watcher] Watcher values are the same? WHY? ", ids_new, ids_old_via_watcher);
            }

            var diff = arrayDiffTwoWay( ids_new, ids_old );
            log4(this$1.name, "[Watcher] DIFF", diff, ids_new, ids_old);
            diff.removed.forEach(function (id) {
              log4(this$1.name, "[Watcher]  -- REMOVED", id);
              list._rem_child( id );
              list.$numReady--;
            });
            diff.added.forEach(function (new_id) {
              log4(this$1.name, "[Watcher]  -- ADDED", new_id);

              /* Check instance cache */
              var child_entry_name = entry_name.split('#').shift().replace(/\{id\}/g, new_id);
              if ( _resultInstanceCache.has(child_entry_name) ) {
                warn(WARNING_COMMON, "A new item was added, but there already exists a model instance in the cache for this item. This means the subscription management failed.");
              }
              // todo: also check list cache?

              var data_reactive = this$1.getData( new_id );
              var item = factory.make_reactive_model(
                   this$1.modelDefinition,
                   data_reactive,
                   this$1._create_context(),
                   false,
                   noReactiveGetter );

              item.$id = new_id;
              list._add_child( new_id, item );
              list.$numReady++;

              _resultInstanceCache.set(child_entry_name, item); // ?
            });
            list.$promise.resolve(true);
          }
        );

        /* Save unwatch callback in generic list */
        // this.list_watchers.push( unwatch );
        list._unwatch = unwatch;

        _resultListCache.set(entry_name, list);
        return list;
      } else {
        // TODO: This warning should also show, when using subscribeList to return a cached node
        warn(WARNING_SYNCING_SUBSET_DATA, "You're trying to sync data, that is already synced by a node higher up in the hierarchy. This will result in undefined behaviour. Try using getList() or getNode() instead! Sync path:", entry_name);
      }
    }

    /* todo: remove if this never happens */
    if ( this._match_existing_synced_nodes( entry_name ) === entry_name ) {
      // This will happen, when loading from persistent state
      trace(INFO_SUBSCRIBE, ">>>", entry_name, _resultListCache, _resultInstanceCache);
      throw new Error('Exact path found, but no cache hit. This should never happen')
    }

    if (noSync) {
      log1(this.name, "subscribeList - No Sync, returning");
      warn(WARNING_ACCESSING_UNSYNCED_DATA, "You're trying to fetch data at " + entry_name + " that has not been synced yet.");
      return null;
    }

    log0(this.name, null, "*new* subscribeList", entry_name);

    // TODO: Move to sync?
    registry_entry = {
      query: queryParams,
      status: 'Loading',
    };
    _registry.commit('ADD_ENTRY', { name: entry_name, data: registry_entry });
    // TODO: registry.add_entry( registry_entry)

    var result = factory.make_reactive_list( this.modelDefinition, null, this._create_context() );
    _resultListCache.set(entry_name, result);
    result.$promise = defer();

    log1(this.name, "subscribeList - Created reactive list, made registry entry, started sync request for", registry_entry, result);
    var customOps = {
      add: function (target, newId, data) {
        _registry.commit('SET_ENTRY_STATUS', { name: entry_name, value: 'Ready' });
        log1(this$1.name, "subscribeList:add - Child ready", this$1.name, entry_name, newId );

        var child_entry_name = entry_name.split('#').shift().replace(/\{id\}/g, newId);
        if ( _resultInstanceCache.has(child_entry_name) ) {
          log1(this$1.name, "subscribeList:add - Reactive model already exists in instance cache");
        }

        // INFO: Data was not updated here with item._update_data() -> Why did it work?

        // INFO: There is no need to theck _resultListCache, because we will only
        //       get to this point, if there was not cache hit, meaning it would
        //       be the same as 'result'. However checking result.items[ id ]
        //       makes sense.

        if ( newId in result.items ) {
          warn(WARNING_COMMON, "An existing item was added twice. This means the subscription management failed.");
        }

        var item = _resultInstanceCache.has(child_entry_name)
                 ? _resultInstanceCache.get(child_entry_name)
                 : factory.make_reactive_model(
                      this$1.modelDefinition,
                      data,
                      this$1._create_context(),
                      false,
                      noReactiveGetter );

        item.$id = newId;
        result._add_child( newId, item );

        if ( _resultInstanceCache.has(child_entry_name) ) {
          /* Update item */
          log1("subscribeList:add - Updating existing item (previously synced with subscribeNode) with", data );
          item._update_data( data );

          /* It is possible, that the node was already synced and is now waiting for results (see ANNOTATION#1).
             This means, subscribeList is now responsible */

          /* This will not happen! If a sub-node is already synced via _sync_individual, child_added for this node
             will NOT be called. */

          /*
          item.$ready = true;
          registry.commit('SET_ENTRY_STATUS', { name: child_entry_name, value: 'Ready' })
          item.$promise.resolve()
          */

          // TODO: unsync individual node? sync() takes care of syncing now! Do we need to remove sync ops?
        } else {
          /* Also update instance cache! */
          _resultInstanceCache.set(child_entry_name, item);
        }
      },
      init: function () {
        log1(this$1.name, "subscribeList:init");
        return {}
      },
      remove: function (target, oldId) {
        log4(this$1.name, "subscribeList:remove", oldId);
        result._rem_child( oldId );
      },
      set: function (target, currentId, data) {
        log1(this$1.name, "subscribeList:set", currentId, data);

        /* Not 100% clear why we need to update here -
           for some reason dependencies are not triggered when
           HELIOSRX_ARRAY_SET is fired.
           */
        /* if ( currentId in this._resultInstanceCache ) {

          let item = this._resultInstanceCache[ currentId ]
          let data_reactive = this.getData( currentId );
          log1(this.name, "subscribeList:set [A] - updating model", data_reactive)
          item._update_data( data_reactive, this.modelDefinition.schema.fields )

        } else */
        if ( _resultListCache.get(entry_name)
          && currentId in _resultListCache.get(entry_name).items ) {

          var item = _resultListCache.get(entry_name).items[ currentId ];

          var data_reactive = this$1.getData( currentId );
          /* BUG: At this point data_reactive is outdated ! */
          item._update_data( data_reactive, this$1.modelDefinition.schema.fields );
          log1(this$1.name, "subscribeList:set [B] - updating model", data_reactive);

          /*
          log1(this.name, "subscribeList:set [B] - updating model", data)
          item._update_data( data, this.modelDefinition.schema.fields )
          */

        } else {
          log1(this$1.name, "subscribeList:set - WARNING - not found in cache!", currentId, _resultListCache.get(entry_name));
        }
      },
    };

    this._sync_list({ customOps: customOps, customRef: customRef }).then(function () {
      /* This promise is resolved when data is first fetched */
      result.$readyAll = true;
      result.$promise.resolve(true);
    }).catch(function (e) {

      if ( e.code === 'PERMISSION_DENIED' ) {

        warn(WARNING_PERMISSION_DENIED, e.message);
        info(INFO_PERMISSION, "======================================");
        info(INFO_PERMISSION, ("PERMISSION_DENIED [" + (this$1.name) + ".subscribeList()]"));
        info(INFO_PERMISSION, "queryParams:", queryParams);
        info(INFO_PERMISSION, "======================================");

        result.$readyAll = true;
        result.$readySome = true;
        result.$noaccess = true;

        /* TODO ? -> probably not
        result.$idList.forEach(old_id => {
          registry.commit('SET_ENTRY_STATUS', { name: entry_name_child, value: 'NoAccess' })
          let data_reactive = this.getData( id );
          data_reactive[ '.noaccess' ] = true;
          result._update_data( data_reactive, this.modelDefinition.schema.fields )
        })
        */

        result.$promise.reject(e);

      } else {
        throw e;
      }
    });

    return result;
  },

  /* --------------------------------------------------------- subscribe node */
  // noSync = Return from cache
  subscribeNode: function subscribeNode( id, ref ) {
    var this$1 = this;
    if ( ref === void 0 ) ref = {};
    var noSync = ref.noSync; if ( noSync === void 0 ) noSync = false;
    var noReactiveGetter = ref.noReactiveGetter; if ( noReactiveGetter === void 0 ) noReactiveGetter = false;
    var createModelFromExistingCache = ref.createModelFromExistingCache; if ( createModelFromExistingCache === void 0 ) createModelFromExistingCache = false;


    if ( !id ) {
      throw new Error('subscribeNode: got invalid id: ')
    }

    // TODO: This might now always yield the expected result, when defined is used
    // TODO: Figure out if list is loading or item

    /* 1. Check if data already exists */
    var entry_name_child = this.previewPath( id ); // HACK
    var entry_name_list = this.path;

    log1(this.name, "subscribeNode", entry_name_child);

    /* Check if item already exists in list cache. */
    if ( _resultListCache.get(entry_name_list) ) {
      if ( id in _resultListCache.get(entry_name_list).items ) {
        log1(this.name, "subscribeNode - returning from list cache");
        return _resultListCache.get(entry_name_list).items[ id ];
      }
    }

    if ( _resultInstanceCache.has(entry_name_child) ) {
      log1(this.name, "subscribeNode - returning from instance cache");
      return _resultInstanceCache.get(entry_name_child);
    }

    // TODO: This does not check if the parent path exists! It checks if this
    //       particular child is already synced, which can happen if subscribeNode
    //       is triggered while subscribeList is still waiting for OPS:ADD

    if ( this._match_existing_synced_nodes( entry_name_list ) ) {
      log0(this.name, "======================================= (FIXME)",
        { 'entry_name_child': entry_name_child },
        { 'entry_name_list':  entry_name_list },
        { 'has:node':         _resultInstanceCache.has(entry_name_child) },
        { 'get:list':         _resultInstanceCache.get(entry_name_list) }
      );

      // TODO: For some reason this also get's called, when an instance should
      //       already be in the instance cache

      // In this case we could do the following:
      // 1. check if list is "loading"
      // 2. create a GenericModel that is not $ready
      // 3. check if results are already at path
      // 4. if not, call OPS:INIT
      // 5. return generic model and write to instance cache
      // *6. when data is ready in subscribe list, get model from instance cache
      // *7. set model to Ready
      // *8. set data with commit()
    }

    /* Check if parent path exists */
    if ( this._match_existing_synced_nodes( entry_name_child ) ) {
      if ( createModelFromExistingCache ) {
        var existing_data = this.getData( id ); // Should automatically return the correct data node
        log1(this.name, "Found node in existing synced data making model from existing data", existing_data);

        var model = factory.make_reactive_model(
          this.modelDefinition,
          existing_data,
          this._create_context(),
          false,
          noReactiveGetter );

        model.$id = id;
        model.$ready = true;
        // model._update_data( existing_data, this.modelDefinition.schema.fields )

        _resultInstanceCache.set( entry_name_child, model );
        log1(this.name, "made model", model);
        return model;

      } else {
        warn(WARNING_SYNCING_SUBSET_DATA, "You're trying to sync data, that is already synced by a node higher up in the hierarchy. This will result in undefined behaviour. Try using getNode() instead! Sync path:", entry_name_child);
      }
    }

    /* todo: remove if this never happens */
    if ( this._match_existing_synced_nodes( entry_name_child ) === entry_name_child ) {
      // This will happen, when loading from persistent state
      trace(INFO_SUBSCRIBE, ">>>", entry_name_child, _resultListCache, _resultInstanceCache);
      throw new Error('Exact path found, but no cache hit. This should never happen')
    }

    if (noSync) {
      // warn(WARNING_ACCESSING_UNSYNCED_DATA, "You're trying to fetch at " + entry_name_child + " that has not been synced yet.");
      return null;
    }

    log0(this.name, id, "*new* subscribeNode", entry_name_child);

    /* 2. Create empty model that is updated later when data is ready */
    var load_result = factory.make_reactive_model(
      this.modelDefinition,
      null,
      this._create_context(),
      false,
      noReactiveGetter );

    load_result.$id = id;
    load_result.$promise = defer();
    _resultInstanceCache.set( entry_name_child, load_result );

    /* 3. Create registry entry */
    var registry_entry = {
      id: id,
      status: 'Loading',
    };
    _registry.commit('ADD_ENTRY', { name: entry_name_child, data: registry_entry });
    // TODO: registry.add_entry( registry_entry)
    log1(this.name, "subscribeNode - Made registry entry and started at", entry_name_child, registry_entry);

    var customOps = {
      init: function (data) {
        log1(this$1.name, "subscribeNode:init", data);
        return {}
      },

      set: function (target, data) {
        log1(this$1.name, "subscribeNode:set", target, data);
      },
    };

    /* 4. Start syncing */
    this._sync_individual( id, { customOps: customOps } ).then( function (data) {

      var data_reactive = this$1.getData( id );
      log1(this$1.name, "subscribeNode - data ready", entry_name_child, data, data_reactive);

      if ( data_reactive === undefined ) {
        /* This case will not occur anymore
        /* In some cases, when a node is subscribing and while waiting for the results the list,
           that contains the node is synced as well, it can happen that the list is resetted
           in $registry.state.res (See. ANNOTIATION#1 ) */
        warn(WARNING_COMMON, this$1.name, "subscribeNode - subscribeList took over, while waiting for _sync_individual. subscribeList will handle instance now.");

        /* We need to wait now, until the list is synced, so we can return reactive data. This
           is (hopefully) handled by subscribe List, when picking up 'load_result' from the instance cache */

        /* ...but this only works if the node really exists in the list */

        return

        /* if ( _resultInstanceCache.has(child_entry_name) ) {
          return  _resultInstanceCache.get(child_entry_name)
        } else {
          throw new Error('THIS IS BAD');
        } */
      }

      load_result._update_data( data_reactive, this$1.modelDefinition.schema.fields );
      load_result.$ready = true;
      load_result.$noaccess = false;

      // INFO: this is only called once, maybe thats why we have problem here

      // Vue.observable( registry.state.res.goal[ id ].meta )
      // load_result.$state = registry.state.res.goal[ id ].meta
      // Vue.observable( load_result.$state )

      _registry.commit('SET_ENTRY_STATUS', { name: entry_name_child, value: 'Ready' });
      // TODO: registry.set_entry_status( entry_name, 'Ready' )

      log1(this$1.name, "subscribeNode - created reactive model", load_result);
      load_result.$promise.resolve(true);
    }).catch(function (e) {

      if ( e.code === 'PERMISSION_DENIED' ) {

        // !!! TODO: Also implement for fetchNode, fetchList !!!

        warn(WARNING_PERMISSION_DENIED, e.message);
        info(INFO_PERMISSION, "======================================");
        info(INFO_PERMISSION, ("PERMISSION_DENIED [" + (this$1.name) + ".subscribeNode( " + id + " )]"));
        // Query parameter for *List
        info(INFO_PERMISSION, "======================================");

        _registry.commit('SET_ENTRY_STATUS', { name: entry_name_child, value: 'NoAccess' });

        var data_reactive = this$1.getData( id ); // maybe we should remove everything...
        data_reactive[ '.noaccess' ] = true;
        load_result._update_data( data_reactive, this$1.modelDefinition.schema.fields );
        load_result.$ready = true;
        load_result.$noaccess = true;

        load_result.$promise.reject(e);

      } else {
        throw e;
      }
    });

    return load_result
  },

  // ---------------------------------------------------------------------------
  buildQueryRef: function buildQueryRef(ref) {
    var key = ref.key; if ( key === void 0 ) key = undefined;
    var value = ref.value; if ( value === void 0 ) value = undefined;
    var limit = ref.limit; if ( limit === void 0 ) limit = undefined;
    var startAt = ref.startAt; if ( startAt === void 0 ) startAt = undefined;
    var endAt = ref.endAt; if ( endAt === void 0 ) endAt = undefined;


    var customRef = this.parentRef;
    if ( key === '*' ) {
      // Don't forget to add indexOn( [ '.value' ] )
      customRef = customRef.orderByValue();
    } else if ( key === undefined ) {
      // No index needed. Key is always indexed
      customRef = customRef.orderByKey();
    } else {
      // Don't forget to add indexOn( [ key ] )
      customRef = customRef.orderByChild(key);
    }
    if ( value !== undefined ) {
      customRef = customRef.equalTo(value);
    }
    if ( startAt !== undefined ) {
      customRef = customRef.startAt(startAt);
    }
    if ( endAt !== undefined ) {
      customRef = customRef.endAt(endAt);
    }
    if ( limit !== undefined ) {
      if ( limit > 0 ) {
        customRef = customRef.limitToFirst(limit);
      } else {
        customRef = customRef.limitToLast(-limit);
      }
    }

    return customRef
  },

  // ---------------------------------------------------------------------------
  _query_hash: function _query_hash( query ) {
    var queryHash = [ query.key, query.value, query.limit, query.startAt, query.endAt ].join('_');
    return queryHash;
  },

  // ---------------------------------------------------------------------------
  /*
  query:
    - key = key, '*' or undefined
    - value
    - limit
    - startAt
    - endAt
  options:
    - noSync = false
    - noReactiveGetter = false
    - createModelFromExistingCache = false
    @example
      this.$models.example.subscribeQuery({
        key: 'createdAt',
        startAt: 123456789,
        limit: 100
      });
  */
  subscribeQuery: function subscribeQuery(query, options) {
    if ( options === void 0 ) options = {};

    // TODO: alternative syntax subscribeQuery({ key: value }, 100)
    return this.subscribeList( null, Object.assign({}, options, {queryParams: query}) )
  },

  // ---------------------------------------------------------------------------
  fetchNode: function fetchNode(id, ref) {
    var this$1 = this;
    if ( ref === void 0 ) ref = {};
    var noReactiveGetter = ref.noReactiveGetter; if ( noReactiveGetter === void 0 ) noReactiveGetter = false;

    // TODO: in state schreiben?
    // TODO: Simplify by using ref directly
    // TODO: ['.exists'] wird nicht gesetzt! -> Actually not possible, once('value') won't trigger

    /* 2. Create empty model that is updated later when data is ready */
    var load_result = factory.make_reactive_model(
      this.modelDefinition,
      null,
      this._create_context(),
      false,
      noReactiveGetter );

    load_result.$id = id;
    load_result.$promise = defer();

    /* 3. Create registry entry */
    /*
    let registry_entry = {
      name: entry_name_child,
      status: 'Loading',
      fetch: true
    };
    registry.commit('ADD_ENTRY', {...})
    */

    var customOps = {
      init: function () {
        log3(this$1.name, "fetchNode:init");
        return {}
      },

      set: function (target, data) {
        log3(this$1.name, "fetchNode:set", target, data);
      },
    };

    this._fetch_individual( id, { customOps: customOps } ).then( function (data) {
      log3(this$1.name, "fetchNode - data ready", data);
      // TODO: make data reactive
      load_result._update_data( data, this$1.modelDefinition.schema.fields );
      load_result.$ready = true;
      /*
      registry_entry.status = 'Ready'
      registry.commit('SET_ENTRY_STATUS', registry_entry)
      */
      load_result.$promise.resolve(true);
    });

    return load_result
  },

  // ---------------------------------------------------------------------------
  fetchList: function fetchList(ref) {
    var this$1 = this;
    if ( ref === void 0 ) ref = {};
    var noReactiveGetter = ref.noReactiveGetter; if ( noReactiveGetter === void 0 ) noReactiveGetter = false;
    var queryParams = ref.queryParams; if ( queryParams === void 0 ) queryParams = null;

    // TODO: Simplify by using ref directly

    var customRef = queryParams ? this.buildQueryRef( queryParams ) : null;

    /* 1. Create empty model list */
    var list = factory.make_reactive_list(
      this.modelDefinition,
      null,
      this._create_context(),
      noReactiveGetter );

    /* This promise will get resolved as soon as everything is loaded */
    list.$promise = defer();

    var customOps = {
      init: function () {
        log3(this$1.name, "fetchList:init");
        return {}
      },
      once: function (target, data, exists) {
        log3(this$1.name, "fetchList:once", data);
      }
    };

    /* 2. Start fetching and update list when data is ready */
    this._fetch_list({ customOps: customOps, customRef: customRef }).then(function (data) {
      log3(this$1.name, "fetchList:resolve", data);

      var id_list = Object.keys( data || [] );

      id_list.forEach(function (new_id) {

        var item_data = data[ new_id ];
        var item = factory.make_reactive_model(
             this$1.modelDefinition,
             item_data,
             this$1._create_context(),
             false,
             noReactiveGetter );

        item.$id = new_id;

        list._add_child( new_id, item );
        list.$numReady++;
      });

      list.$readyAll = true;
      list.$promise.resolve(true);
    });

    return list;
  },

  // ---------------------------------------------------------------------------
  fetchQuery: function fetchQuery(query, options) {
    // let customRef = this.buildQueryRef(query)
    return this.fetchList(Object.assign({}, options, {queryParams: query}))
  },

  /* ------------------------------------------------------------------------ */
  getRegistryState: function getRegistryState() {
    return _registry.state;
  },

  /* ------------------------------------------------------------------------ */
  getAllSyncedPaths: function getAllSyncedPaths() {
    var list = {};
    Object.keys( _registry.state.sync ).forEach(function (path) {
      list[ path ] = _registry.state.sync[ path ].status;
    });
    return list;
  },

  // ---------------------------------------------------------------------------
  /* Syntax:
   * getData() -> get reference to list of data
   * getData(child_id) -> get reference to an item in the list
   *
   * TODO: Move redudant?
   *
   * */
  getData: function getData(id, safe) {
    if ( id === void 0 ) id = null;
    if ( safe === void 0 ) safe = false;
    var item_path = '';
    if ( this.isSuffixed || id ) {
      if ( !id ) {
        throw new Error('getData: id required for suffixed stores')
      }
      item_path = this.path.replace(/\{id\}/g, id);
    } else {
      item_path = this.path.split('{id}').shift();
    }

    var data_path = LOCAL_PATH_PREFIX + item_path.split('/').filter(function (p) { return p; }).join('.');

    if ( !_registry.state.initialized ) {
      return null
    }

    // info(INFO_SUBSCRIBE, "getData data_path", data_path);
    {
      return safe
        ? walkGetObjectSave( _registry.state, data_path )
        : walkGet( _registry.state, data_path )
    }
  },

  // ---------------------------------------------------------------------------
  /* INFO: Currently not use, there is better methods
  exists(id = null) {
    // Only for the following use case:
    // - Data has been synced at /path/*
    // - We want to know if /path/{id}/bla/bla exists
    // Example:
    // $models.timeslotWeekdayPref.with({ timeslotCollectionId: tscId }).exists()

    let existing_path = id
        ? this._match_existing_synced_nodes( this.previewPath( id ), true )
        : this._match_existing_synced_nodes( this.path, true )

    // This does not work in all cases!
    if ( existing_path ) {
      return !!this.getData(id)
    }

    return false;
  },
  */

  // ---------------------------------------------------------------------------

  // TODO: make static
  //       (would be a little bit of work, since this is an object not a class)
  resetGlobalInstanceCache: function resetGlobalInstanceCache() {
    try {
      _resultInstanceCache.forEach(function (instance) {
        instance.reset();
      });
      _resultListCache.forEach(function (instance) {
        instance.reset();
      });
    } catch ( e ) {
      warn(WARNING_COMMON, "Reseting instances failed", e);
    }
    _resultInstanceCache.clear();
    _resultListCache.clear();
  },

  // ---------------------------------------------------------------------------
};

var lodash_isequal = createCommonjsModule(function (module, exports) {
/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = isEqual;
});

/*******************************************************************************

- TODO: [ ] ...

*******************************************************************************/

var BACKEND = 'REALTIMEDB';

// -----------------------------------------------------------------------------
var WriteMixin = {

  // ---------------------------------------------------------------------------
  _write_mixin_init: function _write_mixin_init( reset ) {
    if ( reset === void 0 ) reset = false;

    if ( this.modelDefinition ) {
      if ( this.modelDefinition.staticActions ) {

        var context = {
          $model: this,
          $modelsGetter: function () { return _models; },
          // $models: _models, // must be injected later
          // $registry: registry,
          // $state: registry.state,
        };
        // const context = this._create_context();
        add_custom_actions( context, this, this.modelDefinition.staticActions, reset );
      }
    }
  },

  // ---------------------------------------------------------------------------
  /**
  * @example <caption>Add a new item</caption>
  * challenge.add({ title: 'Name' })
  *
  * @returns {Promise} - Promise that returns the new id when resolved
  */
  add: function add( overwrite_data, new_id, options ) {
    var obj;

    /* if ( this.isSuffixed ) {
      warn(WARNING_DEPRECATED,
        'Suffixed stores can not create new items, use unsuffixed'
      + ' store instead (e.g. goal instead of goalMeta).')
    } */

    var payload = null;
    if ( !new_id ) {
      new_id = this._get_uid();
    }

    if ( !new_id['.sv'] && !this._validate_id( new_id ) ) { // only validate if not a server variable
      throw new Error('Got invalid id:' + new_id)
    }

    var useTemplateFunction = true;
    if ( options && options.directWrite ) {
      useTemplateFunction = false;
    }

    if ( this.modelDefinition ) {

      if ( useTemplateFunction ) {
        if ( this.modelDefinition.schema && this.modelDefinition.schema.create ) {
          /* Check if required input args are present */
          this._check_required_create_arg( overwrite_data );

          /* Execute create function */
          payload = this.modelDefinition.schema.create(
            overwrite_data,
            overwrite_data,
            BACKEND );
        } else {
          warn(WARNING_NO_CREATE_FUNCTION, "No create function found in type definition, using overwrite data as payload.");
          payload = overwrite_data;
        }
      } else {
        payload = overwrite_data;
      }

      /* Validate created data against it's schema. This is not 100% necessary,
         but just checks if the data coming from create() is consistent with
         the schema. */
      if ( this.modelDefinition.schema ) {
        this._validate_schema( payload, false );
      } else {
        warn(WARNING_NO_SCHEMA, "No schema found to validate input");
      }
    } else {
      warn(WARNING_NO_SCHEMA, "No type definition found, using UNVALIDATED overwrite data as payload.");
      payload = overwrite_data;
    }

    this._convert_moment_objects( payload );

    info(INFO_STORE_WRITE, "Creating at", this.previewPath(new_id), "with payload", payload);

    /*
    if ('.sv' in new_id) { // server value in key
      warn(WARNING_CLIENT_VALIDATION, 'server value in id detected')
      return this.parentRef.update({ [newPostKey]: payload }).then(() => new_id);
    }
    */

    if ( this.isSuffixed ) {
      return this.childRef( new_id ).update(payload).then(function () { return new_id; });
    } else {
      return this.parentRef.update(( obj = {}, obj[new_id] = payload, obj )).then(function () { return new_id; });
    }
  },

  // ---------------------------------------------------------------------------
  /**
  * @example <caption>Update single field</caption>
  * challenge.update(id, { key: value })
  * goal_user_settings.update({ 'kanbanSettings/showFinishedTasks': 1 })
  *
  * @example <caption>Update multiple fields</caption>
  * challenge.update(id, { key1: value1, key2: value2 })
  * challenge.update([{ key1: value1 }, { key2: value2 }, ...]) -- ????
  *
  */
  update: function update(id, data) {
    // if ( !util.isArray( data ) ) {
    //   data = [ data ];
    // }
    // data.forEach((value, key) => {
    //   payload
    // });

    if ( !id || !data ) {
      throw new Error('Either id or data is missing.')
    }

    if ( !this._validate_id(id) ) {
      if ( (this.modelDefinition.schema || {}).unsafe_disable_validation ) {
        warn(WARNING_INVALID_ID, "Got invalid id <" + id + ">, but validation is disabled.");
      } else {
        throw new Error('Got invalid id in update')
      }
    }

    // TODO: Replace '/' with '.' to be consistent with schema --> .replace(/\//g, '.')

    if ( this.modelDefinition.schema ) {
      this._validate_schema( data, true );
    } else {
      warn(WARNING_NO_SCHEMA, "No schema found to validate input");
    }

    // let path = this.interpolatedPath;
    var payload = data;
    this._convert_moment_objects( payload );

    info(INFO_STORE_WRITE, "Updating at", this.previewPath(id), "with payload", payload);
    return this.childRef( id ).update(payload);
  },

  // ---------------------------------------------------------------------------
  /**
  *
  * @param {object/array} sortidxList - Batch should be an array or array of objects
  * @example
  * store.reorder([id1, id2, ...])
  * store.reoder([{ id: id1, sortidx: 1 }, { id: id2 sortidx: 2 }, ...])
  *
  * The second version can also be used to pass the entire collection
  * store.reoder(updated_commitment_list)
  */
  reorder: function reorder(sortidxList, options) {
    var this$1 = this;
    if ( options === void 0 ) options = {};


    if ( this.isSuffixed ) {
      throw new Error('Suffixed store does not support reorder')
    }

    var sortkey = options.overwriteSortIdxKey || 'sortidx';

    if ( sortidxList.length > 0 ) {
      var first_item = sortidxList[0];
      var sortidx = 0;

      if ( isString( first_item ) || isNumeric( first_item ) ) {
        sortidxList = sortidxList.map(function (id) {
          sortidx = sortidx + 100;
          return { id: id, sortidx: sortidx }
        });
      }

      if ( '$id' in first_item || first_item.constructor.name === 'GenericModel' ) {
        sortidxList = sortidxList.map(function (model) {
          sortidx = sortidx + 100;
          return { id: model.$id, sortidx: sortidx }
        });
      }
    }

    var batchData = {};
    sortidxList.forEach(function (item) {
      var obj;

      var sortidx = item.sortidx;

      // Support 'id' and '$id' as key
      item.id = item.id || item.$id;

      if (typeof sortidx !== "number") {
        sortidx = parseFloat(sortidx);
      }

      if (isNaN(sortidx)) {
        throw new Error("Got invalid sortidx", sortidx);
      }

      if (!this$1._validate_id(item.id)) {
        throw new Error("Got invalid id", item.id);
      }

      // payload[`tasks.${item.id}.sortidx`] = sortidx;
      batchData[item.id] = ( obj = {}, obj[sortkey] = sortidx, obj );
    });

    var payload = {};
    Object.keys(batchData).forEach(function (id) {
      var data = batchData[id];
      Object.keys(data).forEach( function (prop) {
        /* Allow to update multiple fields. This is not required here, but maybe in the future */
        // data[path + '/' + subset_name + '/' + id + '/' + prop] = data[prop];
        // "/goal/{goalId}/user_list/{uid}/task_names/"

        payload[ this$1.previewPath(id) + '/' + prop ] = data[prop];
      });
    });

    // TODO: Check schema if sortidx is allowed

    info(INFO_STORE_WRITE, "Updating at", this.previewPath(), "with payload", payload);
    return this.rootRef.update(payload)
  },

  // ---------------------------------------------------------------------------
  /**
  * Deletes one or many an entry at the data location
  * @param {UUID} id - id the item or arrary of ids of items that should be deleted
  * @param {bool=} soft_delete - optional: Overwrite default behaviour for delete mode
  * @example
  * challenge.remove(id)
  * challenge.remove(id, true) // Soft delete
  * challenge.remove([id1, id2, id3], true) // List mode
  */
  remove: function remove(id, soft_delete) {
    var this$1 = this;


    // TODO: Check in schema if soft delete is supported

    soft_delete = soft_delete === undefined
                ? this.defaultDeleteMode === DeleteMode.SOFT
                : soft_delete;

    if ( Array.isArray( id ) ) {

      var id_list = id;
      var payload = {};
      id_list.forEach(function (id) {
        if ( !this$1._validate_id(id) ) {
          throw new Error('Got invalid id in remove')
        }

        if ( soft_delete ) {
          payload[ id + '/deleted' ] = true;
        } else {
          payload[ id ] = null;
        }
      });

      info(INFO_STORE_WRITE, "Batch deleting at", this.path, "with payload", payload);
      return this.parentRef.update(payload);
    }

    if ( !this._validate_id(id) ) {
      throw new Error('Got invalid id in remove')
    }

    // TODO: Check in schema if soft delete is supported

    if ( soft_delete ) {
      info(INFO_STORE_WRITE, "Soft deleting at", this.path, "with", { deleted: true });
      return this.update(id, { deleted: true })
      // return this.childRef( id ).update({ deleted: true  });
    }

    // TODO: automatically remove listener !!!

    info(INFO_STORE_WRITE, "Hard deleting at", this.path);
    return this.childRef( id ).remove();
  },

  // ---------------------------------------------------------------------------
  /**
  * Restores a deleted entry at the data location
  */
  restore: function restore( id ) {
    return this.update(id, { deleted: false }) // ... or null
  },

  // ---------------------------------------------------------------------------
  /**
   * copy - Copy data between nodes (same as move, but keeps original
   *        and generates new id)
   * @param {id} id - id of source object
   * @param {object} contextA - props of the source path
   * @param {object} contextB - props of the destination path
   *
   */
  copy: function copy(id, contextA, contextB) {
    return this.move(id, contextA, contextB, { keepOriginal: true, keepId: false });
  },

  // ---------------------------------------------------------------------------
  /**
  * Move data between nodes
  * @params {UUID} id - Id of the object that should be moved
  * @param {object} contextA - props of the source path
  * @param {object} contextB - props of the destination path
  *
  * @example
  *   store.move(234, { uid: 'A' }, { uid: 'B' })
  *
  *   store.move(id, { uid: 'A', taskId: 234 }, { uid: 'B', taskId: 234 })
  *
  * @todo support batch move (as transaction!):
  *   storeA = GenericStore('/goal/{goalId}/user_list/{uid}/task_names/*')
  *   storeB = GenericStore('/goal/{goalId}/user_list/{uid}/task_details/*')
  *   storeC = GenericStore('/goal/{goalId}/user_list/{uid}/task_end_dates/*')
  *   let superStore = SuperStore([storeA, storeB, storeC])
  *   superStore.batchMove( id, contextA, contextB )
  *
  */
  move: function move(id, contextA, contextB, ref) {
    var this$1 = this;
    if ( ref === void 0 ) ref = {};
    var keepOriginal = ref.keepOriginal; if ( keepOriginal === void 0 ) keepOriginal = false;
    var keepId = ref.keepId; if ( keepId === void 0 ) keepId = true;


    if ( this.isSuffixed ) {
      throw new Error('Suffixed store does not support move')
      // TODO: It probably does - test and remove this check
    }

    if ( !this._validate_id(id) ) {
      throw new Error('Got invalid id in remove')
    }

    var keysContextA = Object.keys( contextA ).sort();
    var keysContextB = Object.keys( contextB ).sort();

    if ( !lodash_isequal(keysContextA, keysContextB) ) {
      throw new Error('Context A and context B do not have equal keys')
    }

    // TODO: Validate each id in keys

    /* Example
       path = '/goal/{goalId}/user_list/{uid}/task_session_list/{taskId}/*'

       define({
         goalId: 'KrZPg8N6THOisFz_T992Zg',
         uid: 'l1X8FPc7YtbftlC31frciInV3PU2'
       })

       path = '/goal/KrZPg8N6THOisFz_T992Zg/user_list/l1X8FPc7YtbftlC31frciInV3PU2/task_session_list/{taskId}/{id}'

       move(123, { uid: 'A', taskId: 234 }, { uid: 'B', taskId: 234 })

       pathA = '/goal/KrZPg8N6THOisFz_T992Zg/user_list/A/task_session_list/234/123'
       pathB = '/goal/KrZPg8N6THOisFz_T992Zg/user_list/B/task_session_list/234/123'
    */

    var propsA = Object.assign({}, this.definedProps, contextA, { id: id });
    var propsB = Object.assign({}, this.definedProps, contextB, { id: id });

    if ( !keepId ) {
      propsB['id'] = this._get_uid(); // TODO: allow to set new id ?
    }

    /* Replace * with {id} in template string (see interpolatedPath)*/
    var templatePath = this.templatePath.replace(/\*/, '{id}');

    var pathA = parseTpl(templatePath, propsA);
    var pathB = parseTpl(templatePath, propsB);

    // if( !this.isSuffixed ) {
    //   pathA = pathA.slice(0, -1)
    //   pathB = pathB.slice(0, -1)
    // }

    /* No need to check pathB, since we ensure that they have the same keys */
    var undefinedFields = analyzeTpl( pathA );
    if ( undefinedFields.length > 0 ) {
      throw new Error('Not all template id\'s are defined. Required fields are ' + undefinedFields.join(', '))
    }

    // 1. Read at A
    return this._db.ref(pathA).once('value').then(function (snapshot) {
      var objectA = snapshot.val();
      // TODO: check if we got data
      return objectA
    }).then(function (objectA) {

      // 2. Write A to B
      // 3. Delete A (as a transaction with 2.)
      var payload = {};
      payload[pathA] = null;
      payload[pathB] = objectA;

      if ( keepOriginal ) {
        payload = {};
        payload[pathB] = objectA;
      }

      info(INFO_STORE_WRITE, "Moving data from ", pathA, "to", pathB, "with payload", payload);
      return this$1.rootRef.update(payload).then(function () { return propsB['id']; })
    });
  },

  /**
  * transaction - perform transaction on RTDB
  *
  * @example:
  * $models.example.transaction( <childId>, <prop>, <transaction> )
  * $models.example.transaction( id, 'coins', coins => coins * 2 )
  * $models.example.transaction( id, 'coins', 'inc', 100 )
  * $models.example.transaction( id, 'coins', 'inc' ) // defaul: increment by 1
  *
  */
  transaction: function transaction( id, prop, transaction$1, value ) {
    var obj;

    if ( value === void 0 ) value = 1;

    if ( !this._validate_id(id) ) {
      throw new Error('Got invalid id in remove')
    }

    var targetRef = this.childRef( id );
    if ( prop ) {
      this._validate_schema(( obj = {}, obj[prop] = 1, obj )); // HACK: Using numeric dummy value to check schema
      targetRef = targetRef.ref.child(prop);
    }

    if ( typeof transaction$1 === 'string' ) {
      switch ( transaction$1 ) {
        case 'inc': transaction$1 = function (v) { return ( v || 0 ) + value; }; break;
        case 'dec': transaction$1 = function (v) { return ( v || 0 ) - value; }; break;
      }
    }

    if ( typeof transaction$1 !== 'function' ) {
      throw new Error('Transacton must be a function')
    }

    info(INFO_STORE_WRITE, "Tranaction on", targetRef.path.toString() /*, "with", transaction*/);
    return targetRef.transaction(transaction$1).then(function (result) {
      if ( result.committed ) {
        info(INFO_STORE_WRITE, "Transacton successfully committed");
        return true
      }
      info(INFO_STORE_WRITE, "Transacton aborted"); // To abort transaction return undefined
      return false
    });
  },

  // ---------------------------------------------------------------------------
  /**
   * new - Create empty model from schema (without calling create function)
   *
   * new + write = new_id + update
   *
   * @return {type}  description
   */
  new: function new$1() {
    var model = factory.make_reactive_model( this.modelDefinition, null, this._create_context(), false );
    return model;
  },

  /**
   * newFromTemplate - Create empty model from create function
   *
   * newFromTemplate + write = add
   *
   * @return {type}  description
   */
  newFromTemplate: function newFromTemplate( data, optional_data ) {
    if ( data === void 0 ) data = {};
    if ( optional_data === void 0 ) optional_data = null;

    var generated_data = this.empty( data, optional_data );
    var model = factory.make_reactive_model( this.modelDefinition, data, this._create_context(), false );
    model._update_data( generated_data, null, true ); // doppelt
    return model
  },
  /**
   * newFromData - Create empty model from create function
   *
   * newFromData + write = add
   */
  newFromData: function newFromData( data, make_dirty ) {
    if ( data === void 0 ) data = {};

    var model = factory.make_reactive_model( this.modelDefinition, data, this._create_context(), false );
    // model._update_data( generated_data, null, true );
    return model
  },

  /**
   * empty - Create empty payload from schema.create()
   *         This method WILL only create an JS-Object, not a GenericModel
   *         In most cases, you want to use newFromTemplate instead
   */
  empty: function empty( data, optional_data ) {
    if ( data === void 0 ) data = {};
    if ( optional_data === void 0 ) optional_data = null;

    if ( !this.modelDefinition ) {
      return null
    }

    if ( !( this.modelDefinition.schema && this.modelDefinition.schema.create ) ) {
      return null
    }

    this._check_required_create_arg( data );

    var payload = this.modelDefinition.schema.create( data, optional_data || data /*HACK*/, BACKEND );

    /* Validate created data against it's schema. */
    if ( this.modelDefinition.schema ) {
      this._validate_schema( payload, false );
    } else {
      warn(WARNING_NO_SCHEMA, "No schema found to validate input");
    }

    return payload;
  },

  /**
   * _convert_moment_objects - Convert all moment objects
   *
   */
  _convert_moment_objects: function _convert_moment_objects( payload ) {
    if ( typeof payload !== 'object' ) {
      trace(INFO_MOMENT, "Got invalid payload in _convert_moment_objects", payload, typeof payload);
      throw new Error('Expected object, got ' + payload);
    }
    /* payload can either be array or object */
    for ( var prop in payload ) {
      if ( moment.isMoment( payload[ prop ] ) ) {
        if ( payload[ prop ].toRealtimeDB ) {
          payload[ prop ] = payload[ prop ].toRealtimeDB();
        } else {
          throw new Error('Moment object passed to add/update must be enhanced moment objects.')
        }
      } else if ( Array.isArray( payload[ prop ] ) ) {
        this._convert_moment_objects( payload[ prop ] );
      } else if ( typeof payload[ prop ] === 'object' ) {
        // TODO: Detect circular structures
        this._convert_moment_objects( payload[ prop ] );
      }
    }
  }
};

// import { _Vue as Vue } from '../external-deps'

var slugid = require('slugid');

var defaultDB = null;
var recentModelCallerComponent = null; // Component, that last called $models

var _Vue$1;
var _firebase = null; // TODO: Getter with not init warn

// let _userId = null; // This is not stateless !!! also this is NOT reactive !!!
// let genericStoreGlobalState = _Vue.observable({ userId: null })
var genericStoreGlobalState = { userId: null };

function setup$1(ref) {
  var Vue = ref.Vue;
  var firebase = ref.firebase;

  _Vue$1 = Vue;

  genericStoreGlobalState = _Vue$1.observable(genericStoreGlobalState);
  /* In Vue 2.x, _Vue.observable directly mutates the object passed to it, so that it
  is equivalent to the object returned, as demonstrated here. In Vue 3.x, a reactive
  proxy will be returned instead, leaving the original object non-reactive if mutated
  directly. Therefore, for future compatibility, we recommend always working with the
  object returned by _Vue.observable, rather than the object originally passed to it. */

  factory.configure({ GenericModel: GenericModel, GenericList: GenericList });

  _firebase = firebase;
}

var defaultStoreOptions = {
  isAbstract:           false,
  uidMethod:            UIDMethod.PUSHID,
  additionalProps:      [],
  defaultDeleteMode:    DeleteMode.HARD,
  enableTypeValidation: true,
  autoUnsubscribe:      true,
  isReadonly:           false,
  allowEmptySchema:     true,
};

/**
 * Sync-Implementation is bashed on:
 * https://github.com/vuejs/vuefire/blob/master/packages/vuexfire/src/index.js
 *
 */
var GenericStore = function GenericStore( templatePath, modelDefinition, options ) {
  if ( options === void 0 ) options = {};


  // TODO: Parse templatePath for "[DBName]:", set LOCAL_PATH_PREFIX

  options = Object.assign( {}, defaultStoreOptions, options );

  if ( modelDefinition && ( modelDefinition.abstract_store || options.isAbstract ) ) {
    this.isAbstract = true;

    this.templatePath = templatePath;
    this.modelDefinition = modelDefinition;
    this.definedProps = {};
    this.name = 'unnamed abstract';
  } else {
    this.isAbstract = false;
    this.name = 'unnamed';

    if ( !templatePath || templatePath.length < 2 ) {
      throw new Error('Invalid template path:' + templatePath )
    }

    if ( templatePath[0] !== '/' ) {
      throw new Error('Template path has to start with /, got: ' + templatePath )
    }

    if ( (templatePath.match(/\*/g) || []).length !== 1 ) {
      throw new Error('Template path must contain exactly one *, got:' + templatePath )
    }

    /*
    let strIsInvalid = !str.match(/^(\/[a-zA-Z_0-9-_$]+)+$/);
    if ( strIsInvalid ) {
      throw new Error('Invalid template string ' + this.PREFIX +
                      ' with options ' + JSON.stringify(options))
    }
    */

    this.isSuffixed = ( templatePath.indexOf('*') !== templatePath.length - 1 );
    // this.isSuffixed = this.path.substr(-1) !== '*';

    if ( isFunction( options.uidMethod ) ) {
      this.uidMethod = UIDMethod.CUSTOM;
      this.uidMethodCallback = options.uidMethod;
    } else {
      this.uidMethod = options.uidMethod || UIDMethod.PUSHID;
    }
    this.additionalProps = options.additionalProps || [];

    this.defaultDeleteMode = options.defaultDeleteMode;
  }

  this.enableTypeValidation = options.enableTypeValidation;
  this.autoUnsubscribe = options.autoUnsubscribe;
  this.allowEmptySchema = options.allowEmptySchema;

  this.isReadonly = options.isReadonly;
  this.templatePath = templatePath;
  this.modelDefinition = modelDefinition;
  // this.path = templatePath;
  this.definedProps = {};
  this._localDB = null;
  this._clones = [];

  this.global_store_path_array = [];
  if ( !this.isSuffixed ) {
    this.global_store_path = '';
  }

  if ( this.isAbstract) {

    // Only execute mixin inits, but don't attach methods
    Object.assign(this, {
      _read_mixin_init: ReadMixin._read_mixin_init,
      _write_mixin_init: WriteMixin._write_mixin_init
    });
    this._read_mixin_init();
    this._write_mixin_init();

  } else {
    {
      Object.assign(this, ReadMixin);
      this._read_mixin_init();
    }

    if (  !this.isReadonly ) {
      Object.assign(this, WriteMixin);
      this._write_mixin_init();
    }
  }

  // delete this._read_mixin_init
  // delete this._write_mixin_init
};

var prototypeAccessors$2 = { _db: { configurable: true },defaultUserId: { configurable: true },path: { configurable: true },parentRef: { configurable: true },rootRef: { configurable: true },_template_path_field_names: { configurable: true },schemaFields: { configurable: true },schemaRequiredFields: { configurable: true },schemaOptionalFields: { configurable: true },schemaAllFields: { configurable: true },_last_caller: { configurable: true },rules: { configurable: true } };
var staticAccessors = { defaultUserId: { configurable: true } };

/**
 * _clone -
 */
GenericStore.prototype._clone = function _clone () {
  // INFO: Here we could easly make a copy of items that are meant to be
  // singletons (like caches)

  // INFO: This will evaluate all getters!

  // (all static getters from model definition -> fixed)
  // - Only because they are not in the prototype
  // get _db
  // get _template_path_field_names
  // get schemaFields
  // get path
  // get parentRef
  // get rootRef
  // get schemaRequiredFields
  // get schemaOptionalFields
  // get schemaAllFields
  // get subscriptions
  // get rules

  // CAREFUL: $store inside getters will still point to old instance!

  var prototype = Object.getPrototypeOf( this );
  var instance = Object.create( prototype );
  var clone = Object.assign( instance, this );
  var REDEFINE_ACTIONS_AFTER_CLONE = true;

  {
    delete clone.getters;
    delete clone._vm; // !!!
    clone._read_mixin_init();
  }

  if ( !this.isReadonly && REDEFINE_ACTIONS_AFTER_CLONE ) {
    clone._write_mixin_init(true);
  }

  // Keep track of clones
  clone._clones = [];
  this._clones.push(clone);

  return clone
};

/**
 * setName - Set stores name
 */
GenericStore.prototype.setName = function setName ( name ) {
  this.name = name;
};

/**
 * _get_uid - Generates a new unique identifier based on the selected method in the constructor
 * @returns Unique ID
 */
 // TODO: Public, uid -> id
GenericStore.prototype.generateId = function generateId () { return this._get_uid() };

GenericStore.prototype._get_uid = function _get_uid () {
  switch ( this.uidMethod ) {
    case UIDMethod.SLUGID:
      return slugid.nice();

    case UIDMethod.PUSHID:
      // var ref = this.parentRef;
      var ref = this.rootRef;
      // Generate a reference to a new location and add some data using push()
      var newItemRef = ref.push();
      // Get the unique key generated by push()
      return newItemRef.key;
      // return this.ref.push().key;

    case UIDMethod.TIMESTAMP:
      return _firebase.database.ServerValue.TIMESTAMP;

    case UIDMethod.LOCAL_TIMESTAMP:
      return moment.currentTime().unix();

    case UIDMethod.DATE:
      /* !!! This is the local time, not the server time !!! */
      return moment.currentDate().format('DD-MM-YYYY');

    case UIDMethod.OTHER_USER_ID:
      throw new Error('Please provide id through id override')

    case UIDMethod.MY_USER_ID:
      if ( !GenericStore.defaultUserId ) {
        throw new Error('User ID is not set, but a store uses USER_ID as key')
      }
      return GenericStore.defaultUserId;

    case UIDMethod.ARRAY:
      return 0; // TODO

    case UIDMethod.EMAIL:
      // TODO: let email = atob(key)
      // TODO: let key = btoa(email)
      throw new Error('Only email addresses allowed as key')

    case UIDMethod.CUSTOM: {
      var customId = this.uidMethodCallback( this.definedProps );
      if ( !customId ) {
        throw new Error( 'An ID was not defined. Check custom UID Callback.' );
      }
      return customId
    }

    default: throw new Error('Unknown UID Method: ' + this.uidMethod)
  }
};

/**
 * Set defaults
 */
GenericStore.setDefault = function setDefault (key, value) {
  defaultStoreOptions[ key ] = value;
};

/**
 * @static setDefaultDB - Sets the default DB
 *
 * @param{type} db description
 */
GenericStore.setDefaultDB = function setDefaultDB ( db ) {
  defaultDB = db;
};

/**
 * get _db - Get reference to db (this will allow other then default databases in the future)
 *
 * @return {type}Firebase.db
 */
prototypeAccessors$2._db.get = function () {
  return this._localDB || defaultDB;
};

/**
 * _validate_id - Checks if a given id is valid
 *
 * @return {type}  true or false
 */
GenericStore.prototype._validate_id = function _validate_id ( id ) {
  if ( this.uidMethod === UIDMethod.SLUGID ) {
    if ( !isValidId(id) ) {
      return false;
    }
  }
  if ( id === -1 || !id ) {
    return false;
  }
  return true;
};

/**
 * _define_user - Define user (userId/uid) based on default value
 */
GenericStore.prototype._define_user = function _define_user () {
  if ( GenericStore.defaultUserId ) {
    this.definedProps[ 'uid' ] = GenericStore.defaultUserId;
  }
};

/**
 * @static get - Returns the default default UserId for all stores
 *
 * @return {type}description
 */
staticAccessors.defaultUserId.get = function () { return genericStoreGlobalState.userId; };

/* Non static version */
prototypeAccessors$2.defaultUserId.get = function () { return genericStoreGlobalState.userId; };

/**
 * @static set - Set the default default UserId for all all stores
 *
 * @param{type} id description
 * @return {type}  description
 */
staticAccessors.defaultUserId.set = function (id) {

  // TODO: Throw error if called before Vue.use(heliosRX)

  /* When changing the user id we have to DELETE the 'uid' prop,
     otherwise the user uid will be stored in definedProps,
     and is still used. This is especially dangerous in Cloud Functions,
     since a call of most GenericStore methods will define uid.
     The next call of the CF will then still remember the old user,
     even when setting a new user with setDefaultUser(). This will happen
     for all paths that look like /user/{uid}/etc */

  /* INFO: In the future this should be refactored to be completly stateless! */

  info(INFO_STORE, "settings default user id to: uid =", id);
  _Vue$1.set( genericStoreGlobalState, 'userId', id);
  // _userId = id;
};

/**
 *
 *
 */
GenericStore.resetState = function resetState () {
  // genericStoreGlobalState.reset();
  info(INFO_STORE, "reset state");
  _Vue$1.set( genericStoreGlobalState, 'userId', null);
};

/**
 * get path - Returns a firebase reference based on the template string
 * Automatically sets user if not defined
 */
prototypeAccessors$2.path.get = function () { // TODO: rename this to path and this.path to this.uninterpolatedPath

  if ( !( 'uid' in this.definedProps ) ) {
    this._define_user();
  }

  var path = parseTpl(this.templatePath, this.definedProps);

  var undefinedFields = analyzeTpl( path );

  if ( undefinedFields.length > 0 ) { // this might be ok in some cases?
    throw new Error('Not all template id\'s are defined. Required fields are ' + undefinedFields.join(', '))
  }

  /* remove * if it is the last character, otherwise replace * by {id} so it
     can be interpolated by this.define. */
  /*
  if ( !this.isSuffixed) {
    return path.slice(0, -1)
  } else {
    return path.replace(/\*----/, '{id}')
  }*/

  return path.replace(/\*/g, '{id}')
};

/**
 * previewPath - Generate a path preview for a given it
 *
 * @param{type} id description
 */
GenericStore.prototype.previewPath = function previewPath ( id ) {

  // TODO: Should this be called during preview?
  if ( !( 'uid' in this.definedProps ) ) {
    this._define_user();
  }

  var path = parseTpl(this.templatePath, this.definedProps);
  if ( id ) {
    path = path.replace(/\*/g, id);
  } else {
    path = path.replace(/\*/, '{id}');
  }
  return path;
};

/**
 * childRef(id) - Returns reference to a specific child of the collection
 */
GenericStore.prototype.childRef = function childRef (id) {
  /* replace {id} with id */
  return this._db.ref( this.path.replace(/\{id\}/g, id) );
};

/**
 * get parentRef - Returns reference to collection that contains all items
 */
prototypeAccessors$2.parentRef.get = function () {
  /* get string before {id} */
  return this._db.ref( this.path.split('{id}').shift() );
  // return this._db.ref( this.path ).parent < should work too?
};

/**
 * get rootRef - Return reference to root of database
 */
prototypeAccessors$2.rootRef.get = function () {
  return this._db.ref();
};

/**
 * _define - Defines id's in the template string (INTERNAL)
 *
 * @param {GenericStore} target - Target of replacement (usually this)
 * @param {object} props - Id's that should be replaced.
 * @example <caption>Example usage of method1.</caption>
 * task_session_list = new GenericStore('/goal/{goalId}/user_list/{uid}/task_session_list/{taskId}/*', TaskSessionTypeDefinition)
 *
 * task_session_list.define({
 * goalId: 'KrZPg8N6THOisFz_T992Zg',
 * uid: 'l1X8FPc7YtbftlC31frciInV3PU2'
 * })
 *
 * @returns {nothing}
 */
GenericStore.prototype.define = function define ( target, props ) {
  /* Merge new props with previous props */
  target.definedProps = Object.assign({}, this.definedProps, props);

  var known_field_names = [].concat( this._template_path_field_names, this.additionalProps );
  for ( var prop in props ) {
    if ( !known_field_names.includes( prop ) ) {
      warn(WARNING_DEFINE_UNKNOWN_PROP, "Prop", prop, "not found in template path. Known fields are", known_field_names);
    }
  }
  return target; // Allow chaining
};

GenericStore.prototype.with = function with$1 ( props ) {
  // Synax: store.with({ prop1: 'value' }).add({...}) - store is not mutated
  var new_this = this._clone();
  return this.define( new_this, props );
};

/**
 * get _template_path_field_names - Returns all fields in the template path that need to be defined
 *
 * @return {type}description
 */
prototypeAccessors$2._template_path_field_names.get = function () {
  var known_field_names = analyzeTpl( this.templatePath );
  return known_field_names;
};

/**
 * Resets the template path to it's initial state, without substitutions.
 */
GenericStore.prototype.reset = function reset (level) {
    if ( level === void 0 ) level = 1;

  if ( level === 1 ) {
    trace(INFO_STORE, "resetting", this.name, "with", this._clones.length, "clones");
  }

  // info(INFO_STORE, "RESET ", level, ":", this.name, " -> Found", this._clones.length, "clones")
  this.definedProps = {};
  if ( level > 3 ) {
    warn(WARNING_RESET_MAX_DEPTH, "RESET - Stop at recursion level 3", this._clones);
    return
  }
  this._clones.forEach(function (clone) {
    clone.reset( level + 1 );
  });
};

/**
 *
 */
prototypeAccessors$2.schemaFields.get = function () {
  var schema = ( ( this.modelDefinition || {} ).schema || {} ).fields;
  if ( typeof schema === 'undefined' ) {
    return [];
  }
  if ( !Array.isArray( schema ) ) {
    schema = Object.keys(schema).map(function (key) {
      return Object.assign({}, {model: key}, schema[key])
    });
  }
  return schema;
};

/**
 * get schemaOptionalFields - Returns all required fields defined in the schema
 *
 * @return {type}description
 */
prototypeAccessors$2.schemaRequiredFields.get = function () {
  return this.schemaFields
        .filter( function (field) { return field.required; } )
        .map( function (field) { return field.model; } );
};

/**
 * get schemaOptionalFields - Returns all optional fields defined in the schema
 *
 * @return {type}description
 */
prototypeAccessors$2.schemaOptionalFields.get = function () {
  return this.schemaFields
        .filter( function (field) { return !( field.required || false ); })
        .map( function (field) { return field.model; } );
};

/**
 * get schemaAllFields - Returns all fields that are defined in the schema
 *
 * @return {type}description
 */
prototypeAccessors$2.schemaAllFields.get = function () {
  return this.schemaFields.map( function (field) { return field.model; } );
};

/**
 * _check_required_fields - Check if all required fields exists according to schema
 *
 * @param{type} data data to check
 */
GenericStore.prototype._check_required_fields = function _check_required_fields ( data ) {
  this.schemaRequiredFields.forEach(function (required_field) {
    if ( !( required_field in data ) ) {
      throw new Error('Required field <' + required_field + '> not present.')
    }
  });
};

/**
 * _check_required_fields - Check if create inputs are present
 *                        Required by user is not the same a required by DB!
 *
 * @param{type} data data to check
 */
GenericStore.prototype._check_required_create_arg = function _check_required_create_arg ( data ) {
  // TODO: Convert object to array
  var schema = ( ( this.modelDefinition || {} ).schema || {} );
  (schema.create_required || []).forEach(function (required_create_arg) {
    if ( !( required_create_arg in data )) {
      throw new Error('Required create argument <' + required_create_arg + '> not present.')
    }
  });
};

/**
 * _validate_schema - Validates against the current schema
 *
 * @param{type} data    data to validate
 * @param{type} is_update is the data used for updating and existing item?
 */
GenericStore.prototype._validate_schema = function _validate_schema ( data, is_update ) {
    var this$1 = this;


  if ( this.modelDefinition
    && this.modelDefinition.schema
    && this.modelDefinition.schema.unsafe_disable_validation ) {
    return;
  }

  var schema = this.schemaFields;

  if ( !this.allowEmptySchema ) {
    if ( !schema || schema.length === 0 ) {
      throw new Error('No schema found for "' + this.name + '", please provide one.')
    }
  }

  /* Check 1: Are required fields present (Disabled for updates) */
  if ( !is_update ) {
    this._check_required_fields( data );
    /*
    schema.fields.forEach(required_field => {
      if ( ( required_field.required || false ) && !( required_field.model in data ) ) {
        throw new Error('Required field <' + required_field.model + '> not present.')
      }
    });
    */
  }

  // This is a ES2018 feature that buble won't compile
  // const mapRegex = /Map\s*<(?<key>\w+),\s*(?<val>\w+)>/i;
  // const typeRegex = /(?<val>\w+)\s*\[\]/;

  // Regexes to match special bolt types
  var mapRegex = /Map\s*<(\w+),\s*(\w+)>/i;
  var typeRegex = /(\w+)\s*\[\]/;

  /* Check 2: Are provided fields within schema? */
  var allowed_field_names = this.schemaAllFields;
  var allowed_field_regex = [];
  var allowed_field_map = {};

  if ( schema.length === 0 ) {
    warn(WARNING_EMPTY_SCHEMA, 'Schema for "' + this.name + '" is empty.');
  } else {
    allowed_field_map = Object.assign.apply(Object, allowed_field_names.map(function (k, i) {
        var obj;

      if ( k.startsWith('/') && k.endsWith('/') ) {
        allowed_field_regex.push( k );
      }
      return ( obj = {}, obj[k] = this$1.schemaFields[i], obj )
    }));

    Object.keys(allowed_field_map).forEach(function (key, i) {

      var type = allowed_field_map[ key ].type || '';

      if ( mapRegex.test( type ) ) {
        // See: https://github.com/firebase/firebase-js-sdk/blob/master/packages/database/src/core/util/validation.ts
        var regex = "/^" + key + "\\/((?![\\/\\[\\]\\.\\#\\$\\/\\u0000-\\u001F\\u007F]).)*$/";
        allowed_field_regex.push( regex );
        allowed_field_map[ regex ] = this$1.schemaFields[i];
      }
    });
  }

  // TODO: Cache everything above this point

  Object.keys( data ).forEach(function (key) {

    var matchedRegex = allowed_field_regex.find(function (regex) {
      var flags = regex.includes('\\u00') ? '' : 'u'; // Unicode
      var rx = new RegExp( regex.substring( 1, regex.length - 1 ), flags );
      return rx.test( key )
    });

    if ( !matchedRegex && !allowed_field_names.includes(key) ) {
      throw new Error('Field <' + key + '> is not allowed by schema.')
    }

    /* Check 3: Execute validator if present */
    var field = allowed_field_map[ matchedRegex || key ]; // Remove "|| key" ?
    if ( field.validator ) {

      // TODO: Try-catch
      // TODO: see https://vue-generators.gitbook.io/vue-generators/validation/custom-validators
      var result = field.validator(
        /* value */ data[ key ],
        /* field */ field,
        /* model */ null
      );

      if ( !result || ( result.length && result.length === 0 ) ) {
        throw new Error('User-defined schema validation failed for key "' + key + '" with error: ' + result)
      }
    }

    if ( this$1.enableTypeValidation ) {

      // TODO: Also support Generic types (MyTime<A,B>)

      var type_list = (field.type || "").split("|");
      var check = type_list.some(function (typeRaw) {

        var type = typeRaw.trim();
        var typeInfo = {};

        if ( typeRegex.test( type ) ) {
          // typeInfo = typeRegex.exec( type ).groups;
          var match = typeRegex.exec( type );
          typeInfo = { val: match[1] };
          type = 'Array';
        }

        if ( mapRegex.test( type ) ) {
          // typeInfo = mapRegex.exec( type ).groups;
          var match$1 = mapRegex.exec( type );
          typeInfo = { key: match$1[1], val: match$1[2] };
          type = 'Map';
        }

        // For non required fields also allow 'null' as a valid input
        if ( !field.required ) {
          if ( data[ key ] === null ) {
            return true;
          }
        }

        return this$1._validate_bolt_type(
          data[ key ],
          type,
          typeInfo
        );
      });

      if ( !check ) {
        throw new Error('Type-based schema validation failed for key "' + key + '" with error.')
      }
    }
  });
};

/**
 * _validate_bolt_type - Returns true if the value is a valid type of a give type
 *
 * @return {boolean} is value of type 'type'?
 */
GenericStore.prototype._validate_bolt_type = function _validate_bolt_type ( value, type, typeInfo ) {
    var this$1 = this;
    if ( typeInfo === void 0 ) typeInfo = {};

  switch ( type.toLowerCase() ) {
    case 'string':return isString( value );
    case 'number':return isNumeric( value );
    case 'boolean': return isBoolean( value );
    case 'object':return isValue( value ) && isObject( value ) && !isArray( value );
    case 'any':   return isValue( value );
    case 'null':  return value === null;
    case 'map':
      // Map<Key, Value> -> Map + { key, val }
      return isObject( value )
        && !isArray( value )
        && Object.entries( value ).every(function (ref) {
            var k = ref[0];
            var v = ref[1];


          // JS-Array keys are always strings!
          var hasValidKey = isString( k );
          var hasValidValue = this$1._validate_bolt_type( v, typeInfo.val );
          // let hasValidKey = this._validate_bolt_type( k, typeInfo.key );

          return hasValidKey && hasValidValue;
        });
    case 'array': {
      // Type[] = Map<Number, Type>
      var entries = [];
      if ( isArray( value ) ) {
        entries = value;
      } else if ( isObject( value ) ) {
        entries = Object.values( value );
      } else {
        return false;
      }
      return entries.every( function (v) {
        var hasValidType = this$1._validate_bolt_type( v, typeInfo.val );
        return hasValidType;
      });
    }
    default:
      warn(WARNING_UKNONWN_VALIDATION_TYPE, "Can not validate type '" + type + "'");
      return true;
  }
};

/**
 * Set the recent caller, this is trigger by the getter that returns $models.
 * Which means this is called before subscribeList(), when calling it like this:
 * this.$models.myexample.subscribeList()
 *    ^               ^
 *    |               |
 *    +- _set_caller  +- subscribeList is called
 *       is called       and can access this._last_caller
 *
 */
GenericStore._set_caller = function _set_caller ( caller ) {

  // Check, if we got a VueComponent instance
  if ( caller._isVue !== true ) {
    return false;
  }

  recentModelCallerComponent = caller;
};

/**
 * Returns last VueCompoennt that accessed this.$models (see above).
 *
 */
prototypeAccessors$2._last_caller.get = function () {
  return recentModelCallerComponent
};

// ---------------------------------------------------------------------------
/**
 * rules - Return custom validation rules for elements
 * See: https://element.eleme.io/#/en-US/component/form#custom-validation-rules
 */
prototypeAccessors$2.rules.get = function () {
  var schema = this.modelDefinition.schema.fields;

  if ( !Array.isArray( schema ) ) {
    schema = Object.keys(schema).map(function (key) {
      return Object.assign({}, {model: key}, schema[key])
    });
  }

  var rules = {};
  schema.forEach(function (field) {
    // TODO: Allow multiple rules
    // TODO: Allow UI-rules AND DB-rules
    // TODO: Allow custom message
    // TODO: Allow to set blur
    rules[ field.model ] = [{
      validator: function (rule, value, callback) {
        if ( field.validator( value ) ) {
          callback();
        } else {
          callback(new Error('Invalid input'));
        }
      },
      trigger: 'blur'
    }];
  });
  return rules;
};

Object.defineProperties( GenericStore.prototype, prototypeAccessors$2 );
Object.defineProperties( GenericStore, staticAccessors );

// export default from './GenericStore';
// export const UIDMethod = xUIDMethod;

var obj;

var genericStoreMutations = ( obj = {}, obj[HELIOSRX_INIT_VALUE] = function (state, ref) {
    var path = ref.path;
    var data = ref.data;

    trace(INFO_REGISTRY, '[HELIOSRX_INIT_VALUE]', { path: path, data: data });
    // TODO: will this delete children?

    return walkSetAndMerge( state, path, data )
  }, obj[HELIOSRX_UNSET_VALUE] = function (state, ref) {
    var path = ref.path;

    trace(INFO_REGISTRY, '[HELIOSRX_UNSET_VALUE]', { path: path });

    return walkSetAndMerge( state, path, { '.value': null } )
  }, obj[HELIOSRX_ARRAY_ADD] = function (state, ref) {
    var target = ref.target;
    var newId = ref.newId;
    var data = ref.data;

    trace(INFO_REGISTRY, '[HELIOSRX_ARRAY_ADD]', { target: target, newId: newId, data: data });
    _Vue.set( target, newId, data );
  }, obj[HELIOSRX_ARRAY_REMOVE] = function (state, ref) {
    var target = ref.target;
    var oldId = ref.oldId;

    trace(INFO_REGISTRY, '[HELIOSRX_ARRAY_REMOVE]', { target: target, oldId: oldId });
    _Vue.delete( target, oldId );
  }, obj[HELIOSRX_ARRAY_SET] = function (state, ref) {
    var target = ref.target;
    var currentId = ref.currentId;
    var data = ref.data;
    var performMerge = ref.performMerge; if ( performMerge === void 0 ) performMerge = false;

    if (target[ currentId ]) {
      deepMergeVue( target[ currentId ], data, !performMerge );
    } else {
      target[ currentId ] = data;
    }
  }, obj[HELIOSRX_SET] = function (state, ref) {
    var target = ref.target;
    var data = ref.data;
    var performMerge = ref.performMerge; if ( performMerge === void 0 ) performMerge = false;

    trace(INFO_REGISTRY, '[HELIOSRX_SET]', { target: target, data: data, performMerge: performMerge });
    deepMergeVue( target, data, !performMerge );
  }, obj );

// import createPersistedState from 'vuex-persistedstate'
// import { ENABLE_PERSISTENT_REGISTRY } from '@/features'
// TODO: Replace vuex store with vue instance - maybe

var registryModule = {
  strict: true,
  // plugins: /* ENABLE_PERSISTENT_REGISTRY ? [ createPersistedState() ] : */ [],
  state: {
    initialized: false,
    res: {},
    sync: {},
    ready: {}
    // index: {},
  },
  getters: {
    get_registry_entry: function (state) { return function (name) {
      return state.sync[ name ];
    }; },
    is_ready: function (state) { return function (name) {
      return state.ready[ name ] || false;
    }; },
  },
  mutations: Object.assign({}, genericStoreMutations,

    // TODO: Refactor (ready mutations)

    {INIT_REGISTRY: function INIT_REGISTRY(state) {
      state.initialized = true;
    },

    RESET_REGISTRY: function RESET_REGISTRY(state) {
      trace(INFO_REGISTRY, 'RESET_REGISTRY');
      // Callend on logout
      _Vue.set( state, 'sync',  {});
      _Vue.set( state, 'res',   {});
      _Vue.set( state, 'ready', {});
      state.initialized = false;
    },

    ADD_ENTRY: function ADD_ENTRY(state, ref) {
      var name = ref.name;
      var data = ref.data;

      trace(INFO_REGISTRY, 'ADD_ENTRY');
      if (!state.sync[name] || state.sync[name] !== data) {
        _Vue.set( state.sync, name, data );
      }
    },

    SET_ENTRY_STATUS: function SET_ENTRY_STATUS( state, ref ) {
      var name = ref.name;
      var value = ref.value;

      trace(INFO_REGISTRY, 'SET_ENTRY_STATUS');
      if (!state.sync[ name ][status] || state.sync[ name ][status] !== value) {
        _Vue.set(state.sync[ name ], 'status', value);
      }
    },

    SET_GLOBAL_READY_STATE: function SET_GLOBAL_READY_STATE( state, ref ) {
      var name = ref.name;
      var value = ref.value;

      trace(INFO_REGISTRY, 'SET_GLOBAL_READY_STATE');
      if (!state.ready[name] || state.ready[name] !== !!value) {
        _Vue.set(state.ready, name, !!value);
      }
    },

    REM_GLOBAL_READY_STATE: function REM_GLOBAL_READY_STATE( state, ref ) {
      var name = ref.name;

      trace(INFO_REGISTRY, 'REM_GLOBAL_READY_STATE');
      _Vue.delete(state.ready, name);
    }}),
};

function setup$2( name ) {
  registryModule.name = name;
  registryModule.namespaced = true;
  // TODO: state as function
  return registryModule;
}

// import registrySetup from './registry/setup.js'
// import api from './api/index.js'

var _Vue$2; // bind on install ( --> MOVE)

function install (Vue, options) {

  if (install.installed && _Vue$2 === Vue) { return }
  install.installed = true;

  info(INFO_COMMON, "Installing Generic API plugin");

  if ( !options ) {
    throw new Error('heliosRX: Missing configuration. Did you supply config with Vue.use("heliosRx", {...})?')
  }

  if ( !options.db ) {
    throw new Error('heliosRX: Missing configuration "db".')
  }

  if ( !options.models ) {
    throw new Error('heliosRX: Missing configuration "models".')
  }

  _Vue$2 = Vue;
  setup({
    Vue: Vue,
    models: options.models,
    db:     options.db,
  });

  // Configure database
  var dbConfig = options.db;
  // Checking dbConfig.constructor.name === 'Database' won't work in production
  // Setup generic store
  setup$1({
    Vue: Vue,
    firebase: options.firebase || options.db.app.firebase_ // HACK: Figure out from rtdb
  });

  if ( dbConfig.app && dbConfig.app.database ) {
    GenericStore.setDefaultDB( options.db ); // TODO: Move to 'storeSetup'?
  } else if ( typeof dbConfig === 'object' ) {
    throw new Error('heliosRX: Multi-DB configuration not implemented yet.')
  } else {
    throw new Error('heliosRX: Invalid configuration for db.')
  }

  // Setup registry
  var _registry;
  if ( !options.useExistingStore ) {
    // TODO: Get vue from option or from vue instance?

    (Vue._installedPlugins || []).forEach(function (plugin) {
      if ( plugin.Store && plugin.mapActions ) {
         warn(WARNING_COMMON, "Existing Vuex detected. Consider using 'useExistingStore'. See heliosRX documentation.");
      }
    });

    Vue.use( _Vuex );
    _registry = new _Vuex.Store( setup$2( 'heliosRX' ) );
    setup({ Vuex: _Vuex, registry: _registry });

    // Initialize registry
    _registry.commit('INIT_REGISTRY'); // TODO: module/INIT_REGISTRY
  } else {

    var store = options.useExistingStore;
    store.registerModule('heliosrx', setup$2( 'heliosRX' ));
    setup({ Vuex: _Vuex, registry: store });

    throw new Error('heliosRX: Custom state management not fully implemented.')
    // TODO: Fix mutations
  }

  // Define $models
  Object.defineProperty(Vue.prototype, '$models', {
    get: function get () {
      GenericStore._set_caller( this );
      return options.models
    }
  });

  // Merge user api with helios API
  // let mergedApi = api;
  var mergedApi = {};
  if ( options.userApi ) {
    // mergedApi = Object.assign({}, api, options.userApi);
    mergedApi = options.userApi;
  }

  // Define $api
  Object.defineProperty(Vue.prototype, '$api', {
    get: function get () { return mergedApi }
  });

  // TODO: Also allow to set trace / warnings
  if ( options.devMode ) {
    loglevel.setDefaultLevel('info');
    loglevel.setLevel('info');
    loglevel.getLogger( INFO_STORE_WRITE ).setLevel('trace');
  } else {
    loglevel.setDefaultLevel('warn');
    loglevel.setLevel('warn');
  }

  // Expose everything to developer console
  var isDevEnvironment = process.env.VUE_APP_PRODUCTION === 'false' && process.browser;
  if ( options.devMode === true
  || ( options.devMode === undefined && isDevEnvironment ) ) {
    window.$models = options.models;
    window.$db = options.db;
    window.$api = mergedApi;
    window.$registry = _registry;
  }
}

function setDefaultDB(db) {
  GenericStore.setDefaultDB(db);
}

function setDefaultUser(id) {
  if ( GenericStore.defaultUserId !== null ) {
    throw new Error('Call resetGenericStores before setting the default user id')
  }
  GenericStore.defaultUserId = id;
}

function resetGenericStores( unsubscribe ) {
  if ( unsubscribe === void 0 ) unsubscribe = true;


  GenericStore.resetState();
  // GenericStore.defaultUserId = null;

  // const stores = ModelRegistry.getAllStores();
  var stores = _models;

  var loop = function ( key ) {

    // if ( key === '_prototype' ) {
    //   continue
    // }

    var model = stores[ key ];
    var sublist = model.subscriptions;

    /* reset models */
    model.reset();

    /* unsubscribe */
    if ( unsubscribe && sublist ) {
      Object.keys(sublist).forEach(function (sub) {
        var callback = sublist[ sub ];
        info(INFO_COMMON, "Calling unsubscribe for", key, ":", sub);
        callback();
      });
    }
  };

  for ( var key in stores ) loop( key );
}

/* Usage:
let client_env = functions.config().client_env;
let config = {
  apiKey:             client_env.firebase_api_key,
  authDomain:         client_env.firebase_auth_domain,
  databaseURL:        client_env.firebase_database_url,
  projectId:          client_env.firebase_project_id,
  storageBucket:      client_env.firebase_storage_bucket,
  messagingSenderId:  client_env.firebase_messaging_sender_id
}

heliosRX.setup({
  firebaseConfig: config,
  runAsUser: false,
  models: { ... },
})
*/

function setupNode( options ) {

  /*
  options.runAsUser: false | null | <String>,
  options.firebaseConfig: null | <FirebaseApp>,

  options.firebase
  options.devMode
  */

  // eslint-disable-next-line import/no-unresolved
  var admin = options.firebaseAdmin; // require('firebase-admin');

  // eslint-disable-next-line import/no-unresolved
  var Vue = options.Vue || _Vue;

  // eslint-disable-next-line import/no-unresolved
  var Vuex = options.Vuex || _Vuex;

  var usingLocalEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

  if ( options.runAsUser ) {
    if ( usingLocalEmulator ) {
      info(INFO_COMMON, "[initializeApp]", "with default config", process.env.FIREBASE_CONFIG);
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      // Test config with:
      admin.initializeApp();
    }
  } else {

    // TODO: Scope admin user to regular service user -> "support user"
    //       https://firebase.googleblog.com/2019/03/firebase-security-rules-admin-sdk-tips.html

    // INFO: This is the same as the env variable CLOUD_RUNTIME_CONFIG,
    //       which is only configured on host machine, not in local emulator!

    var config = options.firebaseConfig;

    info(INFO_COMMON, "[initializeApp]", "config", config);
    admin.initializeApp(config);
  }

  // Set default DB for generic API
  var defaultDb = admin.database();
  setDefaultDB( defaultDb );

  setup({
    Vue: Vue,
    models: options.models,
    db:     defaultDb,
  });

  setup$1({
    Vue: Vue,
    firebase: admin
  });

  if ( Vue && Vuex ) {
    Vue.use( Vuex );
    var _registry = new Vuex.Store( setup$2( 'heliosRX' ) );
    setup({ Vuex: Vuex, registry: _registry });

    // Initialize registry
    _registry.commit('INIT_REGISTRY');
  }

  /*
  // Merge user api with helios API
  let mergedApi = {};
  if ( options.userApi ) {
    mergedApi = options.userApi;
  }

  // Define $api
  Object.defineProperty(Vue.prototype, '$api', {
    get () { return mergedApi }
  })
  */

  // Setup heliosRX without Vue?
  // install( options.Vue, options )
}

var version = '0.2.4';

var heliosRX = function heliosRX () {};

heliosRX.install = function install () {};

heliosRX.setup = function setup ( options ) {
  setupNode(options);
  return heliosRX;
};

heliosRX.install = install;
heliosRX.getRegistry = getRegistry;
heliosRX.GenericStore = GenericStore;
heliosRX.version = version;

loglevel.channels = loggerChannel;

export default heliosRX;
export { DeleteMode, GenericStore, UIDMethod, getRegistry, loglevel as heliosLogger, moment, setup$2 as registryModule, resetGenericStores, setDefaultDB, setDefaultUser, version };

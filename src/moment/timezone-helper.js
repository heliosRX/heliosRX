import moment from './moment-enhanced.js';

export const convert_timezoneNeutral_to_qualifiedMomentObj = (momentObj, userTimezone) => {

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

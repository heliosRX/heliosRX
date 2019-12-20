import moment from 'heliosrx/src/moment'

export function guess_timezone() {
  if ( process.browser ) {
    return moment.tz.guess()
  } else {
    return "Europe/Berlin"
  }
}

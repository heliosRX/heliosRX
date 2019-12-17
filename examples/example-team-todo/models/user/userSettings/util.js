import moment from '@/moment-gp'

export function guess_timezone() {
  if ( process.browser ) {
    return moment.tz.guess()
  } else {
    return "Europe/Berlin"
  }
}

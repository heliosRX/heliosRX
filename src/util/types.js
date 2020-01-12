export function isValidDate(dateString) {
  // TODO: move to moment or wrap moment
  console.warn("[DEPRECATED] isValidDate");
  let minDate = new Date('1970-01-01 00:00:01');
  let maxDate = new Date('2038-01-19 03:14:07');
  let date = new Date(dateString);
  return date > minDate && date < maxDate;
}

export function isValidId( id ) {
  // length slugid = 22, length pushid = 20
  return this.isString( id ) && id.length && id.length >= 20;
}

export function isString (obj) {
  return (Object.prototype.toString.call(obj) === '[object String]');
}

export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function isValue(v) {
  return /* !isNaN(v) && */ v !== undefined && v !== null
}

export function isTimestamp(ts) {
  /* Could be further improved */
  return this.isNumeric(ts);
}

export function isFunction(f) {
  return (typeof f === "function");
}

export function isObject(o) {
  return typeof o === 'object' && o !== null;
}

export function isArray(a) {
  return Array.isArray( a );
}

export function matchUserInputDuration(str) {
  return null // TODO
}
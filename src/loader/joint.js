/**
 * Joint for joining more than 2 functions.
 * Joins an array of functions together to return a single function
 *
 * Source: https://github.com/Dayjo/joint
 *
 * @param  {array} a An array of functions
 * @return {function} Returns a function which is an accumilation of functions in 'a'
 */
export default function joint( a ) {
  var b = a[(a.length - 1)];
  a.pop();

  a = a.length > 1 ? joint( a ) : a[0];

  return function(...args) {
    // eslint-disable-next-line
    // b.apply( new a(...args), args );
    /*
    // args is object
    var ra = a(args)
    var rb = b(args)
    return Object.assign(args, ra, rb)
    */
    var ra = a(...args)
    var rb = b(...args) // can overwrite result from a
    return Object.assign(ra || {}, rb)
  };
}

/* Same as joint but also supports one element.
 */
export function joint_safe( a ) {
  if ( a.length === 1 ) {
    return a[0];
  }

  return joint(a);
}

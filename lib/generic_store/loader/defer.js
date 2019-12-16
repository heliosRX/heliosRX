/* Defines a promise that can be resolved outside of it's scope
*
* Usage:
* let d = defer()
* d.then((x) => console.log('Hello World', x))
* d.resolve(123)
* Output > Hello World 123
*/
// See: http://lea.verou.me/2016/12/resolve-promises-externally-with-this-one-weird-trick/
export default function defer() {
  var res, rej;

  var promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  promise.resolve = res;
  promise.reject = rej;

  return promise;
}

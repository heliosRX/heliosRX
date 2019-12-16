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
function get(path, obj, fb = `{${path}}`) {
  return path.split('.').reduce((res, key) => res[key] || fb, obj);
}

export function parseTpl(template, map, fallback) {
  // return template.replace(/\$\{.+?}/g, (match) => {
  return template.replace(/\{.+?}/g, (match) => {
    // console.log("match", match);
    // const path = match.substr(2, match.length - 3).trim();
    const path = match.substr(1, match.length - 2).trim();
    // console.log("path", path);
    return get(path, map, fallback);
  });
}

/* Example:
  analyzeTpl(parseTpl("/test/${test}/${uid}/ABC/${abc}", {abc: 1}))
  (2) ["test", "uid"]
*/

export function analyzeTpl(template) {
  // return template.match(/\$\{.+?}/g).map(match => match.slice(2, -1));
  return ( template.match(/\{.+?}/g) || [] ).map(match => match.slice(1, -1));
}

/*
const template = 'Example text: ${text}';
const result = interpolate(template, { text: 'Foo Boo' });
*/

/* Extend native Array. Not best practive, but at least it's done the
   right way (prototype, non enumerable) */

// TODO: Do not extend native types

let proto = Array.prototype;

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

/**
 * Partitions array in two array depencing on callback result
 *
 */
export function partition(array, isValid) {
  return array.reduce(([ pass, fail ], element) => {
    return isValid( element )
      ? [ [ ...pass, element ], fail ]
      : [ pass, [ ...fail, element ] ];
  }, [ [], [] ]);
}

export function arrayEqual(array1, array2) {
  return array1.length === array2.length
      && array1.sort().every((value, index) => value === array2.sort()[index] );
}

export function arrayDiff( array1, array2 ) {
  return array1.filter(i => array2.indexOf(i) < 0 );
}

export function arrayDiffTwoWay( new_list, old_list ) {
  return {
    removed: arrayDiff( old_list, new_list ),
    added:   arrayDiff( new_list, old_list )
  }
}

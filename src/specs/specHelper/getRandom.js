/* parts of the yjs code require 'getRandom' to be bound to
   the global scope, which is what we do here */

var g
if (typeof global !== 'undefined') {
  g = global
} else if (typeof window !== 'undefined') {
  g = window
} else {
  throw new Error('No global object?')
}
g.g = g

/*
  returns a random element of o.
  works on Object, and Array
*/
function getRandom (o) {
  if (o instanceof Array) {
    return o[Math.floor(Math.random() * o.length)]
  } else if (o.constructor === Object) {
    return o[getRandom(Object.keys(o))]
  }
}
g.getRandom = getRandom
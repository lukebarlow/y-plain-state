import { dispatch } from 'd3-dispatch'
import createProxyTraps from './createProxyTraps'
import uid from './uid'
import YInstance from './YInstance'
import YArray from 'y-array'
import YMap from 'y-map'

/*
This method retrieves the proxy object for a given Y object. The proxy
object allows you to get and set properties according to the normal
javascript syntax. The proxy object is hooked up in a loop with the Y
object, so that getters are reading synchronously from the underlying
native object, but setters are modifying the Y object, and then observers
on the Y object are modifying the underlying native object.
*/

// the proxySymbol is used as a key for referring to the proxy from the Y Object
const PROXY = Symbol('proxy')
const OBSERVED = Symbol('observed')
const FIRE_CHANGE = Symbol('fireChange')

let timeout = null

// simple test for whether it's a Y type - probably a better test exists
function testIsYType (o) {
  return !!((o && o._model && o.os.y))
}

function testIsYArray (o) {
  return testIsYType(o) && 'toArray' in o
}

function testIsYMap (o) {
  return testIsYType(o) && !testIsYArray(o)
}

function getNativeArrayForYArray (yArray, fireChangeAtEndOfThread) {
  const array = yArray.toArray().map((item, i) => {
    // workaround for an issue where yArray.toArray returns undefined
    // for y types
    if (item == undefined) {
      item = yArray.get(i)
    }

    if (testIsYType(item)) {
      let p = getProxyForYObject(item)
      p.observe(() => {
        fireChangeAtEndOfThread()
      })
      return p
    } else {
      return item
    }
  })
  return array
}

function getNativeObjectForYMap (yMap, fireChangeAtEndOfThread) {
  const object = {}
  yMap.keys().forEach((key) => {
    let value = yMap.get(key)
    if (testIsYType(value)) {
      value = getProxyForYObject(value)
      // apply the observer
      value.observe(() => {
        fireChangeAtEndOfThread()
      })
    }
    object[key] = value
  })
  return object
}

function applyMapOp (op, parentObject, value) {
  switch (op.type) {
    case 'add' :
    case 'update' :
      parentObject[op.name] = value
      break
    case 'delete' :
      delete parentObject[op.name]
      break
    default :
      throw new Error('Unrecognised map op ' + op.type)
      break
  }
}

function applyArrayOp (op, parentObject, value) {
  switch (op.type) {
    case 'insert' :
      parentObject.splice(op.index, 0, value)
      break
    case 'delete' :
      parentObject.splice(op.index, 1)
      break
    default :
      throw new Error('Unrecognised array op ' + op.type)
      break
  }
}

/*
  this is the method called when we observe a change on the
  y object. We need to update the contents of the native
  underlying object and fire the change event. If the newly
  set value is a new y object, then we need to set up the proxy
  loop for that also
*/
function createOpHandler (parentObject, isArray, fireChangeAtEndOfThread) {
  return function processOp (op) {
    // workaround. When adding a y type to a map, the op has undefined for
    // the value

    if (['add', 'update'].includes(op.type) && testIsYMap(op.object)) {
      op.value = op.object.get(op.name)
    }

    const value = isArray ? op.values[0] : op.value

    if (value && testIsYType(value)) {
      const childProxy = getProxyForYObject(value)
      if (isArray) {
        applyArrayOp(op, parentObject, childProxy)
      } else {
        applyMapOp(op, parentObject, childProxy)
      }
      fireChangeAtEndOfThread()
      childProxy.observe(() => {
        fireChangeAtEndOfThread()
      })
    } else {
      if (isArray) {
        if (op.values.length > 1) {
          throw new Error('Can currently only handle adding one value to an array at a time')
        }
        applyArrayOp(op, parentObject, op.values[0])
      } else {
        applyMapOp(op, parentObject, op.value)
      }
      fireChangeAtEndOfThread()
    }
    return Promise.resolve(true)
  }
}

function getProxyForYObject (y) {
  // if the proxy already exists then just return it
  if (y[PROXY]) {
    return y[PROXY]
  }

  y[PROXY] = 'PENDING'
  const isArray = testIsYArray(y)

  const dispatcher = dispatch('change', 'syncChange')

  // this method effectively bundles multiple changes into one
  // change event which happens when the current thread
  // has finished executing
  function fireChangeAtEndOfThread () {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(function () {
      timeout = null
      dispatcher.call('change')
    }, 1)
    dispatcher.call('syncChange')
  }

  const o = isArray
    ? getNativeArrayForYArray(y, fireChangeAtEndOfThread)
    : getNativeObjectForYMap(y, fireChangeAtEndOfThread)

  const proxy = new Proxy(o, createProxyTraps(y, fireChangeAtEndOfThread))

  if (!y[OBSERVED]) {
    y.observe(createOpHandler(o, isArray, fireChangeAtEndOfThread))
    y[OBSERVED] = true
  }

  proxy.on = function (type, handler) {
    console.warn("deprecated: use state.observe(handler) instead of state.on('change', handler)")
    dispatcher.on(type + '.' + uid(), handler)
  }

  proxy.observe = function (handler) {
    dispatcher.on('change.' + uid(), handler)
  }

  if (isArray) {
    proxy.shift = function () {
      y.delete(0)
    }
  }

  y[PROXY] = proxy
  return proxy
}

export default getProxyForYObject

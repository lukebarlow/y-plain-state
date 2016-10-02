import Y from 'yjs'
import yMap from 'y-map'
import yArray from 'y-array'
yArray(Y)
yMap(Y)

import { dispatch } from 'd3-dispatch'
import createProxyTraps from './createProxyTraps'
import uid from './uid'

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

function getPromise(yArray, index){
  var result = yArray.get(index)
  if (result && result.then){
    return result
  } else {
    return Promise.resolve(result)
  }
}

// simple test for whether it's a Y type - probably a better test exists
function isYType(o) {
  return (o && o._model) ? true : false
}

function getNativeArrayForYArray(yArray, fireChangeAtEndOfThread) {
  const array = yArray.toArray().map((item, i) => {

    // workaround for an issue where yArray.toArray returns undefined
    // for y types
    if (item == undefined) {
      item = yArray.get(i)
    }

    if (isYType(item)) {
      let p = getProxyForYObject(item)
      p.on('change', () => {
        fireChangeAtEndOfThread()
      })
      return p
    } else {
      return item
    }
  })
  return array
}

function getNativeObjectForYMap(yMap, fireChangeAtEndOfThread) {
  const object = {}
  yMap.keys().forEach((key) => {
    let value = yMap.get(key)
    if (isYType(value)) {
      value = getProxyForYObject(value)
      // apply the observer
      value.on('change', () => {
        fireChangeAtEndOfThread()
      })
    }
    object[key] = value
  })
  return object
}

function applyMapOp(op, parentObject, value) {
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

function applyArrayOp(op, parentObject, value) {
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
function createOpHandler(parentObject, isMap, fireChangeAtEndOfThread){
  
  return function processOp(op){

    // workaround. When adding a y type to a map, the op has undefined for
    // the value
    if (['add', 'update'].includes(op.type) && op.object.constructor.name == 'YMap') {
      op.value = op.object.get(op.name)
    }

    const value = isMap ? op.value : op.values[0]
  
    if (value && ['YMap', 'YArray'].includes(value.constructor.name)){   
      const childProxy = getProxyForYObject(value)
      if (isMap) {
        applyMapOp(op, parentObject, childProxy)
      } else {
        applyArrayOp(op, parentObject, childProxy)
      }
      fireChangeAtEndOfThread()
      childProxy.on('change', () => {
        fireChangeAtEndOfThread()
      })
    } else {
      if (isMap) {
        applyMapOp(op, parentObject, op.value)
      } else {
        if (op.values.length > 1){
          throw new Error('Can currently only handle adding one value to an array at a time')
        }
        applyArrayOp(op, parentObject, op.values[0])
      }
      fireChangeAtEndOfThread()
    }
    return Promise.resolve(true)
  }

}


function getProxyForYObject(y){
  // if the proxy already exists then just return it
  if (y[PROXY]){
    return y[PROXY]
  }

  y[PROXY] = 'PENDING'

  const isMap = y.constructor.name == 'YMap'
  const dispatcher = dispatch('change', 'syncChange')
  let timeout = null

  // this method effectively bundles multiple changes into one
  // change event which happens when the current thread
  // has finished executing
  function fireChangeAtEndOfThread(){
    dispatcher.call('syncChange')
    if (timeout == null){
      timeout = setTimeout(function(){
        timeout = null
        dispatcher.call('change')
      }, 1)
    }
  }

  const o = (isMap ? getNativeObjectForYMap(y, fireChangeAtEndOfThread) :
      getNativeArrayForYArray(y, fireChangeAtEndOfThread) )

  const proxy = new Proxy(o, createProxyTraps(y, fireChangeAtEndOfThread))
  
  if (!y[OBSERVED]){
    y.observe(createOpHandler(o, isMap, fireChangeAtEndOfThread))
    y[OBSERVED] = true
  }
  
  proxy.on = function(type, handler){
    dispatcher.on(type + '.' + uid(), handler)
  }

  if (!isMap) {
    proxy.shift = function() {
      y.delete(0)
    }
  }

  y[PROXY] = proxy
  return proxy
}

export default getProxyForYObject
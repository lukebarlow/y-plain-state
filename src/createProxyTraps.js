import Y from 'yjs'
import getProxyForYObject from './getProxyForYObject'

function beginsWithUnderscore (s) {
  return s.slice(0, 1) == '_'
}

function isReserved (s) {
  return ['on', 'sort', 'shift', 'observe'].indexOf(s) >= 0
}

function isWatchableObject (o) {
  return typeof (o) === 'object' && o != null
}

/*

This function creates the handler object which is a collection of traps
and is used in the creation of the Proxy object

y - the y object which the proxy should mirror
fireChangeAtEndOfThread - the handler which should be called when a
  change is detected

*/
export default function (y, fireChangeAtEndOfThread) {
  const yObjectIsMap = !!y.keys

  return {

    /*
      This 'set' proxy trap only sets values on the accompanying
      y object and not on the native object being proxied. Changes
      to the y object are observed and those changes are then
      applied to to the proxied object.
    */
    set: function (target, key, value) {
      const hidden = typeof (key) === 'symbol' || beginsWithUnderscore(key) || isReserved(key)
      if (hidden) {
        target[key] = value
        Object.defineProperty(target, key, {enumerable: false})
        return true
      }

      const changed = (target[key] != value)
      const alreadyExisted = key in target
      const watchable = isWatchableObject(value)

      const doingArrayPush = !yObjectIsMap && y.length == key
      const convertValueToY = watchable && !hidden

      // the child object being set is
      if (convertValueToY) {
        const childIsMap = !Array.isArray(value)
        const childConstructor = childIsMap ? Y.Map : Y.Array

        // first set the child object, according to the type of the
        // child and the type of the parent ...
        if (yObjectIsMap) {
          y.set(key, childConstructor)
        } else {
          key = parseInt(key)
          if (doingArrayPush) {
            y.push([ childConstructor ])
          } else {
            y.delete(key, 1)
            y.insert(key, [ childConstructor ])
          }
        }

        // ... then retrieve and populate the child
        const childY = y.get(key)

        // at this point we are not sure if the childY already has a proxy
        // object on it or not, but luckily getProxyForYObject is idempotent,
        // so will either return the existing proxy or create a new one
        const childProxy = getProxyForYObject(childY)

        // populate the child proxy (which will recursively call this
        // set trap)
        if (childIsMap) {
          for (let childKey of Object.keys(value)) {
            if (!isReserved(childKey)) {
              childProxy[childKey] = value[childKey]
            }
          }
        } else {
          // console.log('populating child array', value)
          value.forEach((item, i) => {
            childProxy[i] = item
          })
        }

        target[key] = childProxy

        // and set up the change handler on the proxy
        // TODO : this needs to be idempotent, so changes are not bubbled
        // up more than once
        childProxy.observe(() => {
          fireChangeAtEndOfThread()
        })
      } else {
        if (yObjectIsMap) {
          y.set(key, value)
        } else {
          key = parseInt(key)
          if (!isNaN(key)) {
            if (doingArrayPush) {
              y.push([value])
            } else {
              y.delete(key, 1)
              y.insert(key, [value])
            }
          }
        }
      }
      return true
    },

    deleteProperty: function (target, key) {
      if (!yObjectIsMap) {
        key = parseInt(key)
      }
      y.delete(key)
      return true
    }

  }
}

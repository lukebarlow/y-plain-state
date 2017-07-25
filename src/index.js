import 'babel-core/register'

import YArray from 'y-array'
import YMap from 'y-map'

import YInstance from './YInstance'
import getProxyForYObject from './getProxyForYObject'

async function extend (Y) {
  YInstance.Y = Y
  Y.extend(YArray, YMap)
  Y.PlainState = function (state) {
    return getProxyForYObject(state)
  }
}

import setDefaults from './setDefaults'

export default extend
export { setDefaults }

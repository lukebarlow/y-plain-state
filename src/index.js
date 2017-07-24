import 'babel-core/register'

import Y from 'yjs'

import getProxyForYObject from './getProxyForYObject'

async function extend (Y) {
  await Y.requestModules(['Array', 'Map'])
  Y.PlainState = function (state) {
    return getProxyForYObject(state)
  }
}

import setDefaults from './setDefaults'

export default extend
export { setDefaults }

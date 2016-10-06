import 'babel-core/register'
import 'babel-polyfill'

import Y from 'yjs'
import YMap from 'y-map'
import YArray from 'y-array'
import YMemory from 'y-memory'
YMap(Y)
YArray(Y)
YMemory(Y)

import getProxyForYObject from './getProxyForYObject'
import yubiquity from './yubiquity'

yubiquity.Y = Y

export { getProxyForYObject }
export default yubiquity
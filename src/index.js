import 'babel-core/register'
//import 'babel-polyfill'

import Y from 'yjs'
import YMap from 'y-map'
import YArray from 'y-array'

Y.extend(YMap, YArray)

import getProxyForYObject from './getProxyForYObject'
import setDefaults from './setDefaults'
import yubiquity from './yubiquity'

yubiquity.Y = Y

export { getProxyForYObject, setDefaults, Y }
export default yubiquity
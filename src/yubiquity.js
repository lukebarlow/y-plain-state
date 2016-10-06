import getProxyForYObject from './getProxyForYObject'

export default async function(config) {
  config.share = { state : 'Map' }
  const y = await Y(config)
  const state = getProxyForYObject(y.share.state)
  // apply the defaults, if present in the config
  if (config.default) {
    for (let key of Object.keys(config.default)){
      if (!(key in state)){
        state[key] = config.default[key]
      }
    }
  }
  return state
}
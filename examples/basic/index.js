import YPlainState from '../../src/index'

import Y from 'yjs'
import YWebsocketsClient from 'y-websockets-client'
import YMemory from 'y-memory'

Y.extend(YWebsocketsClient, YMemory, YPlainState)

function draw (state) {
  var data = document.getElementById('data')
  data.innerHTML = JSON.stringify(state, null, 2)
}

Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client',
    room: 'y-plain-state-examples-basic'
  },
  share: { state: 'Map' }
}).then((y) => {
  const state = Y.PlainState(y.share.state)
  window.state = state // for debugging convenience
  draw(state)
  state.observe(() => {
    draw(state)
  })
})

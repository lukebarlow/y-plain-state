import React from 'react'
import { render } from 'react-dom'
import Jigsaw from './components/Jigsaw'

import { getProxyForYObject, setDefaults, Y } from '../../src/index'

import YWebsocketsClient from 'y-websockets-client'
import YMemory from 'y-memory'

Y.extend(YWebsocketsClient, YMemory)

function draw(state){
  var tracks = state.tracks
  render(
    <Jigsaw state={state} />,
    document.getElementById('main')
  )
}

Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client',
    room: 'yubiquity-examples-jigsaw-4'
  },
  share : { state : 'Map' }
}).then((y) => {
  const state = getProxyForYObject(y.share.state)
  setDefaults(state, {
    piece1 : {translation : {x : 0, y : 0}},
    piece2 : {translation : {x : 0, y : 0}},
    piece3 : {translation : {x : 0, y : 0}},
    piece4 : {translation : {x : 0, y : 0}}
  })

  window.state = state
  draw(state)
  state.on('change', () => {
    draw(state)
  })
})
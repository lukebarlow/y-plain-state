import Y from 'yjs'
import yWebRtc from 'y-webrtc'
import yMemory from 'y-memory'
import yIndexedDb from 'y-indexeddb'
import yWebsocketsClient from 'y-websockets-client'
yWebRtc(Y)
yIndexedDb(Y)
yWebsocketsClient(Y)

import React from 'react'
import { render } from 'react-dom'

import { getProxyForYObject } from '../../src/index'
import Jigsaw from './components/Jigsaw'

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
    //name: 'webrtc',
    name: 'websockets-client',
    room: 'yubiquity-examples-jigsaw-react'
  },
  share: {
    state : 'Map'
  }
}).then((y) => {
  window.yState = y.share.state
  const state = window.state = getProxyForYObject(y.share.state)

  if (!state.piece1) state.piece1 = {translation : {x : 0, y : 0}}
  if (!state.piece2) state.piece2 = {translation : {x : 0, y : 0}}
  if (!state.piece3) state.piece3 = {translation : {x : 0, y : 0}}
  if (!state.piece4) state.piece4 = {translation : {x : 0, y : 0}}

  draw(state)
  state.on('change', () => {
    draw(state)
  })
})
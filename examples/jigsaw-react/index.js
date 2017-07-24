import YPlainState, { setDefaults } from '../../src/index'

import Y from 'yjs'
import YWebsocketsClient from 'y-websockets-client'
import YMemory from 'y-memory'

Y.extend(YWebsocketsClient, YMemory, YPlainState)

import React from 'react'
import { render } from 'react-dom'
import Jigsaw from './components/Jigsaw'

function draw (state) {
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
    room: 'y-plain-state-examples-jigsaw-4'
  },
  share: { state: 'Map' }
}).then((y) => {
  const state = Y.PlainState(y.share.state)
  setDefaults(state, {
    piece1: {translation: {x: 0, y: 0}},
    piece2: {translation: {x: 0, y: 0}},
    piece3: {translation: {x: 0, y: 0}},
    piece4: {translation: {x: 0, y: 0}}
  })

  window.state = state
  draw(state)
  state.observe(() => {
    draw(state)
  })
})

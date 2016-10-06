import yubiquity from '../../src/index'

import YWebsocketsClient from 'y-websockets-client'
YWebsocketsClient(yubiquity.Y)

import React from 'react'
import { render } from 'react-dom'
import Jigsaw from './components/Jigsaw'

function draw(state){
  var tracks = state.tracks
  render(
    <Jigsaw state={state} />,
    document.getElementById('main')
  )
}

yubiquity({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client',
    room: 'yubiquity-examples-jigsaw'
  },
  default: {
    piece1 : {translation : {x : 0, y : 0}},
    piece2 : {translation : {x : 0, y : 0}},
    piece3 : {translation : {x : 0, y : 0}},
    piece4 : {translation : {x : 0, y : 0}}
  }
}).then((state) => {
  window.state = state
  draw(state)
  state.on('change', () => {
    draw(state)
  })
})
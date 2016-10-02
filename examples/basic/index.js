import Y from 'yjs'
import yArray from 'y-array'
import yWebsocketsClient from 'y-websockets-client'
import yWebRtc from 'y-webrtc'
import yMemory from 'y-memory'
import yMap from 'y-map'
import yIndexedDb from 'y-indexeddb'
yArray(Y)
yWebsocketsClient(Y)
yWebRtc(Y)
yMemory(Y)
yMap(Y)
yIndexedDb(Y)


import React from 'react'
import { render } from 'react-dom'
import { getProxyForYObject } from '../../src/index'
import guid from './guid'

function draw(state){
  console.log('doing a draw')
  var data = document.getElementById('data')
  data.innerHTML = JSON.stringify(state, null, 2)
}

var room = window.location.search || 'default'


window.newRoom = function(){
  window.location.search = guid()
  window.location.refresh()
}

window.log = function(){
  if (window.SHOW_LOGGING){
    console.log.apply(null, [window.PAGE].concat(Array.from(arguments)))
  }
}


Y({
  db: {
    name: 'indexeddb'
  },
  connector: {
    name: 'websockets-client',
    //name : 'webrtc',
    url: 'http://localhost:1234',
    room: 'yubiquity-examples-basic2-' + room
  },
  share: {
    state : 'Map'
  }
}).then((y) => {
  window.yState = y.share.state
  const state = window.state = getProxyForYObject(y.share.state)
  draw(state)
  state.on('change', () => {
    draw(state)
  })
})
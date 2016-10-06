import yubiquity from '../../src/index'

import YWebsocketsClient from 'y-websockets-client'
import YWebRtc from 'y-webrtc'
import YMemory from 'y-memory'
import YIndexedDb from 'y-indexeddb'

YWebsocketsClient(yubiquity.Y)
YWebRtc(yubiquity.Y)
YMemory(yubiquity.Y)
YIndexedDb(yubiquity.Y)


import { getProxyForYObject } from '../../src/index'
import guid from './guid'

function draw(state){
  var data = document.getElementById('data')
  data.innerHTML = JSON.stringify(state, null, 2)
}

var search = window.location.search
search = search ? search.slice(1) : null
var room = search || 'default'

var iframe = document.getElementById('iframe')
if (iframe) {
  iframe.setAttribute('src', 'state_only.html?' + room)
}

window.newRoom = function(){
  window.location.search = guid()
  window.location.refresh()
}

yubiquity({
  db: {
    name: 'indexeddb'
  },
  connector: {
    name: 'websockets-client',
    //name : 'webrtc',
    //url: 'http://localhost:1234',
    room: 'yubiquity-examples-basic-' + room
  },
  default : {
    a : 1,
    b : [4, 5, 6]
  }
}).then((state) => {
  window.state = state
  draw(state)
  state.on('change', () => {
    draw(state)
  })
})
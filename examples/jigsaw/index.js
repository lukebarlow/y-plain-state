import Y from 'yjs'
import yWebRtc from 'y-webrtc'
import yMemory from 'y-memory'
import yIndexedDb from 'y-indexeddb'
yWebRtc(Y)
yIndexedDb(Y)

import { select, mouse as d3Mouse } from 'd3-selection'
import { drag as d3Drag } from 'd3-drag'
import 'd3-transition'

import { getProxyForYObject } from '../../src/index'

Y({
  db: {
    name: 'indexeddb'
  },
  connector: {
    name: 'webrtc',
    room: 'yubiquity-examples-jigsaw'
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

  var origin // mouse start position - translation of piece  
  var drag = d3Drag()
    .on('start', function (params) {
      // get the translation of the element
      var translation = select(this).attr('transform').slice(10,-1).split(',').map(Number)
      // mouse coordinates
      var mouse = d3Mouse(this.parentNode)
      origin = {
        x: mouse[0] - translation[0],
        y: mouse[1] - translation[1]
      }
    })
    .on("drag", function(){
      var mouse = d3Mouse(this.parentNode)
      var x = mouse[0] - origin.x // =^= mouse - mouse at dragstart + translation at dragstart
      var y = mouse[1] - origin.y
      select(this).attr("transform", "translate(" + x + "," + y + ")")
    })
    .on('end', function (piece, i) {
      // save the current translation of the puzzle piece
      var mouse = d3Mouse(this.parentNode)
      var x = mouse[0] - origin.x
      var y = mouse[1] - origin.y
      piece.translation.x = x
      piece.translation.y = y
    })

  var data = [state.piece1, state.piece2, state.piece3, state.piece4]
  var pieces = select(document.querySelector("#puzzle-example")).selectAll("path").data(data)

  pieces
    .classed('draggable', true)
    .attr("transform", function (piece) {
      var translation = piece.translation
      return "translate(" + translation.x + "," + translation.y + ")"
    }).call(drag)

  state.on('change', () => {
    // whenever a property of a piece changes, update the translation of the pieces
    pieces
      .transition()
      .attr("transform", function (piece) {
        var translation = piece.translation
        return "translate(" + translation.x + "," + translation.y + ")"
      })
  })


})

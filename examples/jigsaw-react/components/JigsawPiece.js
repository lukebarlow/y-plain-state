import React, { Component, PropTypes } from 'react'
import {DraggableCore} from 'react-draggable';

/*
This is an abstract class. To make specific pieces, extend
this class and implement the _shape method to return
the svg that should be drawn to make the shape
*/
export default class JigsawPiece extends React.Component {

  constructor() {
    super();
    this.drag = this.drag.bind(this);
    this.dragStop = this.dragStop.bind(this);
    this.dragStart = this.dragStart.bind(this);
  }

  _drag (event, ui, isUndoWaypoint) {
    const { position } = this.props
    position.x += ui.position.deltaX
    position.y += ui.position.deltaY
  }

  dragStart (event, ui) {
    this._drag(event, ui, true)
  }

  drag (event, ui) {
    this._drag(event, ui, false)
  }

  dragStop (event, ui) {}

  render() {
    const { x, y } = this.props.position
    return (
      <DraggableCore
        axis="x"
        onStart={this.dragStart}
        onDrag={this.drag} 
        onStop={this.dragStop}
        >
        <g transform={'translate(' + x + ',' + y + ')'}>
          {this._shape()}
        </g>
      </DraggableCore>
    )
  }

}
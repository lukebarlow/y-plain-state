import React, { Component, PropTypes } from 'react'

import Piece1 from './Piece1'
import Piece2 from './Piece2'
import Piece3 from './Piece3'
import Piece4 from './Piece4'

export default ({state}) => (
  <svg id="puzzle-example" width="100%" viewBox="0 0 800 800">
    <Piece1 position={state.piece1.translation}/>
    <Piece2 position={state.piece2.translation} />
    <Piece3 position={state.piece3.translation} />
    <Piece4 position={state.piece4.translation} />
  </svg>
)



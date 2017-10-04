/*
This module creates a singleton object which is used to store
the instance of Y which is passed to y-plain-state when it
first extends Y. So, we use this module internally by doing

// when Y is first extended with YPlainState

import YInstance from './YInstance'
function extend(Y) {
  YInstance.Y = Y
  ...
}

// then when we need a reference to Y

import YInstance from './YInstance'
const Y = YInstance.Y
*/

export default {}

y-plain-state
=============

A plugin for Yjs which allows you to interact with the state as if it were
a plain javascript data structure.

[Demo](https://lukebarlow.github.io/y-plain-state/)

So, instead of doing

```
state.set('key', Y.Array)
var a = state.get('key')
a.push([1, 2, 3])
```

Everything appears just as a normal JavaScript object, and you can do

```
state.a = [1,2,3]
```

Here is a slightly longer example of how you set up and use it (for complete
working examples see the examples directory )


```
import YWebsocketsClient from 'y-websockets-client'
import YMemory from 'y-memory'
import YPlainState from 'y-plain-state'

Y.extend(YWebsocketsClient, YMemory, YPlainState)

Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client'
  },
  default : {
    name : 'my application state',
    data : [5, 7, 2, 12]
  }
}).then((y) => {

  const state = Y.PlainState(y.share.state)

  // state is now something that appears like a normal JavaScript object,
  // but is bound to Yjs and will sync with other connected clients
  state.name = 'new name'
  state.otherData = {
    a : 1,
    b : [1,2,3]
  }
  state.observe(() => {
    redrawUi(state)
  })
})

```

See the [demo](https://lukebarlow.github.io/y-plain-state/) and examples directory for more example apps
yubiquity
=========

Use simple javascript data structures for state, and synchronise them across
browsers.

This library essentially provides an API on top of Yjs objects, so that instead
of doing things like

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
examples see the examples directory )


```
import { getProxyForYObject } from 'yubiquity'

Y({
  db: {
    name: 'indexeddb'
  },
  connector: {
    name: 'websockets-client'
  },
  share: {
    state : 'Map'
  }
}).then((y) => {
  const state = getProxyForYObject(y.share.state)
  // state is now something that appears like a normal JavaScript object,
  // but is bound to Yjs and will sync with other connected clients

  state.name = 'Set a string'
  state.child = {
    a : 1,
    b : [1,2,3]
  }

  state.on('change', () => {
    redrawUi(state) // for example
  })

})

```

See the examples directory for more example apps
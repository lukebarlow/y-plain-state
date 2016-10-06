yubiquity
=========

Use simple javascript data structures for state, and synchronise them across
browsers.

[Demo](https://lukebarlow.github.io/yubiquity/)

This library essentially provides an API on top of [Yjs](http://y-js.org/) objects, so that instead
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
working examples see the examples directory )


```
import yubiquity from 'yubiquity'
import YWebsocketsClient from 'y-websockets-client'
YWebsocketsClient(yubiquity.Y)

yubiquity({
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
}).then((state) => {
  // state is now something that appears like a normal JavaScript object,
  // but is bound to Yjs and will sync with other connected clients
  state.name = 'new name'
  state.otherData = {
    a : 1,
    b : [1,2,3]
  }
  state.on('change', () => {
    redrawUi(state)
  })
})

```

See the [demo](https://lukebarlow.github.io/yubiquity/) and examples directory for more example apps


note on imports
---------------

Using Yjs involves importing the core module, and then also importing the 
_types_, _databases_ and _connectors_ that you want to use. See the **npm**
section [here](http://y-js.org/) for an example.

When yubiquity, it already imports the core `yjs`, plus `y-array`, `y-map` and
`y-memory`. Therefore, you must _not_ install or import these again, otherwise
the code will be confused between two different versions of the same module,
and bugs can occur.

However, for your choice of connector (`y-websockets-client`, `y-webrtc`, ...) or
for other types of database than `y-memory` (such as `y-websockets-client`), you
will need to import them and bind to `yubiquity.Y`, as in the example above
(which uses the es6 `import` syntax, instead of `require()`.

Note that

```
import YWebsocketsClient from 'y-websockets-client'
YWebsocketsClient(yubiquity.Y)
```

is equivalent to

```
require('y-websockets-client')(yubiquity.Y)
```


import Y from 'yjs'
import yMemory from 'y-memory'
import yTest from 'y-test'
yMemory(Y)
yTest(Y)

import { getProxyForYObject } from '../../'

async function createUsers (numberOfUsers) {
  if (Y.utils.globalRoom.users[0] != null) {
    await Y.utils.globalRoom.flushAll()
  }
  // destroy old users
  for (var u in Y.utils.globalRoom.users) {
    Y.utils.globalRoom.users[u].y.destroy()
  }
  var promises = []
  for (var i = 0; i < numberOfUsers; i++) {
    promises.push(Y({
      db: {
        name: 'memory',
        namespace: 'User ' + i,
        //cleanStart: true,
        gcTimeout: -1
      },
      connector: {
        name: 'Test',
        debug: false
      },
      share: {
        root: 'Map'
      }
    }))
  }
  const yUsers = await Promise.all(promises).catch(console.log.bind(console))
  const states = yUsers.map((y) => {
    return getProxyForYObject(y.share.root)
  })
  return states
}

export default createUsers
import YPlainState from '../../'

import Y from 'yjs'
import YMemory from 'y-memory'
import YTest from 'y-test'

Y.extend(YMemory, YTest, YPlainState)

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
        // cleanStart: true,
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
    return Y.PlainState(y.share.root)
  })
  return states
}

export default createUsers

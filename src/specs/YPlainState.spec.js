import { createUsers, flushAll } from './specHelper'
import { setDefaults } from '../'

async function endOfThread () {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1)
  })
}

async function singleUserAndSpy () {
  const users = await createUsers(1)
  const user = users[0]
  const spy = jasmine.createSpy('spy')
  user.observe(spy)
  return { user, spy }
}

async function twoUsersAndSpys () {
  const users = await createUsers(2)
  const user1 = users[0]
  const user2 = users[1]
  const spy1 = jasmine.createSpy('spy1')
  const spy2 = jasmine.createSpy('spy2')
  user1.observe(spy1)
  user2.observe(spy2)
  return { user1, spy1, user2, spy2 }
}

describe('single user, modifying the state, firing a single change event : ', () => {
  it('sets a primitive string property on a map', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.name = 'Henry'
    expect(user.name).toEqual('Henry')
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('sets a primitive number property on a map', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = 4
    expect(user.child).toEqual(4)
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('deletes a property from a map', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.name = 'henry'
    await flushAll()
    delete user.name
    await endOfThread()
    expect(user.child).toEqual(undefined)
    expect(spy.calls.count()).toEqual(2)
    done()
  })

  it('sets a map property on a map', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = {}
    expect(user.child).toEqual({})
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('sets an array property on a map', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = []
    expect(user.child).toEqual([])
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('sets a populated map property on a map', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = {a: 1}
    expect(user.child).toEqual({a: 1})
    await endOfThread()
    // because of timing issues, sometimes two events will be fired
    // This is an area for possible future improvement, to try and make
    // it always fire once
    expect([2, 1].includes(spy.calls.count())).toBe(true)
    done()
  })

  it('sets a populated list property on a map', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = [1, 2, 5, 42, 8]
    expect(user.child).toEqual([1, 2, 5, 42, 8])
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('sets a deeper structure on a map', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = { x: { y: 1 } }
    expect(user.child).toEqual({ x: { y: 1 } })
    await endOfThread()
    expect([2, 1].includes(spy.calls.count())).toBe(true)
    done()
  })

  it('increments a value', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = { x: 1 }
    user.child.x++
    expect(user.child.x).toEqual(2)
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('list.push', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = []
    user.child.push('apple')
    expect(user.child).toEqual(['apple'])
    await endOfThread()
    expect([2, 1].includes(spy.calls.count())).toBe(true)
    done()
  })

  it('list.pop', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = [1, 2, 3]
    user.child.pop()
    expect(user.child).toEqual([1, 2])
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('list.shift', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = [1, 2, 3]
    user.child.shift()
    expect(user.child).toEqual([2, 3])
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('list.unshift', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = [1, 2, 3]
    user.child.unshift(19)
    expect(user.child).toEqual([19, 1, 2, 3])
    await endOfThread()
    expect([2, 1].includes(spy.calls.count())).toBe(true)
    done()
  })

  it('push a type on a list', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = []
    user.child.push({v: 1})
    expect(user.child).toEqual([{ v: 1 }])
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('overwrite an existing element on a list', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.child = []
    user.child.push([12])
    user.child[0] = [24]
    expect(user.child).toEqual([[24]])
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })

  it('can use setDefaults as a shortcut for setting values that are not defined yet', async (done) => {
    const { user, spy } = await singleUserAndSpy()
    user.value = 22
    setDefaults(user, { name: 'bob', value: 98 })
    expect(user.value).toEqual(22)
    expect(user.name).toEqual('bob')
    expect(spy.calls.count()).toEqual(0)
    await endOfThread()
    expect(spy.calls.count()).toEqual(1)
    done()
  })
})

describe('two users, modifying the state and synchronising : ', () => {
  it('sets a primitive string property on a map', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.name = 'Henry'
    await flushAll()
    expect(user2.name).toEqual('Henry')
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('sets a primitive number property on a map', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = 4
    await flushAll()
    expect(user2.child).toEqual(4)
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('sets a map property on a map', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = {}
    await flushAll()
    expect(user2.child).toEqual({})
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('sets an array property on a map', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = []
    await flushAll()
    expect(user2.child).toEqual([])
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('sets a populated map property on a map', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = { a: 1 }
    await flushAll()
    expect(user2.child).toEqual({ a: 1 })
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('sets a populated list property on a map', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = [1, 2, 5, 42, 8]
    await flushAll()
    expect(user2.child).toEqual([1, 2, 5, 42, 8])
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('sets a deeper structure on a map', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = { x: { y: 1 } }
    await flushAll()
    expect(user2.child).toEqual({ x: { y: 1 } })
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('increments a value', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = { x: 4 }
    await flushAll()
    user1.child.x++
    await flushAll()
    expect(user2.child.x).toEqual(5)
    expect(spy1.calls.count()).toEqual(2)
    expect(spy2.calls.count()).toEqual(2)
    done()
  })

  it('list.push', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = []
    user1.child.push('apple')
    await flushAll()
    expect(user2.child).toEqual(['apple'])
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('list.pop', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = [1, 2, 3]
    user1.child.pop()
    await flushAll()
    expect(user2.child).toEqual([1, 2])
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('list.shift', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = [1, 2, 3]
    user1.child.shift()
    await flushAll()
    expect(user2.child).toEqual([2, 3])
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('list.unshift', async (done) => {
    const { user1, spy1, user2, spy2 } = await twoUsersAndSpys()
    user1.child = [1, 2, 3]
    user1.child.unshift(19)
    await flushAll()
    expect(user2.child).toEqual([19, 1, 2, 3])
    expect(spy1.calls.count()).toEqual(1)
    expect(spy2.calls.count()).toEqual(1)
    done()
  })

  it('push a type on a list', async (done) => {
    const { user1, user2 } = await twoUsersAndSpys()
    user1.child = []
    user1.child.push({v: 1})
    await flushAll()
    expect(user2.child).toEqual([{ v: 1 }])
    done()
  })

  it('warns if you use the old .on method', async(done) => {
    const users = await createUsers(1)
    const user = users[0]
    spyOn(global.console, 'warn')
    user.on('change', () => {})
    expect(global.console.warn).toHaveBeenCalled()
    done()
  })
})

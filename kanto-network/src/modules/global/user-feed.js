import { toBuffer } from '@/lib/utils'
import Hyperbee from 'hyperbee'
import { store, swarm } from '../pear-runtime'

let globalUserFeedCore = null

export const getGlobalUserFeedDb = async () => {
  globalUserFeedCore = store.get({
    name: 'global-user-feed'
  })
  if (!globalUserFeedCore) {
    throw new Error('Global user feed not found')
  }
  await globalUserFeedCore.ready()

  const db = new Hyperbee(globalUserFeedCore, {
    keyEncoding: 'utf-8',
    valueEncoding: {
      encode: (val) => toBuffer(JSON.stringify(val)),
      decode: (buf) => JSON.parse(buf.toString())
    }
  })

  await db.ready()

  return db
}

export const initGlobalUserFeed = async () => {
  const db = await getGlobalUserFeedDb()

  swarm.on('connection', async (conn) => {
    db.core.replicate(conn)
    const remoteCore = store.get({ key: conn.remotePublicKey })
    const remoteBee = new Hyperbee(remoteCore, {
      keyEncoding: 'utf-8',
      valueEncoding: 'json'
    })
    const profile = await remoteBee.get('profile')
    await syncUserToGlobalFeed(profile.username, profile)
  })

  const discovery = swarm.join(db.discoveryKey)

  await discovery.flushed()

  await db.core.update()

  console.log('Initialized global user feed')
}

export const syncUserToGlobalFeed = async (username, profile) => {
  const db = await getGlobalUserFeedDb()
  if (username) {
    await db.put(username, { profile })
  }
}

export const checkIfUsernameIsUnique = async (username) => {
  const db = await getGlobalUserFeedDb()

  const profile = await db.get(username)

  return profile === null
}

import { fromHex, toBuffer } from '@/lib/utils'
import Hyperbee from 'hyperbee'
import { store, swarm } from '../pear-runtime'

let globalUserFeedCore = null
export const getGlobalUserFeedCore = async (Pear) => {
  const key = Pear.config.options.env.globalUserFeedKey

  globalUserFeedCore = store.get({
    key: fromHex(key)
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

export const initGlobalUserFeed = async (Pear) => {
  const db = await getGlobalUserFeedCore(Pear)

  swarm.on('connection', (socket) => {
    db.core.replicate(socket)
  })

  const discovery = swarm.join(db.discoveryKey)

  await discovery.flushed()

  await db.core.update()

  console.log('Initialized global user feed')
}

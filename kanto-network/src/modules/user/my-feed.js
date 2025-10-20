import { toBuffer, toHex } from '@/lib/utils'
import Hyperbee from 'hyperbee'
import { store, swarm } from '../pear-runtime'

export const getUserMyFeed = async () => {
  const core = store.get({
    name: 'user.myFeed'
  })
  await core.ready()

  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: {
      encode: (val) => toBuffer(JSON.stringify(val)),
      decode: (buf) => JSON.parse(buf.toString())
    }
  })

  await db.ready()

  return {
    db,
    key: toHex(core.key),
    discoveryKey: toHex(core.discoveryKey),
    core: db.core
  }
}

export const initUserMyFeed = async () => {
  const { core, db } = await getUserMyFeed()

  swarm.on('connection', (socket) => {
    core.replicate(socket)
  })

  const discovery = swarm.join(db.discoveryKey)
  await discovery.flushed()

  console.log('Initialized user my feed')
}

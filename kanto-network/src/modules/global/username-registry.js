/* global Pear */
import { fromHex } from '@/lib/utils'
import Hyperbee from 'hyperbee'
import { store, swarm } from '../pear-runtime'

const usernameRegistry = {
  topic: fromHex(Pear.app.options.env.globalCommunityFeedKey),
  indexerDb: null,
  async initNetwork() {
    console.log('Initializing global username registry')
    const indexerCore = await store.get({
      key: this.topic
    })

    await indexerCore.ready()
    const indexerDb = new Hyperbee(indexerCore, {
      keyEncoding: 'utf-8',
      valueEncoding: 'json'
    })
    await indexerDb.ready()

    this.indexerDb = indexerDb

    indexerDb.feed.on('append', async () => {
      const latest = await globalBee.get('latest-username')
      console.log('🆕 Someone added:', latest)
    })

    swarm.on('connection', (conn, info) => {
      debugger
      indexerCore.replicate(conn)
    })

    swarm.join(this.topic)

    await swarm.flush()

    console.log('Initialized global username registry')
  },
  async lookUpUsername(username) {
    const entry = await this.indexerDb.get(username)
    return entry?.value || null
  }
}

export default usernameRegistry

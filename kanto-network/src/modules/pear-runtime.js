/** @typedef {import('pear-interface')} */ /* global Pear */
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import path from 'path'
import ui from 'pear-electron'
import updates from 'pear-updates'
import { initGlobalUserFeed } from './global/user-feed'
import { initUserMyFeed } from './user/my-feed'

// console.log('link', Pear.config.link)
// console.log('linkData', Pear.config.linkData)
// console.log('key', Pear.config.key)

let initialized = false

const store = new Corestore(path.join(Pear.app.storage, 'storage'))
const swarm = new Hyperswarm()

export const initPearRuntime = async (onStatusChange = null) => {
  console.log('attempting to initialize pear runtime')
  if (initialized) return
  console.log('Initializing Pear Runtime')
  onStatusChange?.('Initializing app..')

  initialized = true

  await store.ready()

  updates(async () => {
    console.log('window.location.pathname', window.location.pathname)

    if (window.location.pathname !== '/') {
      window.location.href = '/'
      window.location.reload()
      return
    }
  })

  Pear.wakeups(async (wakeup) => {
    console.log('GOT WAKEUP', wakeup)
    await ui.app.focus({ steal: true })
  })

  Pear.teardown(async () => {
    console.log('Perform async teardown here')
    await swarm.destroy()
    // await new Promise((resolve) => setTimeout(resolve, 500)) // example async work
  })

  onStatusChange?.('Initializing p2p network..')
  // global user feed
  await initGlobalUserFeed(Pear)

  onStatusChange?.('Syncing user data..')
  // user my feed
  await initUserMyFeed()

  onStatusChange?.('Loading user interface..')
}

export { store, swarm }

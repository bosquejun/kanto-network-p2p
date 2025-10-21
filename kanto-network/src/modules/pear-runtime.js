/** @typedef {import('pear-interface')} */ /* global Pear */
import { getToastById } from '@/lib/utils'
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import path from 'path'
import ui from 'pear-electron'
import updates from 'pear-updates'
import { toast } from 'sonner'
import usernameRegistry from './global/username-registry'
import { initUserMyFeed } from './user/my-feed'

let initialized = false

const store = new Corestore(path.join(Pear.app.storage, 'storage'))
const swarm = new Hyperswarm({
  bootstrap: []
})

console.log({ appMode: import.meta.env.VITE_APP_MODE })

let updateToastId = 'code-update-toast'

export const initPearRuntime = async (onStatusChange = null) => {
  console.log('attempting to initialize pear runtime')
  if (initialized) return
  console.log('Initializing Pear Runtime')
  onStatusChange?.('Initializing app..')

  initialized = true

  await store.ready()

  updates(async () => {
    if (getToastById(updateToastId)) {
      return
    }

    toast('Code change detected.', {
      id: updateToastId,
      description: 'Code has been updated, please refresh the page.',
      action: {
        label: 'Refresh',
        onClick: () => {
          toast.loading('Updating...', {
            id: 'reload-toast'
          })
          window.location.href = '/'
        }
      },
      closeButton: true,
      duration: Infinity
    })
  })

  Pear.wakeups(async (wakeup) => {
    console.log('GOT WAKEUP', wakeup)

    await ui.app.focus({ steal: true })
  })

  Pear.teardown(async () => {
    console.log('Perform async teardown here')
    if (getToastById('reload-toast')) {
      window.location.href = '/'
    } else {
      toast.loading('Shutting down...')
    }

    await swarm.destroy()
  })

  onStatusChange?.('Initializing p2p network..')
  await usernameRegistry.initNetwork()

  onStatusChange?.('Preparing user data..')
  await initUserMyFeed()

  onStatusChange?.('Loading user interface..')
}

export { store, swarm }

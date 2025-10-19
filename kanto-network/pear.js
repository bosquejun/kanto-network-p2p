import Bridge from 'pear-bridge'
import Runtime from 'pear-electron'
import updates from 'pear-updates'

updates((update) => {
  console.log('Application update available:', update)
})

const bridge = new Bridge({
  mount: 'dist'
})
await bridge.ready()

const runtime = new Runtime()
await runtime.start({ bridge })

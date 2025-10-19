/** @typedef {import('pear-interface')} */ /* global Pear */
import ui from 'pear-electron'
import updates from 'pear-updates'
console.log('link', Pear.config.link)
console.log('linkData', Pear.config.linkData)
console.log('key', Pear.config.key)

updates(async () => {
  const updateIndicator = document.getElementById('pear-update-indicator')
  updateIndicator.style.display = 'flex'
  setTimeout(() => {
    updateIndicator.style.display = 'none'
    window.location.reload()
  }, 2000)
})

Pear.wakeups(async (wakeup) => {
  console.log('GOT WAKEUP', wakeup)
  await ui.app.focus({ steal: true })
})

Pear.teardown(async () => {
  console.log('Perform async teardown here')
  await new Promise((resolve) => setTimeout(resolve, 500)) // example async work
})

console.log('Pear.config', Pear.config)

const { app, platform } = await Pear.versions()

console.log('app', app)
console.log('platform', platform)

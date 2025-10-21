/**
 * Simplified test for global username registry
 * Multi-writer: Each user has their own Hyperbee that replicates on a shared topic
 *
 * Usage:
 * node test-username-registry-simple.js
 */

import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import Hyperswarm from 'hyperswarm'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fromHex = (hex) => Buffer.from(hex, 'hex')
const toHex = (buffer) => buffer.toString('hex')

// Shared discovery topic
const GLOBAL_TOPIC = fromHex(
  '44f16e43a86cb2c6c6ddf61a51c83400023281f6cb9e003f0b839a729a3bdcbd'
)

async function createUser(name, storePath) {
  console.log(`\n🔧 Creating ${name}...`)

  const store = new Corestore(storePath)
  const swarm = new Hyperswarm()

  // My own registry (writable)
  const myCore = await store.get({ name: 'my-username-registry' })
  const myDb = new Hyperbee(myCore, {
    keyEncoding: 'utf-8',
    valueEncoding: 'json'
  })
  const myDbKey = toHex(myCore.key)

  const discoveredRegistryKeys = new Set()

  // Setup networking
  swarm.on('connection', (conn) => {
    store.replicate(conn)
    
    // Exchange core keys
    conn.once('data', async (data) => {
      try {
        const peerKey = data
        const peerKeyHex = toHex(peerKey)
        
        if (peerKeyHex !== myDbKey && !discoveredRegistryKeys.has(peerKeyHex)) {
          discoveredRegistryKeys.add(peerKeyHex)
        }
      } catch (err) {
        // Ignore
      }
    })
    conn.write(myCore.key)
  })

  const discovery = swarm.join(GLOBAL_TOPIC)
  await discovery.flushed()

  console.log(`✅ ${name} ready (key: ${toHex(myCore.key).slice(0, 8)}...)`)

  return {
    name,
    store,
    swarm,
    myDb,
    discoveredRegistryKeys,

    async register(username) {
      // Check if exists anywhere
      const exists = await this.lookup(username)
      if (exists) {
        console.log(`❌ ${this.name}: "${username}" already taken`)
        return false
      }

      await this.myDb.put(username, {
        username,
        registeredBy: this.name,
        timestamp: Date.now()
      })

      console.log(`✅ ${this.name}: Registered "${username}"`)
      return true
    },

    async lookup(username) {
      // Check my registry
      const myEntry = await this.myDb.get(username)
      if (myEntry) return myEntry.value

      // Check all discovered peer registries (get from corestore)
      for (const peerKeyHex of this.discoveredRegistryKeys) {
        try {
          const peerCore = await store.get({ key: fromHex(peerKeyHex) })
          const peerDb = new Hyperbee(peerCore, {
            keyEncoding: 'utf-8',
            valueEncoding: 'json'
          })
          const entry = await peerDb.get(username)
          if (entry) return entry.value
        } catch (err) {
          // Skip
        }
      }
      return null
    },

    async lookupVerbose(username) {
      const result = await this.lookup(username)
      if (result) {
        console.log(
          `✅ ${this.name}: Found "${username}" (by ${result.registeredBy})`
        )
      } else {
        console.log(`❌ ${this.name}: "${username}" not found`)
      }
      return result
    },

    async list() {
      console.log(`\n📋 ${this.name}: All usernames:`)
      const usernames = new Map()

      for await (const { key, value } of this.myDb.createReadStream()) {
        usernames.set(key, value)
      }

      // Get from all discovered peer registries (get from corestore)
      for (const peerKeyHex of this.discoveredRegistryKeys) {
        try {
          const peerCore = await store.get({ key: fromHex(peerKeyHex) })
          const peerDb = new Hyperbee(peerCore, {
            keyEncoding: 'utf-8',
            valueEncoding: 'json'
          })
          for await (const { key, value } of peerDb.createReadStream()) {
            if (!usernames.has(key)) usernames.set(key, value)
          }
        } catch (err) {
          // Skip
        }
      }

      for (const [username, data] of usernames.entries()) {
        console.log(`   - ${username} (${data.registeredBy})`)
      }
    },

    async close() {
      await this.swarm.destroy()
      await this.store.close()
    }
  }
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

// Run the test
async function main() {
  console.log('═══════════════════════════════════════')
  console.log('  Username Registry Test (Multi-Writer)')
  console.log('═══════════════════════════════════════')

  const tmpDir = path.join(__dirname, '.test-stores')

  const alice = await createUser('Alice', path.join(tmpDir, 'alice'))
  const bob = await createUser('Bob', path.join(tmpDir, 'bob'))

  // Wait for discovery
  console.log('\n⏳ Discovering peers...')
  await wait(2000)

  // Test registrations
  console.log('\n\n📝 REGISTRATION TESTS')
  console.log('─────────────────────────────────────')
  await alice.register('alice')
  await wait(1000)

  await bob.register('bob')
  await wait(1000)

  await bob.register('alice') // Should fail (duplicate)

  // Test lookups
  console.log('\n\n🔍 LOOKUP TESTS')
  console.log('─────────────────────────────────────')
  await alice.lookupVerbose('bob')
  await bob.lookupVerbose('alice')
  await alice.lookupVerbose('charlie') // Should not exist

  // List all
  console.log('\n\n📋 LIST ALL')
  console.log('─────────────────────────────────────')
  await alice.list()
  await bob.list()

  // Cleanup
  console.log('\n\n🧹 Cleanup')
  console.log('─────────────────────────────────────')
  await alice.close()
  await bob.close()

  console.log('\n✅ Test complete!\n')
  process.exit(0)
}

main().catch(console.error)

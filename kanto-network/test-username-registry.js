/* global Pear */
/**
 * Test script for global username registry
 * Multi-writer architecture: Each user has their own Hyperbee
 * All users replicate on a shared discovery topic
 *
 * Usage:
 * node test-username-registry.js
 */

import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import Hyperswarm from 'hyperswarm'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Utility functions
const fromHex = (hex) => Buffer.from(hex, 'hex')
const toHex = (buffer) => buffer.toString('hex')

// Global topic for discovery (NOT a specific core, just a shared topic)
const GLOBAL_TOPIC = fromHex(
  '44f16e43a86cb2c6c6ddf61a51c83400023281f6cb9e003f0b839a729a3bdcbd'
)

// User class - each user has their own Hyperbee
class User {
  constructor(name, storePath) {
    this.name = name
    this.storePath = storePath
    this.store = null
    this.swarm = null
    this.myDb = null // My own username registry
    this.myDbKey = null // Key of my registry
    this.discoveredRegistryKeys = new Set() // Discovered peer registry keys
  }

  async init() {
    console.log(`\n🚀 Initializing user: ${this.name}`)

    // Create corestore
    this.store = new Corestore(this.storePath)
    await this.store.ready()

    // Create swarm
    this.swarm = new Hyperswarm()

    // Create my own username registry (writable)
    const myCore = await this.store.get({ name: 'my-username-registry' })
    await myCore.ready()

    this.myDb = new Hyperbee(myCore, {
      keyEncoding: 'utf-8',
      valueEncoding: 'json'
    })
    await this.myDb.ready()
    this.myDbKey = toHex(myCore.key)

    console.log(`  📝 ${this.name}: My registry key: ${this.myDbKey}`)

    // Setup replication
    this.swarm.on('connection', (conn, info) => {
      console.log(`  📡 ${this.name}: New peer connection`)

      // Replicate my corestore
      this.store.replicate(conn)

      // When we discover a peer's core, track the registry key
      conn.once('data', async (data) => {
        try {
          const peerKey = data
          const peerKeyHex = toHex(peerKey)

          if (
            peerKeyHex !== this.myDbKey &&
            !this.discoveredRegistryKeys.has(peerKeyHex)
          ) {
            this.discoveredRegistryKeys.add(peerKeyHex)
            console.log(
              `  🔗 ${this.name}: Discovered peer registry: ${peerKeyHex.slice(0, 8)}...`
            )
          }
        } catch (err) {
          // Ignore errors from invalid data
        }
      })

      // Send my core key to the peer
      conn.write(myCore.key)
    })

    // Join the global topic
    const discovery = this.swarm.join(GLOBAL_TOPIC, {
      server: true,
      client: true
    })
    await discovery.flushed()

    console.log(`  ✅ ${this.name}: Connected to network on global topic`)
  }

  async registerUsername(username) {
    console.log(`\n📝 ${this.name}: Registering username: ${username}`)

    // Check if username exists in ANY registry (mine or peers')
    const existing = await this.lookupUsername(username)
    if (existing) {
      console.log(
        `  ❌ ${this.name}: Username "${username}" is already taken by ${existing.registeredBy}`
      )
      return false
    }

    // Register in MY registry
    const userData = {
      username: username,
      publicKey: toHex(this.myDb.feed.key),
      registeredAt: Date.now(),
      registeredBy: this.name
    }

    await this.myDb.put(username, userData)
    console.log(
      `  ✅ ${this.name}: Successfully registered "${username}" in my registry`
    )
    return true
  }

  async lookupUsername(username) {
    // Check my own registry first
    const myEntry = await this.myDb.get(username)
    if (myEntry) {
      return myEntry.value
    }

    // Check all discovered peer registries (get from corestore)
    for (const peerKeyHex of this.discoveredRegistryKeys) {
      try {
        const peerCore = await this.store.get({ key: fromHex(peerKeyHex) })
        const peerDb = new Hyperbee(peerCore, {
          keyEncoding: 'utf-8',
          valueEncoding: 'json'
        })
        const entry = await peerDb.get(username)
        if (entry) {
          return entry.value
        }
      } catch (err) {
        // Skip if peer db has issues
      }
    }

    return null
  }

  async lookupUsernameVerbose(username) {
    console.log(`\n🔍 ${this.name}: Looking up username: ${username}`)

    const result = await this.lookupUsername(username)

    if (result) {
      console.log(`  ✅ ${this.name}: Found username "${username}"`)
      console.log(`     Registered by: ${result.registeredBy}`)
      console.log(`     Public key: ${result.publicKey}`)
      console.log(
        `     Registered at: ${new Date(result.registeredAt).toLocaleString()}`
      )
      return result
    } else {
      console.log(`  ❌ ${this.name}: Username "${username}" not found`)
      return null
    }
  }

  async listAllUsernames() {
    console.log(`\n📋 ${this.name}: Listing all registered usernames:`)

    const usernames = new Map()

    // Get from my registry
    for await (const entry of this.myDb.createReadStream()) {
      usernames.set(entry.key, entry.value)
    }

    // Get from all discovered peer registries (get from corestore)
    for (const peerKeyHex of this.discoveredRegistryKeys) {
      try {
        const peerCore = await this.store.get({ key: fromHex(peerKeyHex) })
        const peerDb = new Hyperbee(peerCore, {
          keyEncoding: 'utf-8',
          valueEncoding: 'json'
        })
        for await (const entry of peerDb.createReadStream()) {
          if (!usernames.has(entry.key)) {
            usernames.set(entry.key, entry.value)
          }
        }
      } catch (err) {
        // Skip if peer db has issues
      }
    }

    for (const [username, data] of usernames.entries()) {
      console.log(`  - ${username} (by ${data.registeredBy})`)
    }

    return Array.from(usernames.values())
  }

  async waitForSync(ms = 2000) {
    console.log(`\n⏳ ${this.name}: Waiting ${ms}ms for sync...`)
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  async close() {
    console.log(`\n🔴 ${this.name}: Shutting down...`)
    await this.swarm.destroy()
    await this.store.close()
  }
}

// Main test function
async function runTest() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  Global Username Registry Test (Multi-Writer)')
  console.log('═══════════════════════════════════════════════════')

  const tmpDir = path.join(__dirname, '.test-stores')

  // Create three users - each with their own registry
  const alice = new User('Alice', path.join(tmpDir, 'alice'))
  const bob = new User('Bob', path.join(tmpDir, 'bob'))
  const charlie = new User('Charlie', path.join(tmpDir, 'charlie'))

  try {
    // Initialize all users
    await alice.init()
    await bob.init()
    await charlie.init()

    // Wait for peers to discover each other
    console.log('\n⏳ Waiting for peer discovery...')
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Test 1: Alice registers a username
    console.log('\n\n📌 TEST 1: Alice registers username')
    console.log('─────────────────────────────────────────────────')
    await alice.registerUsername('alice_smith')
    await alice.waitForSync(2000)

    // Test 2: Bob looks up Alice's username
    console.log("\n\n📌 TEST 2: Bob looks up Alice's username")
    console.log('─────────────────────────────────────────────────')
    await bob.lookupUsernameVerbose('alice_smith')

    // Test 3: Bob registers his own username
    console.log('\n\n📌 TEST 3: Bob registers his own username')
    console.log('─────────────────────────────────────────────────')
    await bob.registerUsername('bob_jones')
    await bob.waitForSync(2000)

    // Test 4: Charlie tries to register an already taken username
    console.log("\n\n📌 TEST 4: Charlie tries to take Alice's username")
    console.log('─────────────────────────────────────────────────')
    await charlie.registerUsername('alice_smith')

    // Test 5: Charlie registers a unique username
    console.log('\n\n📌 TEST 5: Charlie registers unique username')
    console.log('─────────────────────────────────────────────────')
    await charlie.registerUsername('charlie_brown')
    await charlie.waitForSync(2000)

    // Test 6: List all usernames from different users
    console.log('\n\n📌 TEST 6: Each user lists all usernames')
    console.log('─────────────────────────────────────────────────')
    await alice.listAllUsernames()
    await bob.listAllUsernames()
    await charlie.listAllUsernames()

    // Test 7: Cross-user lookups
    console.log('\n\n📌 TEST 7: Cross-user lookups')
    console.log('─────────────────────────────────────────────────')
    await alice.lookupUsernameVerbose('bob_jones')
    await bob.lookupUsernameVerbose('charlie_brown')
    await charlie.lookupUsernameVerbose('alice_smith')

    // Test 8: Try non-existent username
    console.log('\n\n📌 TEST 8: Try non-existent username')
    console.log('─────────────────────────────────────────────────')
    await alice.lookupUsernameVerbose('doesnt_exist')

    console.log('\n\n═══════════════════════════════════════════════════')
    console.log('  ✅ All tests completed!')
    console.log('═══════════════════════════════════════════════════\n')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...')
    await alice.close()
    await bob.close()
    await charlie.close()

    console.log('\n✅ Cleanup complete. Test finished.\n')
    process.exit(0)
  }
}

// Run the test
runTest().catch(console.error)

/* global Pear */
import { fromHex, toHex } from '@/lib/utils'
import Hyperbee from 'hyperbee'
import { store, swarm } from '../pear-runtime'

const usernameRegistry = {
  topic: fromHex(Pear.app.options.env.globalCommunityFeedKey),
  myRegistry: null, // My own username registry (writable)
  myRegistryKey: null, // Key of my registry
  discoveredRegistryKeys: new Set(), // Track discovered registry keys (in-memory)
  metadataDb: null, // Persisted metadata about discovered registries
  isInitialized: false,
  updateListeners: new Set(), // Listeners for registry updates

  async initNetwork() {
    if (this.isInitialized) {
      console.log('Username registry already initialized')
      return
    }

    console.log('🌐 Initializing global username registry (multi-writer)')

    // Create metadata store for persisting discovered registry keys
    const metadataCore = await store.get({ name: 'username-registry-metadata' })
    await metadataCore.ready()
    this.metadataDb = new Hyperbee(metadataCore, {
      keyEncoding: 'utf-8',
      valueEncoding: 'json'
    })
    await this.metadataDb.ready()

    // Create my own username registry (writable)
    const myCore = await store.get({ name: 'my-username-registry' })
    await myCore.ready()

    this.myRegistry = new Hyperbee(myCore, {
      keyEncoding: 'utf-8',
      valueEncoding: 'json'
    })
    await this.myRegistry.ready()
    this.myRegistryKey = toHex(myCore.key)

    console.log(`📝 My registry key: ${this.myRegistryKey}`)

    // Load previously discovered registry keys from persistence
    await this._loadDiscoveredKeys()
    if (this.discoveredRegistryKeys.size > 0) {
      console.log(
        `📂 Loaded ${this.discoveredRegistryKeys.size} known peer registries from cache`
      )
    }

    // Setup peer discovery
    swarm.on('connection', (conn) => {
      console.log('📡 New peer connection for username registry')

      // Exchange registry keys with peer
      conn.once('data', async (data) => {
        try {
          const peerKey = data
          const peerKeyHex = toHex(peerKey)

          // Don't add our own registry
          if (peerKeyHex === this.myRegistryKey) return

          // Add to discovered registries
          if (!this.discoveredRegistryKeys.has(peerKeyHex)) {
            this.discoveredRegistryKeys.add(peerKeyHex)
            console.log(
              `🔗 Discovered peer registry: ${peerKeyHex.slice(0, 8)}...`
            )

            // Persist the discovery
            await this._saveDiscoveredKey(peerKeyHex)

            // Get the core and listen for updates
            const peerCore = await store.get({ key: peerKey })
            await peerCore.ready()

            peerCore.on('append', () => {
              console.log(
                `🔄 Peer registry ${peerKeyHex.slice(0, 8)}... updated`
              )
              // Notify listeners that a registry was updated
              this._notifyListeners(peerKeyHex)
            })
          }
        } catch (err) {
          console.error('Error discovering peer registry:', err)
        }
      })

      // Send my registry key to the peer
      conn.write(myCore.key)
    })

    // Listen to my own registry updates too
    myCore.on('append', () => {
      console.log('🔄 My registry updated')
      this._notifyListeners(this.myRegistryKey)
    })

    // Join the global discovery topic
    swarm.join(this.topic, { server: true, client: true })
    await swarm.flush()

    this.isInitialized = true
    console.log('✅ Username registry initialized')
  },

  /**
   * Load discovered registry keys from persistent storage
   * @private
   */
  async _loadDiscoveredKeys() {
    try {
      for await (const entry of this.metadataDb.createReadStream()) {
        if (entry.key !== this.myRegistryKey) {
          this.discoveredRegistryKeys.add(entry.key)
        }
      }
    } catch (err) {
      console.error('Error loading discovered keys:', err)
    }
  },

  /**
   * Save a discovered registry key to persistent storage
   * @private
   */
  async _saveDiscoveredKey(key) {
    try {
      await this.metadataDb.put(key, {
        discoveredAt: Date.now(),
        lastSeenAt: Date.now()
      })
    } catch (err) {
      console.error('Error saving discovered key:', err)
    }
  },

  /**
   * Update last seen timestamp for a registry key
   * @private
   */
  async _updateLastSeen(key) {
    try {
      const existing = await this.metadataDb.get(key)
      if (existing) {
        await this.metadataDb.put(key, {
          ...existing.value,
          lastSeenAt: Date.now()
        })
      }
    } catch (err) {
      console.error('Error updating last seen:', err)
    }
  },

  /**
   * Get a Hyperbee instance for a registry key (uses corestore directly)
   * @private
   */
  async _getRegistry(key) {
    const core = await store.get({ key: fromHex(key) })
    await core.ready()

    return new Hyperbee(core, {
      keyEncoding: 'utf-8',
      valueEncoding: 'json'
    })
  },

  /**
   * Register a username in MY registry
   * @param {string} username - Username to register
   * @param {Object} userData - User data to store with the username
   * @returns {Promise<boolean>} - True if registered successfully, false if taken
   */
  async registerUsername(username, userData) {
    if (!this.isInitialized || !this.myRegistry) {
      throw new Error('Username registry not initialized')
    }

    console.log(`📝 Attempting to register username: ${username}`)

    // Check if username exists in ANY registry (mine or peers')
    const existing = await this.lookupUsername(username)
    if (existing) {
      // If username exists but belongs to this user, allow update
      if (existing.publicKey === userData.publicKey) {
        console.log(
          `🔄 Username "${username}" exists and belongs to this user, updating...`
        )
        // Continue to update the registration
      } else {
        console.log(
          `❌ Username "${username}" is already taken by another user`
        )
        return false
      }
    }

    // Check if this public key has any OLD username entries in MY registry
    // If so, we need to delete them to avoid stale data
    const oldEntries = []
    try {
      for await (const entry of this.myRegistry.createReadStream()) {
        if (
          entry.value?.publicKey === userData.publicKey &&
          entry.key !== username
        ) {
          oldEntries.push(entry.key)
        }
      }

      // Delete old username entries for this public key
      for (const oldUsername of oldEntries) {
        console.log(`🗑️ Deleting old username entry: "${oldUsername}"`)
        await this.myRegistry.del(oldUsername)
      }
    } catch (err) {
      console.error('Error cleaning up old username entries:', err)
    }

    // Register or update in MY registry
    const registrationData = {
      username,
      publicKey: userData.publicKey,
      registeredAt: existing?.registeredAt || Date.now(), // Keep original registration date if updating
      displayName: userData.displayName || '',
      ...userData
    }

    console.log(
      `💾 ${existing ? 'Updating' : 'Registering'} data for "${username}" in registry...`
    )
    await this.myRegistry.put(username, registrationData)
    console.log(`🔄 Calling core.update() to flush changes...`)
    await this.myRegistry.core.update() // Flush changes to trigger append event
    console.log(
      `✅ Successfully ${existing ? 'updated' : 'registered'} "${username}" in my registry. Core update completed.`
    )

    return true
  },

  /**
   * Look up a username across ALL registries
   * @param {string} username - Username to look up
   * @returns {Promise<Object|null>} - User data if found, null otherwise
   */
  async lookupUsername(username) {
    if (!this.isInitialized || !this.myRegistry) {
      throw new Error('Username registry not initialized')
    }

    // Check my own registry first
    try {
      const myEntry = await this.myRegistry.get(username)
      if (myEntry && myEntry.value) {
        return myEntry.value
      }
    } catch (err) {
      console.error('Error checking my registry:', err)
    }

    // Check all discovered peer registries (get directly from corestore)
    for (const peerKeyHex of this.discoveredRegistryKeys) {
      try {
        const peerRegistry = await this._getRegistry(peerKeyHex)
        const entry = await peerRegistry.get(username)
        if (entry && entry.value) {
          return entry.value
        }
      } catch (err) {
        // Skip if peer registry has issues
        console.error(
          `Error checking peer registry ${peerKeyHex.slice(0, 8)}:`,
          err
        )
      }
    }

    return null
  },

  /**
   * Look up user data by public key (reverse lookup)
   * @param {string} publicKeyHex - Public key to look up
   * @returns {Promise<Object|null>} - User data if found (with username, displayName, etc.)
   */
  async lookupByPublicKey(publicKeyHex) {
    if (!this.isInitialized || !this.myRegistry) {
      throw new Error('Username registry not initialized')
    }

    // Check my own registry first - collect all matches and return the most recent
    let matches = []
    try {
      for await (const entry of this.myRegistry.createReadStream()) {
        if (entry.value?.publicKey === publicKeyHex) {
          matches.push({ username: entry.key, ...entry.value })
        }
      }

      if (matches.length > 0) {
        if (matches.length > 1) {
          console.warn(
            `⚠️ Found ${matches.length} entries for public key ${publicKeyHex.slice(0, 8)}... in my registry. Using most recent.`
          )
        }
        // Return the most recent entry (highest registeredAt timestamp)
        return matches.reduce((latest, current) =>
          (current.registeredAt || 0) > (latest.registeredAt || 0)
            ? current
            : latest
        )
      }
    } catch (err) {
      console.error('Error checking my registry:', err)
    }

    // Check all discovered peer registries
    for (const peerKeyHex of this.discoveredRegistryKeys) {
      try {
        const peerRegistry = await this._getRegistry(peerKeyHex)
        matches = []
        for await (const entry of peerRegistry.createReadStream()) {
          if (entry.value?.publicKey === publicKeyHex) {
            matches.push({ username: entry.key, ...entry.value })
          }
        }

        if (matches.length > 0) {
          if (matches.length > 1) {
            console.warn(
              `⚠️ Found ${matches.length} entries for public key ${publicKeyHex.slice(0, 8)}... in peer registry. Using most recent.`
            )
          }
          // Return the most recent entry
          return matches.reduce((latest, current) =>
            (current.registeredAt || 0) > (latest.registeredAt || 0)
              ? current
              : latest
          )
        }
      } catch (err) {
        console.error(
          `Error checking peer registry ${peerKeyHex.slice(0, 8)}:`,
          err
        )
      }
    }

    return null
  },

  /**
   * List all registered usernames from all registries
   * @returns {Promise<Array>} - Array of username objects
   */
  async listAllUsernames() {
    if (!this.isInitialized || !this.myRegistry) {
      throw new Error('Username registry not initialized')
    }

    const usernames = new Map()

    // Get from my registry
    try {
      for await (const entry of this.myRegistry.createReadStream()) {
        usernames.set(entry.key, entry.value)
      }
    } catch (err) {
      console.error('Error listing my registry:', err)
    }

    // Get from all discovered peer registries (get directly from corestore)
    for (const peerKeyHex of this.discoveredRegistryKeys) {
      try {
        const peerRegistry = await this._getRegistry(peerKeyHex)
        for await (const entry of peerRegistry.createReadStream()) {
          if (!usernames.has(entry.key)) {
            usernames.set(entry.key, entry.value)
          }
        }
      } catch (err) {
        console.error(
          `Error listing peer registry ${peerKeyHex.slice(0, 8)}:`,
          err
        )
      }
    }

    return Array.from(usernames.values())
  },

  /**
   * Get count of discovered peer registries
   * @returns {number}
   */
  getPeerCount() {
    return this.discoveredRegistryKeys.size
  },

  /**
   * Get metadata about discovered registries (for debugging/monitoring)
   * @returns {Promise<Array>}
   */
  async getDiscoveredRegistriesInfo() {
    const info = []
    try {
      for await (const entry of this.metadataDb.createReadStream()) {
        info.push({
          key: entry.key,
          ...entry.value
        })
      }
    } catch (err) {
      console.error('Error getting registry info:', err)
    }
    return info
  },

  /**
   * Remove old/stale registry keys (cleanup)
   * @param {number} maxAgeMs - Max age in milliseconds (default: 30 days)
   */
  async cleanupStaleKeys(maxAgeMs = 30 * 24 * 60 * 60 * 1000) {
    const now = Date.now()
    let removedCount = 0

    try {
      for await (const entry of this.metadataDb.createReadStream()) {
        const age = now - entry.value.lastSeenAt
        if (age > maxAgeMs) {
          await this.metadataDb.del(entry.key)
          this.discoveredRegistryKeys.delete(entry.key)
          removedCount++
        }
      }
      if (removedCount > 0) {
        console.log(`🧹 Cleaned up ${removedCount} stale registry keys`)
      }
    } catch (err) {
      console.error('Error cleaning up stale keys:', err)
    }

    return removedCount
  },

  /**
   * Subscribe to registry updates
   * @param {Function} callback - Called when any registry is updated with registryKeyHex
   * @returns {Function} - Unsubscribe function
   */
  onUpdate(callback) {
    this.updateListeners.add(callback)
    console.log(
      `👂 New listener subscribed. Total listeners: ${this.updateListeners.size}`
    )
    return () => {
      this.updateListeners.delete(callback)
      console.log(
        `👋 Listener unsubscribed. Total listeners: ${this.updateListeners.size}`
      )
    }
  },

  /**
   * Notify all listeners that a registry was updated
   * @param {string} registryKeyHex - The registry that was updated
   * @private
   */
  _notifyListeners(registryKeyHex) {
    console.log(
      `📢 Notifying ${this.updateListeners.size} listeners about registry update: ${registryKeyHex.slice(0, 8)}...`
    )
    for (const listener of this.updateListeners) {
      try {
        listener(registryKeyHex)
      } catch (err) {
        console.error('Error in registry update listener:', err)
      }
    }
  }
}

export default usernameRegistry

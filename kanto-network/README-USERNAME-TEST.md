# Username Registry Test Scripts

Test scripts demonstrating a **multi-writer distributed username registry** using Hypercore/Hyperbee.

## Architecture: Multi-Writer Registry

**💡 Key Concept:** Instead of having one central registry, each user maintains their own Hyperbee registry that replicates across the network.

### How it works:
1. **Each user has their own Hyperbee** - fully writable by that user
2. **All users join a common discovery topic** - not tied to any specific core
3. **Users replicate their registries with each other** - P2P sync
4. **Lookups check all known registries** - local + all peers
5. **First registration wins** - prevent duplicates across all registries

### Benefits:
- ✅ No single point of failure
- ✅ Every user can register (write to their own registry)
- ✅ Data is distributed and replicated
- ✅ True P2P architecture

## Files

### 1. `test-username-registry.js` (Comprehensive)
Full-featured test with detailed logging.

**Features:**
- Simulates 3 users (Alice, Bob, Charlie)
- Each has their own independent registry
- All registries replicate across the network
- Demonstrates duplicate prevention
- Detailed console output with emojis

**Tests:**
1. Individual user registrations
2. Cross-user lookups (read from peer registries)
3. Duplicate username prevention
4. List all usernames (aggregated from all registries)
5. Non-existent username lookups

### 2. `test-username-registry-simple.js` (Quick)
Simplified version for quick testing.

**Features:**
- 2 users (Alice, Bob)
- Basic registration and lookup
- Multi-registry aggregation
- Cleaner, minimal output

## Setup

Make sure your `package.json` has `"type": "module"` and required dependencies:

```json
{
  "type": "module",
  "dependencies": {
    "corestore": "^7.5.0",
    "hyperbee": "^2.26.5",
    "hyperswarm": "^4.14.2"
  }
}
```

## Usage

### Run Comprehensive Test
```bash
cd kanto-network
node test-username-registry.js
```

### Run Simple Test
```bash
cd kanto-network
node test-username-registry-simple.js
```

## What Gets Tested

### Multi-Writer Architecture
- 📝 Each user writes to their own registry
- 🔄 All registries replicate via shared topic
- 🌐 No central authority or indexer
- 🔍 Lookups aggregate from all known registries

### Registration
- ✅ Each user can register in their own registry
- ❌ Prevent duplicate username across ALL registries
- 🔄 Registrations sync across the network

### Lookup
- ✅ Find usernames in any registry (local or peer)
- ❌ Handle non-existent usernames
- 🔄 Cross-user lookups work seamlessly

### Network
- 📡 Peer discovery via shared topic
- 🔄 Multi-core replication
- ⏱️ Sync timing and consistency
- 🔗 Dynamic peer registry tracking

## Output Example

```
═══════════════════════════════════════════════════
  Global Username Registry Test (Multi-Writer)
═══════════════════════════════════════════════════

🚀 Initializing user: Alice
  📝 Alice: My registry key: a1b2c3d4e5...
  📡 Alice: New peer connection
  🔗 Alice: Added peer registry: f6g7h8i9...
  ✅ Alice: Connected to network on global topic

🚀 Initializing user: Bob
  📝 Bob: My registry key: f6g7h8i9...
  📡 Bob: New peer connection
  🔗 Bob: Added peer registry: a1b2c3d4...
  ✅ Bob: Connected to network on global topic

📝 Alice: Registering username: alice_smith
  ✅ Alice: Successfully registered "alice_smith" in my registry

🔍 Bob: Looking up username: alice_smith
  ✅ Bob: Found username "alice_smith"
     Registered by: Alice
     (found in peer registry)

📝 Charlie: Registering username: alice_smith
  ❌ Charlie: Username "alice_smith" is already taken by Alice
```

## How It Differs From Single-Writer

### Single-Writer (Indexer Pattern)
- One user owns the registry core
- Others can only read
- Requires permission/request system
- Single point of control

### Multi-Writer (This Implementation)
- Each user owns their registry
- Everyone can write (to their own)
- Direct registration, no permissions needed
- Fully distributed

## Clean Up

Test files create temporary stores in `.test-stores/`. To clean up:

```bash
rm -rf kanto-network/.test-stores
```

Or add to `.gitignore`:
```
.test-stores/
```

## Configuration

Update the global discovery topic in the test files:

```javascript
const GLOBAL_TOPIC = fromHex('your-topic-here')
```

Get this from your `package.json`:
```json
"pear": {
  "env": {
    "globalUsernameRegistryKey": "44f16e..."
  }
}
```

## Implementation Notes

### Registry Discovery
When peers connect, they exchange their registry core keys. Each user then:
1. Receives peer's registry key
2. Opens that core in read-only mode
3. Adds it to their `peerDbs` map
4. Can now query that peer's registrations

### Duplicate Prevention
Before registering a username, check:
1. Your own registry
2. All peer registries
3. Only register if not found anywhere

### Data Structure
Each registry stores:
```javascript
{
  username: "alice_smith",
  publicKey: "a1b2c3d4...",
  registeredAt: 1234567890,
  registeredBy: "Alice"
}
```

## Troubleshooting

**Peers not connecting?**
- Wait longer (increase wait time to 3-5 seconds)
- Check firewall settings
- Ensure Hyperswarm ports are available

**Registry not syncing?**
- Increase wait times between operations
- Check that core keys are being exchanged
- Verify `conn.write(myCore.key)` is working

**Duplicate registrations appearing?**
- This can happen if two users register simultaneously
- In production, add timestamp-based conflict resolution
- Or implement a more sophisticated consensus mechanism

**Errors on exit?**
- Normal - swarm cleanup can show warnings
- Can safely ignore unless causing actual issues

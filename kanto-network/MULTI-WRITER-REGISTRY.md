# Multi-Writer Username Registry

## Overview

The app now implements a **multi-writer distributed username registry** where each user maintains their own Hyperbee registry that replicates across the P2P network.

## Architecture

### How It Works

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  User A         │       │  Global Topic    │       │  User B         │
│                 │◄─────►│  (Discovery)     │◄─────►│                 │
│  My Registry    │       │                  │       │  My Registry    │
│  (Writable)     │       └──────────────────┘       │  (Writable)     │
│                 │                                   │                 │
│  Peer B Registry│                                   │  Peer A Registry│
│  (Read-only)    │◄──────────────────────────────────│  (Read-only)   │
└─────────────────┘       Exchange Keys              └─────────────────┘
```

### Key Components

1. **My Registry** - Each user's own Hyperbee (writable)
2. **Peer Registries** - Other users' Hyperbees (read-only replicas)
3. **Global Topic** - Shared discovery key for finding peers
4. **Core Key Exchange** - Peers share their registry keys when connecting

## Implementation Details

### File: `src/modules/global/username-registry.js`

#### Properties
- `myRegistry` - User's own username registry (Hyperbee instance)
- `peerRegistries` - Map of peer registry keys to Hyperbee instances
- `topic` - Global discovery topic from env config
- `isInitialized` - Initialization state

#### Methods

**`initNetwork()`**
- Creates the user's own registry
- Sets up peer discovery on global topic
- Handles peer connections and key exchange
- Starts replication with all peers

**`registerUsername(username, userData)`**
- Checks if username exists across ALL registries
- Registers username in user's own registry if available
- Returns `true` if successful, `false` if taken

**`lookupUsername(username)`**
- Searches user's own registry first
- Then searches all peer registries
- Returns user data if found, `null` otherwise

**`listAllUsernames()`**
- Aggregates usernames from all registries
- Returns array of all registered users

**`getPeerCount()`**
- Returns number of connected peer registries

### File: `src/modules/user/user.js`

#### Updated Functions

**`setupNewUser(username)`**
- Creates user profile
- **NEW:** Automatically registers username in global registry
- Logs warning if username is already taken by a peer

**`updateUserProfile(updates)`**
- Updates user profile
- **NEW:** If username changed, registers new username
- Throws error if new username is already taken

### File: `src/hooks/use-username-validation.js`

#### Updated to use `lookupUsername()`
- Now searches across all peer registries
- Provides real-time validation during username input

## Usage

### During Onboarding

```javascript
// In Onboarding.jsx
const { setupUser } = useUser()

async function handleSubmit(e) {
  e.preventDefault()
  
  // This will automatically register the username globally
  await setupUser(username)
  
  // If username is taken by a peer, user is created but username
  // registration fails (logged as warning)
}
```

### Username Validation

```javascript
// Using the custom hook
const {
  username,
  isSearching,
  isAvailable,
  isValid,
  handleUsernameChange
} = useUsernameValidation()

// isAvailable checks across ALL peer registries
```

### Profile Update

```javascript
// In ProfileEditDialog.jsx
const { updateProfile } = useUser()

async function handleSave() {
  try {
    await updateProfile({
      username: newUsername,
      // ... other fields
    })
    // Success! Username registered globally
  } catch (error) {
    // Error means username is already taken by a peer
    toast.error('Username is already taken')
  }
}
```

### Looking Up Users

```javascript
import usernameRegistry from '@/modules/global/username-registry'

// Find a user by username
const userData = await usernameRegistry.lookupUsername('alice_smith')

if (userData) {
  console.log('Found user:', userData)
  console.log('Public key:', userData.publicKey)
  console.log('Registered at:', new Date(userData.registeredAt))
}
```

### List All Users

```javascript
import usernameRegistry from '@/modules/global/username-registry'

// Get all registered users across the network
const allUsers = await usernameRegistry.listAllUsernames()

console.log(`Total users: ${allUsers.length}`)
allUsers.forEach(user => {
  console.log(`- ${user.username} (${user.publicKey})`)
})
```

### Check Peer Count

```javascript
import usernameRegistry from '@/modules/global/username-registry'

const peerCount = usernameRegistry.getPeerCount()
console.log(`Connected to ${peerCount} peer registries`)
```

## Data Structure

Each username entry stores:

```javascript
{
  username: "alice_smith",
  publicKey: "a1b2c3d4e5f6...",
  registeredAt: 1234567890123,
  displayName: "Alice Smith",
  avatar: "https://...",
  joinedAt: 1234567890123
}
```

## Benefits

### ✅ True P2P Architecture
- No central authority or single point of failure
- Every user can register (in their own registry)
- Fully distributed and decentralized

### ✅ Automatic Replication
- All registries sync automatically via Hyperswarm
- New peers receive all historical registrations
- Real-time updates when new usernames are registered

### ✅ Duplicate Prevention
- Before registering, checks ALL known registries
- First registration wins globally
- Prevents username conflicts across the network

### ✅ Resilience
- Works offline (uses local registry)
- Syncs when connection restored
- No dependency on specific "indexer" nodes

## Configuration

The global discovery topic is configured in your `package.json`:

```json
{
  "pear": {
    "env": {
      "globalCommunityFeedKey": "44f16e43a86cb2c6c6ddf61a51c83400023281f6cb9e003f0b839a729a3bdcbd"
    }
  }
}
```

## Monitoring

Console logs provide detailed information:

- `🌐 Initializing global username registry (multi-writer)` - Registry starting
- `📝 My registry key: ...` - Your registry's public key
- `📡 New peer connection for username registry` - Peer discovered
- `🔗 Added peer registry: ...` - Peer registry added
- `🔄 Peer registry ... updated` - Peer registered new username
- `✅ Username registry initialized` - Ready to use

## Testing

Use the test scripts to verify the implementation:

```bash
# Comprehensive test with 3 users
node test-username-registry.js

# Simple test with 2 users
node test-username-registry-simple.js
```

Both scripts simulate the exact same architecture as your app.

## Potential Race Conditions

### Simultaneous Registration
If two users try to register the same username at exactly the same time:
- Both might succeed in their own registries
- Eventually both will see the conflict when registries sync
- The earlier timestamp wins (by convention)

**Solution for Production:**
- Implement timestamp-based conflict resolution
- Or add a consensus mechanism
- Or use a designated "authoritative" registry for username claims

### Network Partitions
If the network splits temporarily:
- Users in partition A won't see registrations in partition B
- When network heals, conflicts might appear

**Current Behavior:**
- First registration (by timestamp) is considered valid
- Later registrations are ignored when looking up

## Future Enhancements

1. **Conflict Resolution**
   - Add automatic conflict detection
   - Notify users of username conflicts
   - Implement timestamp-based resolution

2. **Username Updates**
   - Allow users to change usernames
   - Maintain username history
   - Prevent username squatting

3. **User Discovery**
   - Search usernames by prefix
   - Browse all users
   - User recommendations

4. **Analytics**
   - Track registry growth
   - Monitor peer count
   - Detect network splits

## Troubleshooting

### Usernames Not Syncing?
- Check console for peer connections (`📡 New peer connection`)
- Verify peers are exchanging keys (`🔗 Added peer registry`)
- Allow time for replication (2-5 seconds typically)

### Username Taken But Can't Find It?
- Might be registered by a peer you haven't connected to yet
- Wait for more peer discoveries
- Check `getPeerCount()` to see connected peers

### Registration Failed?
- Username might be taken by a recently connected peer
- Check console for warnings
- Try a different username

## Related Files

- `src/modules/global/username-registry.js` - Main registry module
- `src/modules/user/user.js` - User management with registry integration
- `src/hooks/use-username-validation.js` - Real-time username validation
- `src/pages/Onboarding.jsx` - Uses validation hook
- `src/components/ProfileEditDialog.jsx` - Username updates
- `test-username-registry.js` - Comprehensive test script
- `test-username-registry-simple.js` - Simple test script


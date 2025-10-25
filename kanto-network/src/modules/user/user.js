import { getUserActivity } from '@/features/feed/data/activity'
import { getUserMyFeed } from '@/features/feed/data/my-feed'
import { shortPublicKey, toHex } from '@/lib/utils'
import Hyperbee from 'hyperbee'
import usernameRegistry from '../global/username-registry'
import { store } from '../pear-runtime'

export const getUserPublicKey = async () => {
  const db = await getUserDb()
  return toHex(db.core.keyPair.publicKey)
}

export const getUserDb = async () => {
  const core = store.get({
    name: 'user'
  })
  await core.ready()

  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'json'
  })

  await db.ready()

  return db
}

export const hasCompletedOnboarding = async () => {
  const db = await getUserDb()
  const profile = await db.get('onboarding')
  return Boolean(profile?.value)
}

export const setCompletedOnboarding = async () => {
  const db = await getUserDb()
  await db.put('onboarding', true)
  await db.core.update()
}

export const getUserProfile = async () => {
  const db = await getUserDb()

  const profile = await db.get('profile')

  return profile?.value || null
}

export const getUserKey = async () => {
  const db = await getUserDb()

  return {
    publicKey: toHex(db.core.publicKey),
    keyPair: db.core.keyPair
  }
}

export const setupNewUser = async (username = null) => {
  const db = await getUserDb()
  const publicKey = toHex(db.core.keyPair.publicKey)

  const profile = {
    username: username,
    displayName: '',
    shortPublicKey: shortPublicKey(publicKey),
    joinedAt: Date.now(),
    avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${publicKey}`,
    bio: '',
    location: '',
    website: ''
  }

  await db.put('profile', profile)
  await db.update()

  // Publish my feed and activity keys for discovery by followers
  const myFeed = await getUserMyFeed()
  const myActivity = await getUserActivity()
  await db.put('feeds', {
    posts: { key: myFeed.key, discoveryKey: myFeed.discoveryKey },
    activity: { key: myActivity.key, discoveryKey: myActivity.discoveryKey }
  })
  await db.update()

  // Register username in global registry
  if (username) {
    console.log(`📝 Registering username "${username}" in global registry...`)
    const registered = await usernameRegistry.registerUsername(username, {
      publicKey,
      displayName: profile.displayName,
      avatar: profile.avatar,
      joinedAt: profile.joinedAt
    })

    if (!registered) {
      console.warn(
        `⚠️ Username "${username}" could not be registered (might be taken by another peer)`
      )
      // In a production app, you might want to handle this case
      // For now, the user keeps the username locally but it's not globally registered
    }
  }

  return profile
}

export const updateUserProfile = async (updates) => {
  const db = await getUserDb()
  const currentProfile = await db.get('profile')

  if (!currentProfile?.value) {
    throw new Error('Profile not found')
  }

  const updatedProfile = {
    ...currentProfile.value,
    ...updates,
    updatedAt: Date.now()
  }

  await db.put('profile', updatedProfile)
  await db.update()

  // If username changed, register in global registry
  if (updates.username && updates.username !== currentProfile.value.username) {
    console.log(
      `📝 Registering new username "${updates.username}" in global registry...`
    )
    const publicKey = toHex(db.core.keyPair.publicKey)

    const registered = await usernameRegistry.registerUsername(
      updates.username,
      {
        publicKey,
        displayName: updatedProfile.displayName,
        avatar: updatedProfile.avatar,
        joinedAt: updatedProfile.joinedAt
      }
    )

    if (!registered) {
      throw new Error(`Username "${updates.username}" is already taken`)
    }
  }

  return updatedProfile
}

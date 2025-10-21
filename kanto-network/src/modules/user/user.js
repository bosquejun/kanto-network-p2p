import { shortPublicKey, toHex } from '@/lib/utils'
import Hyperbee from 'hyperbee'
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
  const db = await getDb()

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

  return updatedProfile
}

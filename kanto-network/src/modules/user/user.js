import { shortPublicKey, toBuffer, toHex } from '@/lib/utils'
import Hyperbee from 'hyperbee'
import { store } from '../pear-runtime'

const getDb = async () => {
  const core = store.get({
    name: 'user'
  })
  await core.ready()

  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: {
      encode: (val) => toBuffer(JSON.stringify(val)),
      decode: (buf) => JSON.parse(buf.toString())
    }
  })

  await db.ready()

  return db
}

export const hasCompletedOnboarding = async () => {
  const db = await getDb()
  const profile = await db.get('onboarding')
  return Boolean(profile?.value)
}

export const setCompletedOnboarding = async () => {
  const db = await getDb()
  await db.put('onboarding', true)
  await db.core.update()
}

export const getUserProfile = async () => {
  const db = await getDb()

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
  const db = await getDb()
  const publicKey = toHex(db.core.keyPair.publicKey)

  const profile = {
    username: username,
    shortPublicKey: shortPublicKey(publicKey),
    joinedAt: Date.now(),
    avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${publicKey}`
  }

  await db.put('profile', profile)

  await db.update()

  return profile
}

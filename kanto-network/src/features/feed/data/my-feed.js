import { fromHex, toHex } from '@/lib/utils'
import { store, swarm } from '@/modules/pear-runtime'
import { getUserPublicKey } from '@/modules/user/user'
import Hyperbee from 'hyperbee'

export const getUserMyFeed = async () => {
  const core = store.get({
    name: 'user.myFeed'
  })
  await core.ready()

  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'json'
  })

  await db.ready()

  return {
    db,
    key: toHex(core.key),
    discoveryKey: toHex(core.discoveryKey),
    core: db.core
  }
}

export const initUserMyFeed = async () => {
  const { core } = await getUserMyFeed()

  const discovery = swarm.join(core.discoveryKey)
  await discovery.flushed()

  console.log('Initialized user my feed')
}

// Helpers
const nowMs = () => Date.now()
const randomId = () => Math.random().toString(36).slice(2, 10)
const postKey = (createdAt, id) => `post:${createdAt}:${id}`

/**
 * Create a text-based post in the user's feed
 * @param {string} text
 * @param {object} extra optional metadata
 * @returns {Promise<object>} stored post
 */
export const createTextPost = async (text, extra = {}) => {
  if (!text || typeof text !== 'string') throw new Error('text is required')
  const { db, key: feedKeyHex } = await getUserMyFeed()
  const createdAt = nowMs()
  const id = randomId()
  const key = postKey(createdAt, id)
  const authorKeyHex = await getUserPublicKey()
  const post = {
    id,
    type: 'text',
    text,
    createdAt,
    authorKeyHex,
    feedKeyHex,
    ...extra
  }
  await db.put(key, post)
  await db.core.update()
  return post
}

/**
 * List this user's posts (newest first by default)
 * @param {object} opts { limit?: number, reverse?: boolean }
 */
export const listMyPosts = async (opts = {}) => {
  const { limit = 50, reverse = true } = opts
  const { db } = await getUserMyFeed()
  const posts = []
  const prefix = 'post:'
  const stream = db.createReadStream({
    gte: prefix,
    lt: `${prefix}\uFFFF`,
    reverse,
    limit
  })
  for await (const node of stream) {
    posts.push({ key: node.key, ...node.value })
  }
  return posts
}

export const getMyFeedKeys = async () => {
  const { key, discoveryKey } = await getUserMyFeed()
  return { key, discoveryKey }
}

export const openFeedByKey = async (hexKey) => {
  const core = store.get({ key: fromHex(hexKey) })
  await core.ready()
  const db = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await db.ready()
  // Ensure discovery is joined so remote cores can replicate
  const discovery = swarm.join(core.discoveryKey)
  await discovery.flushed()
  return db
}

export const followFeed = async ({ keyHex, discoveryKeyHex }) => {
  const core = store.get({ key: fromHex(keyHex) })
  await core.ready()
  const db = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await db.ready()
  if (discoveryKeyHex) {
    const discovery = swarm.join(fromHex(discoveryKeyHex))
    await discovery.flushed()
  }
  return db
}

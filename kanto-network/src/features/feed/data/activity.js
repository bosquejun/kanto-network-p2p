import { fromHex, toHex } from '@/lib/utils'
import { store, swarm } from '@/modules/pear-runtime'
import { getUserPublicKey } from '@/modules/user/user'
import Hyperbee from 'hyperbee'

export const getUserActivity = async () => {
  const core = store.get({ name: 'sparks-echoes-wall' })
  await core.ready()
  const db = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await db.ready()
  return {
    core: db.core,
    db,
    key: toHex(core.key),
    discoveryKey: toHex(core.discoveryKey)
  }
}

export const initUserActivity = async () => {
  const { db } = await getUserActivity()
  const discovery = swarm.join(db.discoveryKey)
  await discovery.flushed()
  console.log('Initialized user activity')
}

const nowMs = () => Date.now()
const likeKey = (postKey, likerKeyHex) => `like:${postKey}:${likerKeyHex}`
const commentKey = (ts, id, postKey) => `cmt:${postKey}:${ts}:${id}`
const rnd = () => Math.random().toString(36).slice(2, 10)

export const toggleLikePost = async ({ postAuthorKeyHex, postKey }) => {
  const { db } = await getUserActivity()
  const likerKeyHex = await getUserPublicKey()
  const key = likeKey(postKey, likerKeyHex)
  const existing = await db.get(key)
  if (existing) {
    await db.del(key)
    await db.core.update()
    return { liked: false, prevented: false }
  }
  const ts = nowMs()
  await db.put(key, {
    type: 'like',
    ts,
    postAuthorKeyHex,
    postKey,
    likerKeyHex
  })
  await db.core.update()
  return { liked: true, prevented: false }
}

export const commentOnPost = async ({ postAuthorKeyHex, postKey, text }) => {
  const { db } = await getUserActivity()
  const ts = nowMs()
  const id = rnd()
  const key = commentKey(ts, id, postKey)
  const commenterKeyHex = await getUserPublicKey()
  await db.put(key, {
    type: 'comment',
    ts,
    postAuthorKeyHex,
    postKey,
    text,
    commenterKeyHex
  })
  await db.core.update()
}

export const listMyActivity = async ({ limit = 100, reverse = true } = {}) => {
  const { db } = await getUserActivity()
  const out = []
  const prefix = 'act:'
  for await (const node of db.createReadStream({
    gte: prefix,
    lt: `${prefix}\uFFFF`,
    reverse,
    limit
  })) {
    out.push({ key: node.key, ...node.value })
  }
  return out
}

export const openActivityDbByKey = async (hexKey) => {
  const core = store.get({ key: fromHex(hexKey) })
  await core.ready()
  const db = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await db.ready()
  return db
}

// Local-only helpers to query likes/comments for a post
export const getLocalLikesCountForPost = async (postKey) => {
  const { db } = await getUserActivity()
  const prefix = `like:${postKey}:`
  let count = 0
  for await (const node of db.createReadStream({
    gte: prefix,
    lt: `${prefix}\uFFFF`
  })) {
    if (node.value?.type === 'like') count++
  }
  return count
}

export const getLocalLikedStateForPost = async (postKey) => {
  const { db } = await getUserActivity()
  const likerKeyHex = await getUserPublicKey()
  const key = likeKey(postKey, likerKeyHex)
  const existing = await db.get(key)
  return Boolean(existing)
}

export const getLocalLatestCommentsForPost = async (postKey, limit = 2) => {
  const { db } = await getUserActivity()
  const prefix = `cmt:${postKey}:`
  const comments = []
  for await (const node of db.createReadStream({
    gte: prefix,
    lt: `${prefix}\uFFFF`,
    reverse: true
  })) {
    const v = node.value
    if (v?.type === 'comment') {
      comments.push({ key: node.key, ...v })
      if (comments.length >= limit) break
    }
  }
  return comments
}

export const getLocalRepliesCountForPost = async (postKey) => {
  const { db } = await getUserActivity()
  const prefix = `cmt:${postKey}:`
  let count = 0
  for await (const node of db.createReadStream({
    gte: prefix,
    lt: `${prefix}\uFFFF`
  })) {
    if (node.value?.type === 'comment') count++
  }
  return count
}

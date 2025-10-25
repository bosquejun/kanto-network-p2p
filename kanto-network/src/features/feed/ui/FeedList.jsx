import { listMyPosts } from '@/features/feed/data/my-feed'
import PostCard from '@/features/feed/ui/PostCard'
import { useEffect, useState } from 'react'

function FeedList({ refreshToken = 0, section = 'global' }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        // For now, show own posts for all sections until aggregation is added
        const items = await listMyPosts({ limit: 100 })
        if (!cancelled) setPosts(items)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [refreshToken, section])

  if (loading) {
    return <div className='p-4 text-muted-foreground'>Loading posts...</div>
  }

  if (posts.length === 0) {
    return <div className='p-4 text-muted-foreground'>No posts yet.</div>
  }

  return (
    <div className='space-y-3'>
      {posts.map((post) => (
        <PostCard key={post.key} post={post} />
      ))}
    </div>
  )
}

export default FeedList

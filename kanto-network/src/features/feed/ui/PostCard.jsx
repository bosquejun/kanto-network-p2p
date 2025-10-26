import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/UserContext'
import {
  getLocalLikedStateForPost,
  getLocalLikesCountForPost,
  getLocalRepliesCountForPost,
  toggleLikePost
} from '@/features/feed/data/activity'
import { getMyFeedKeys } from '@/features/feed/data/my-feed'
import LikeButton from '@/features/feed/ui/shared/LikeButton'
import { relativeTime } from '@/lib/utils'
import { Flame, Megaphone, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function PostCard({ post }) {
  const { profile } = useUser()
  const navigate = useNavigate()
  const [likes, setLikes] = useState(0)
  const [repliesCount, setRepliesCount] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [liked, setLiked] = useState(false)
  const [resolvedFeedKeyHex, setResolvedFeedKeyHex] = useState(
    post.feedKeyHex || ''
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [count, likedState, replyCount] = await Promise.all([
        getLocalLikesCountForPost(post.key),
        getLocalLikedStateForPost(post.key),
        getLocalRepliesCountForPost(post.key)
      ])
      if (!cancelled) {
        setLikes(count)
        setRepliesCount(replyCount)
        setLiked(likedState)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [post.key])

  useEffect(() => {
    let cancelled = false
    if (post.feedKeyHex) return
    const resolve = async () => {
      try {
        const { key } = await getMyFeedKeys()
        if (!cancelled) setResolvedFeedKeyHex(key)
      } catch {
        // ignore
      }
    }
    resolve()
    return () => {
      cancelled = true
    }
  }, [post.feedKeyHex])

  const onLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      const res = await toggleLikePost({
        postAuthorKeyHex: post.authorKeyHex || null,
        postKey: post.key
      })
      setLiked(res.liked)
      setLikes((v) => v + (res.liked ? 1 : -1))
    } finally {
      setIsLiking(false)
    }
  }

  const onCardClick = () => {
    if (!resolvedFeedKeyHex) return
    navigate(
      `/feed/${encodeURIComponent(resolvedFeedKeyHex)}/posts/${encodeURIComponent(post.key)}`
    )
  }

  return (
    <div
      className='p-4 bg-card rounded-xl border shadow-sm cursor-pointer'
      onClick={onCardClick}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onCardClick()
      }}
    >
      <div className='flex gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={profile?.avatar} alt={profile?.username} />
          <AvatarFallback>
            {(profile?.username || 'U').slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <Link
              to={`/profile`}
              className='font-semibold hover:underline'
              onClick={(e) => e.stopPropagation()}
            >
              {profile?.username || profile?.shortPublicKey}
            </Link>
            <div className='text-xs text-muted-foreground'>
              {relativeTime(post.createdAt)}
            </div>
          </div>
          <div className='mt-2 text-[15px] leading-6 whitespace-pre-wrap'>
            {post.text}
          </div>
          <div className='mt-3 flex items-center gap-6 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Flame className='h-4 w-4' />
              <span>{likes}</span>
            </div>
            <div className='flex items-center gap-1'>
              <MessageCircle className='h-4 w-4' />
              <span>{repliesCount}</span>
            </div>
          </div>

          <div className='mt-2 flex items-center gap-2 w-full'>
            <LikeButton
              variantWhenIdle='outline'
              variantWhenLiked='outline'
              liked={liked}
              count={likes}
              onToggle={(e) => {
                e.stopPropagation()
                onLike()
              }}
              disabled={isLiking}
            />
            <Button
              variant='outline'
              onClick={(e) => {
                e.stopPropagation()
                onCardClick()
              }}
            >
              Reply
            </Button>
            <Button
              variant='outline'
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Echo action
              }}
            >
              <Megaphone />
              Echo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostCard

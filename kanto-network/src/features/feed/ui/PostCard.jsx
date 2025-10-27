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
import { cn, relativeTime, shortPublicKey } from '@/lib/utils'
import usernameRegistry from '@/modules/global/username-registry'
import { getUserPublicKey } from '@/modules/user/user'
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
  const [authorData, setAuthorData] = useState(null)
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

  useEffect(() => {
    let cancelled = false
    const fetchAuthorData = async () => {
      try {
        // Get the author key - either from post or current user
        let authorKey = post.authorKeyHex
        if (!authorKey) {
          // If no author key on post, it's the current user's post
          authorKey = await getUserPublicKey()
        }

        if (authorKey) {
          const userData = await usernameRegistry.lookupByPublicKey(authorKey)
          if (!cancelled && userData) {
            console.log(
              `✅ PostCard: Updated author data for ${authorKey.slice(0, 8)}:`,
              userData
            )
            setAuthorData(userData)
          }
        }
      } catch (err) {
        console.error('Error looking up post author:', err)
      }
    }
    fetchAuthorData()

    // Listen for registry updates
    const unsubscribe = usernameRegistry.onUpdate((registryKeyHex) => {
      console.log(
        `🔄 PostCard: Registry ${registryKeyHex.slice(0, 8)}... updated, refetching author data`
      )
      // Refetch author data when any registry updates
      fetchAuthorData()
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [post.authorKeyHex, profile?.updatedAt])

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
    } catch (error) {
      console.error('Error toggling like:', error)
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

  // Get author display name in priority order: displayName → username → shortPublicKey
  const getAuthorName = () => {
    if (authorData?.displayName) return authorData.displayName
    if (authorData?.username) return authorData.username
    if (post.authorKeyHex) return shortPublicKey(post.authorKeyHex)
    // Fallback to current user's profile if it's their own post
    return profile?.username || profile?.shortPublicKey || 'Anonymous'
  }

  const getAuthorAvatar = () => {
    // Use avatar from registry if available
    if (authorData?.avatar) return authorData.avatar
    // Fallback to generated avatar based on public key
    const authorKey = post.authorKeyHex
    if (authorKey) {
      return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${authorKey}`
    }
    // Final fallback to current user's avatar
    return profile?.avatar
  }

  const authorName = getAuthorName()
  const authorAvatar = getAuthorAvatar()

  return (
    <div className='p-4 bg-card rounded-xl border shadow-sm'>
      <div className='flex gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={authorAvatar} alt={authorName} />
          <AvatarFallback>
            {(authorName || 'U').slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <Link to={`/profile`} className='font-semibold hover:underline'>
                {authorName}
              </Link>
              <div className='text-xs text-muted-foreground'>
                {relativeTime(post.createdAt)}
              </div>
            </div>
            <Button
              size='sm'
              variant='ghost'
              className='text-primary text-xs'
              onClick={onCardClick}
              aria-label='View post'
            >
              View
            </Button>
          </div>
          <div className='mt-2 text-[15px] leading-6 whitespace-pre-wrap'>
            {post.text}
          </div>
          <div className='mt-3 flex items-center gap-6 text-sm text-muted-foreground border-b pb-2'>
            <div
              className={cn('flex items-center gap-1', {
                'text-primary': liked,
                'text-muted-foreground': !liked
              })}
            >
              <Flame className='h-4 w-4' />
              <span>{likes}</span>
            </div>
            <div
              className={cn('flex items-center gap-1', {
                'text-primary': repliesCount,
                'text-muted-foreground': !repliesCount
              })}
            >
              <MessageCircle className='h-4 w-4' />
              <span>{repliesCount}</span>
            </div>
          </div>

          <div className='mt-2 flex items-center gap-2'>
            <LikeButton
              className='flex-1'
              variantWhenIdle='ghost'
              variantWhenLiked='sparked'
              liked={liked}
              onToggle={onLike}
              disabled={isLiking}
              label={liked ? 'Sparked' : 'Spark'}
            />
            <Button className='flex-1' variant='ghost' onClick={onCardClick}>
              <MessageCircle />
              Reply
            </Button>
            <Button
              className='flex-1'
              disabled
              variant='ghost'
              onClick={() => {
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

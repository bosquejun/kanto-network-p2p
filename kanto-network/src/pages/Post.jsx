import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useUser } from '@/context/UserContext'
import {
  commentOnPost,
  getLocalLatestCommentsForPost,
  getLocalLikedStateForPost,
  getLocalLikesCountForPost,
  toggleLikePost
} from '@/features/feed/data/activity'
import { getUserMyFeed, openFeedByKey } from '@/features/feed/data/my-feed'
import CommentForm from '@/features/feed/ui/shared/CommentForm'
import CommentList from '@/features/feed/ui/shared/CommentList'
import LikeButton from '@/features/feed/ui/shared/LikeButton'
import { cn, relativeTime, shortPublicKey } from '@/lib/utils'
import usernameRegistry from '@/modules/global/username-registry'
import { getUserPublicKey } from '@/modules/user/user'
import { ChevronLeft, Flame, Megaphone, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function Post() {
  const { postKey, feedKeyHex: feedKey } = useParams()
  const { profile } = useUser()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [liked, setLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [authorData, setAuthorData] = useState(null)
  const [sidebarRegistryData, setSidebarRegistryData] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        let db = null
        if (feedKey) {
          db = await openFeedByKey(feedKey)
        } else {
          const mine = await getUserMyFeed()
          db = mine.db
        }
        let v = null
        if (postKey) {
          const node = await db.get(postKey)
          v = node?.value || null
        }
        const [count, latest, likedState] = await Promise.all([
          postKey ? getLocalLikesCountForPost(postKey) : Promise.resolve(0),
          postKey
            ? getLocalLatestCommentsForPost(postKey, 20)
            : Promise.resolve([]),
          postKey ? getLocalLikedStateForPost(postKey) : Promise.resolve(false)
        ])
        if (!cancelled) {
          setPost(v)
          setLikes(count)
          setComments(latest)
          setLiked(likedState)
        }
      } catch {
        if (!cancelled) {
          setPost(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [feedKey, postKey])

  useEffect(() => {
    let cancelled = false
    const fetchAuthorData = async () => {
      // Use post's authorKeyHex if available, otherwise fallback to feedKey
      const authorKey = post?.authorKeyHex || feedKey
      if (authorKey) {
        try {
          const userData = await usernameRegistry.lookupByPublicKey(authorKey)
          if (!cancelled && userData) {
            setAuthorData(userData)
          }
        } catch (err) {
          console.error('Error looking up post author:', err)
        }
      }
    }
    fetchAuthorData()

    // Listen for registry updates
    const unsubscribe = usernameRegistry.onUpdate(() => {
      // Refetch author data when any registry updates
      fetchAuthorData()
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [post?.authorKeyHex, feedKey])

  // Fetch current user's registry data for sidebar (refetch when profile changes)
  useEffect(() => {
    let cancelled = false
    const fetchSidebarRegistryData = async () => {
      try {
        const publicKey = await getUserPublicKey()
        if (publicKey) {
          const userData = await usernameRegistry.lookupByPublicKey(publicKey)
          if (!cancelled && userData) {
            setSidebarRegistryData(userData)
          }
        }
      } catch (err) {
        console.error('Error fetching sidebar registry data:', err)
      }
    }
    fetchSidebarRegistryData()

    // Listen for registry updates
    const unsubscribe = usernameRegistry.onUpdate(() => {
      // Refetch sidebar data when any registry updates
      fetchSidebarRegistryData()
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [profile?.updatedAt])

  const onLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      const authorKey = post?.authorKeyHex || feedKey
      const res = await toggleLikePost({ postAuthorKeyHex: authorKey, postKey })
      setLiked(res.liked)
      setLikes((v) => v + (res.liked ? 1 : -1))
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const onComment = async (e) => {
    e?.preventDefault?.()
    if (!commentText.trim()) return
    const authorKey = post?.authorKeyHex || feedKey
    await commentOnPost({
      postAuthorKeyHex: authorKey,
      postKey,
      text: commentText.trim()
    })
    setCommentText('')
    const latest = await getLocalLatestCommentsForPost(postKey, 20)
    setComments(latest)
  }

  // Get sidebar display info
  const getSidebarDisplayInfo = () => {
    if (sidebarRegistryData?.displayName) {
      return {
        primary: sidebarRegistryData.displayName,
        secondary: sidebarRegistryData.username
          ? `@${sidebarRegistryData.username}`
          : null
      }
    }
    if (sidebarRegistryData?.username) {
      return {
        primary: sidebarRegistryData.username,
        secondary: profile?.shortPublicKey
      }
    }
    // Fallback to local profile
    if (profile?.username) {
      return {
        primary: profile.username,
        secondary: profile?.shortPublicKey
      }
    }
    return {
      primary: profile?.shortPublicKey || 'Anonymous',
      secondary: null
    }
  }

  const getSidebarAvatar = () => {
    if (sidebarRegistryData?.avatar) return sidebarRegistryData.avatar
    return profile?.avatar
  }

  const sidebarDisplayInfo = getSidebarDisplayInfo()
  const sidebarAvatar = getSidebarAvatar()

  // Get author display name in priority order: displayName → username → shortPublicKey
  const getAuthorName = () => {
    if (authorData?.displayName) return authorData.displayName
    if (authorData?.username) return authorData.username
    const authorKey = post?.authorKeyHex || feedKey
    if (authorKey) return shortPublicKey(authorKey)
    // Fallback to current user's profile if it's their own post
    return profile?.username || profile?.shortPublicKey || 'Anonymous'
  }

  const getAuthorAvatar = () => {
    // Use avatar from registry if available
    if (authorData?.avatar) return authorData.avatar
    // Fallback to generated avatar based on public key
    const authorKey = post?.authorKeyHex || feedKey
    if (authorKey) {
      return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${authorKey}`
    }
    // Final fallback to current user's avatar
    return profile?.avatar
  }

  const authorName = getAuthorName()
  const authorAvatar = getAuthorAvatar()

  if (loading)
    return (
      <div className='container p-4'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* LEFT: Corner Host card */}
          <aside className='md:col-span-3 space-y-4'>
            <div className='sticky top-6 backdrop-blur supports-[backdrop-filter]:bg-background/70 border rounded-xl shadow-sm p-4'>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full bg-muted overflow-hidden'>
                  {sidebarAvatar && (
                    <img
                      className='h-full w-full object-cover'
                      src={sidebarAvatar}
                      alt={sidebarDisplayInfo.primary}
                    />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='font-semibold truncate'>
                    {sidebarDisplayInfo.primary}
                  </div>
                  <div className='text-xs text-muted-foreground truncate'>
                    {sidebarDisplayInfo.secondary || 'Corner Host'}
                  </div>
                </div>
              </div>
              <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
                <div className='p-2 rounded-md border bg-card'>
                  <div className='text-xs text-muted-foreground'>Neighbors</div>
                  <div className='font-medium'>0</div>
                </div>
                <div className='p-2 rounded-md border bg-card'>
                  <div className='text-xs text-muted-foreground'>
                    Linked Corners
                  </div>
                  <div className='font-medium'>0</div>
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER: Post content */}
          <main className='md:col-span-6 space-y-4'>
            {/* Back button skeleton */}
            <div className='h-10 w-24 rounded bg-muted animate-pulse' />

            {/* Post card skeleton */}
            <Card className='p-4 space-y-3'>
              <div className='flex items-start gap-3'>
                <div className='h-10 w-10 rounded-full bg-muted animate-pulse' />
                <div className='flex-1 space-y-3'>
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-32 rounded bg-muted animate-pulse' />
                    <div className='h-3 w-16 rounded bg-muted animate-pulse' />
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 w-full rounded bg-muted animate-pulse' />
                    <div className='h-4 w-4/5 rounded bg-muted animate-pulse' />
                    <div className='h-4 w-3/4 rounded bg-muted animate-pulse' />
                  </div>
                  {/* Stats skeleton */}
                  <div className='flex items-center gap-6 pt-2 border-b pb-2'>
                    <div className='h-4 w-12 rounded bg-muted animate-pulse' />
                    <div className='h-4 w-12 rounded bg-muted animate-pulse' />
                  </div>
                  {/* Action buttons skeleton */}
                  <div className='flex items-center gap-2'>
                    <div className='h-9 flex-1 rounded bg-muted animate-pulse' />
                    <div className='h-9 flex-1 rounded bg-muted animate-pulse' />
                    <div className='h-9 flex-1 rounded bg-muted animate-pulse' />
                  </div>
                </div>
              </div>
            </Card>

            {/* Comments section skeleton */}
            <Card className='p-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='h-6 w-24 rounded bg-muted animate-pulse' />
                <div className='h-4 w-16 rounded bg-muted animate-pulse' />
              </div>
              <div className='h-20 w-full rounded bg-muted animate-pulse' />
              <div className='space-y-3'>
                <div className='flex gap-3'>
                  <div className='h-8 w-8 rounded-full bg-muted animate-pulse' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 w-32 rounded bg-muted animate-pulse' />
                    <div className='h-4 w-full rounded bg-muted animate-pulse' />
                  </div>
                </div>
                <div className='flex gap-3'>
                  <div className='h-8 w-8 rounded-full bg-muted animate-pulse' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 w-28 rounded bg-muted animate-pulse' />
                    <div className='h-4 w-full rounded bg-muted animate-pulse' />
                  </div>
                </div>
              </div>
            </Card>
          </main>

          {/* RIGHT: Placeholder */}
          <aside className='md:col-span-3 hidden md:block'>
            <div className='sticky top-16 border rounded-xl shadow-sm p-4 bg-card'>
              <div className='text-sm text-muted-foreground'>
                Community Blocks — coming soon
              </div>
            </div>
          </aside>
        </div>
      </div>
    )
  if (!post) return <div className='container p-4'>Post not found.</div>

  return (
    <div className='container p-4'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* LEFT: Corner Host card */}
        <aside className='md:col-span-3 space-y-4'>
          <div className='sticky top-6 backdrop-blur supports-[backdrop-filter]:bg-background/70 border rounded-xl shadow-sm p-4'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-full bg-muted overflow-hidden'>
                {sidebarAvatar && (
                  <img
                    className='h-full w-full object-cover'
                    src={sidebarAvatar}
                    alt={sidebarDisplayInfo.primary}
                  />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='font-semibold truncate'>
                  {sidebarDisplayInfo.primary}
                </div>
                <div className='text-xs text-muted-foreground truncate'>
                  {sidebarDisplayInfo.secondary || 'Corner Host'}
                </div>
              </div>
            </div>
            <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
              <div className='p-2 rounded-md border bg-card'>
                <div className='text-xs text-muted-foreground'>Neighbors</div>
                <div className='font-medium'>0</div>
              </div>
              <div className='p-2 rounded-md border bg-card'>
                <div className='text-xs text-muted-foreground'>
                  Linked Corners
                </div>
                <div className='font-medium'>0</div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: Post content */}
        <main className='md:col-span-6 space-y-4'>
          {/* Sticky back button */}
          <div className='sticky top-0 z-10 -mx-4 md:mx-0 border-b py-2 px-1 backdrop-blur supports-[backdrop-filter]:bg-background/70'>
            <Button
              variant='ghost'
              onClick={() => navigate(-1)}
              className='text-primary'
            >
              <ChevronLeft />
              Back
            </Button>
          </div>
          <Card className='p-4'>
            <div className='flex items-start gap-3'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback>
                  {(authorName || 'U').slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <div className='font-semibold'>{authorName}</div>
                  <div className='text-xs text-muted-foreground'>
                    {relativeTime(post.createdAt)}
                  </div>
                </div>
                <div className='mt-2 whitespace-pre-wrap text-[15px] leading-6'>
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
                      'text-primary': comments.length > 0,
                      'text-muted-foreground': comments.length === 0
                    })}
                  >
                    <MessageCircle className='h-4 w-4' />
                    <span>{comments.length}</span>
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
                  <Button
                    className='flex-1'
                    variant='ghost'
                    onClick={() => {
                      // Focus on comment form
                      document.querySelector('textarea')?.focus()
                    }}
                  >
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
          </Card>

          <Card className='p-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Replies</h3>
              <div className='text-sm text-muted-foreground'>
                {comments.length} total
              </div>
            </div>
            <CommentForm
              value={commentText}
              onChange={setCommentText}
              onSubmit={onComment}
            />
            <CommentList comments={comments} emptyText='No replies yet.' />
          </Card>
        </main>

        {/* RIGHT: Placeholder */}
        <aside className='md:col-span-3 hidden md:block'>
          <div className='sticky top-16 border rounded-xl shadow-sm p-4 bg-card'>
            <div className='text-sm text-muted-foreground'>
              Community Blocks — coming soon
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Post

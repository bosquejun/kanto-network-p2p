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
import FeedSidebar from '@/features/feed/ui/FeedSidebar'
import CommentForm from '@/features/feed/ui/shared/CommentForm'
import CommentList from '@/features/feed/ui/shared/CommentList'
import { relativeTime } from '@/lib/utils'
import { Flame } from 'lucide-react'
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
  const [section, setSection] = useState('mine')

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

  const onLike = async () => {
    const res = await toggleLikePost({ postAuthorKeyHex: feedKey, postKey })
    setLiked(res.liked)
    setLikes((v) => v + (res.liked ? 1 : -1))
  }

  const onComment = async (e) => {
    e?.preventDefault?.()
    if (!commentText.trim()) return
    await commentOnPost({
      postAuthorKeyHex: feedKey,
      postKey,
      text: commentText.trim()
    })
    setCommentText('')
    const latest = await getLocalLatestCommentsForPost(postKey, 20)
    setComments(latest)
  }

  if (loading)
    return (
      <div className='container p-4 md:p-6'>
        <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
          <aside className='md:col-span-3 hidden md:block space-y-4'>
            <div className='sticky top-16 backdrop-blur supports-[backdrop-filter]:bg-background/70 border rounded-xl shadow-sm p-4'>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full bg-muted overflow-hidden'>
                  {profile?.avatar && (
                    <img
                      className='h-full w-full object-cover'
                      src={profile.avatar}
                      alt={profile?.username}
                    />
                  )}
                </div>
                <div>
                  <div className='font-semibold'>
                    {profile?.username || profile?.shortPublicKey}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Corner Host
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
            {/* Removed legacy tabs sidebar; sticky tabs exist in main section */}
          </aside>
          <div className='md:col-span-9 space-y-4'>
            <Card className='p-4 space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-full bg-muted animate-pulse' />
                <div className='h-4 w-40 rounded bg-muted animate-pulse' />
              </div>
              <div className='h-4 w-3/4 rounded bg-muted animate-pulse' />
              <div className='h-4 w-2/3 rounded bg-muted animate-pulse' />
            </Card>
            <Card className='p-4 space-y-2'>
              <div className='h-5 w-28 rounded bg-muted animate-pulse' />
              <div className='h-10 w-full rounded bg-muted animate-pulse' />
              <div className='h-10 w-full rounded bg-muted animate-pulse' />
            </Card>
          </div>
        </div>
      </div>
    )
  if (!post) return <div className='container p-4'>Post not found.</div>

  return (
    <div className='container p-4 md:p-6'>
      <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
        <div className='md:col-span-3 hidden md:block'>
          <FeedSidebar active={'global'} onChange={() => {}} />
        </div>
        <div className='md:col-span-9 space-y-4'>
          {/* Sticky tab bar */}
          <div className='sticky top-0 z-10 -mx-4 md:mx-0 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b'>
            <div className='px-4 md:px-0 py-2 flex gap-2'>
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  section === 'mine'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('mine')}
              >
                My Corner
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  section === 'following'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('following')}
              >
                Linked Corners
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  section === 'global'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('global')}
              >
                The Neighborhood
              </button>
            </div>
          </div>
          <div>
            <button
              onClick={() => navigate(-1)}
              className='text-sm text-primary hover:underline'
            >
              ← Back
            </button>
          </div>
          <Card className='p-4'>
            <div className='flex items-start gap-3'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={profile?.avatar} alt={profile?.username} />
                <AvatarFallback>
                  {(profile?.username || 'U').slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <div className='font-semibold'>
                    {profile?.username || profile?.shortPublicKey}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {relativeTime(post.createdAt)}
                  </div>
                </div>
                <div className='mt-2 whitespace-pre-wrap text-[15px] leading-6'>
                  {post.text}
                </div>
                <div className='mt-3'>
                  <Button
                    size='sm'
                    variant={liked ? 'default' : 'outline'}
                    onClick={onLike}
                    className='flex items-center gap-1'
                    aria-pressed={liked}
                    aria-label={liked ? 'Unlike' : 'Like'}
                  >
                    <Flame
                      className={
                        liked ? 'h-4 w-4 text-primary  fill-current' : 'h-4 w-4'
                      }
                    />
                    <span>{likes}</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className='p-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Echoes</h3>
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
        </div>
      </div>
    </div>
  )
}

export default Post

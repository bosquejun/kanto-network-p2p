import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUser } from '@/context/UserContext'
import {
  commentOnPost,
  getLocalLatestCommentsForPost,
  getLocalLikedStateForPost,
  getLocalLikesCountForPost,
  toggleLikePost
} from '@/features/feed/data/activity'
import { getMyFeedKeys } from '@/features/feed/data/my-feed'
import CommentForm from '@/features/feed/ui/shared/CommentForm'
import CommentList from '@/features/feed/ui/shared/CommentList'
import LikeButton from '@/features/feed/ui/shared/LikeButton'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function PostCard({ post }) {
  const { profile } = useUser()
  const [likes, setLikes] = useState(0)
  const [latestComments, setLatestComments] = useState([])
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [liked, setLiked] = useState(false)
  const [resolvedFeedKeyHex, setResolvedFeedKeyHex] = useState(
    post.feedKeyHex || ''
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [count, comments, likedState] = await Promise.all([
        getLocalLikesCountForPost(post.key),
        getLocalLatestCommentsForPost(post.key, 2),
        getLocalLikedStateForPost(post.key)
      ])
      if (!cancelled) {
        setLikes(count)
        setLatestComments(comments)
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

  const onComment = async (e) => {
    e?.preventDefault?.()
    if (!commentText.trim() || isCommenting) return
    setIsCommenting(true)
    try {
      await commentOnPost({
        postAuthorKeyHex: post.authorKeyHex || null,
        postKey: post.key,
        text: commentText.trim()
      })
      setCommentText('')
      const comments = await getLocalLatestCommentsForPost(post.key, 2)
      setLatestComments(comments)
    } finally {
      setIsCommenting(false)
    }
  }

  return (
    <div className='p-4 bg-card rounded-xl border shadow-sm'>
      <div className='flex gap-3'>
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
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
          <div className='mt-2 text-[15px] leading-6 whitespace-pre-wrap'>
            {post.text}
          </div>
          <div className='mt-2'>
            {resolvedFeedKeyHex ? (
              <Link
                to={`/feed/${encodeURIComponent(resolvedFeedKeyHex)}/posts/${encodeURIComponent(post.key)}`}
                className='text-sm text-primary hover:underline'
              >
                View details
              </Link>
            ) : (
              <span className='text-sm text-muted-foreground'>
                View details
              </span>
            )}
          </div>

          <div className='mt-3 flex items-center gap-3'>
            <LikeButton
              liked={liked}
              count={likes}
              onToggle={onLike}
              disabled={isLiking}
            />
          </div>

          <div className='mt-3'>
            <CommentList comments={latestComments} />
          </div>

          <div className='mt-3'>
            <CommentForm
              value={commentText}
              onChange={setCommentText}
              onSubmit={onComment}
              disabled={isCommenting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostCard

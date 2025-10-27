import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUser } from '@/context/UserContext'
import { relativeTime, shortPublicKey } from '@/lib/utils'
import usernameRegistry from '@/modules/global/username-registry'
import { useEffect, useState } from 'react'

function CommentList({ comments, emptyText = 'No replies yet.' }) {
  const { profile } = useUser()
  const [userDataMap, setUserDataMap] = useState({})

  useEffect(() => {
    let cancelled = false
    const fetchUserData = async () => {
      if (!comments || comments.length === 0) return

      const newUserDataMap = {}
      for (const comment of comments) {
        if (comment.commenterKeyHex) {
          try {
            const userData = await usernameRegistry.lookupByPublicKey(
              comment.commenterKeyHex
            )
            if (!cancelled && userData) {
              newUserDataMap[comment.commenterKeyHex] = userData
            }
          } catch (err) {
            console.error('Error looking up user:', err)
          }
        }
      }

      if (!cancelled) {
        setUserDataMap(newUserDataMap)
      }
    }

    fetchUserData()

    // Listen for registry updates
    const unsubscribe = usernameRegistry.onUpdate(() => {
      // Refetch all commenter data when any registry updates
      fetchUserData()
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [comments, profile?.updatedAt])

  if (!comments || comments.length === 0) {
    return <div className='text-sm text-muted-foreground'>{emptyText}</div>
  }

  // Get commenter display name in priority order: displayName → username → shortPublicKey
  const getCommenterName = (comment) => {
    const userData = userDataMap[comment.commenterKeyHex]
    if (userData?.displayName) return userData.displayName
    if (userData?.username) return userData.username
    if (comment.commenterKeyHex) return shortPublicKey(comment.commenterKeyHex)
    return 'Anonymous'
  }

  // Get commenter avatar: use registry avatar if available, otherwise generate
  const getCommenterAvatar = (comment) => {
    const userData = userDataMap[comment.commenterKeyHex]
    if (userData?.avatar) return userData.avatar
    // Fallback to generated avatar
    if (comment.commenterKeyHex) {
      return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${comment.commenterKeyHex}`
    }
    return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=U`
  }

  return (
    <div className='space-y-3'>
      {comments.map((c) => {
        const commenterName = getCommenterName(c)
        const commenterAvatar = getCommenterAvatar(c)
        return (
          <div key={c.key} className='flex items-start gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={commenterAvatar} alt={commenterName} />
              <AvatarFallback>
                {(commenterName || 'U').slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-sm'>{commenterName}</span>
                <span className='text-xs text-muted-foreground'>
                  {relativeTime(c.ts)}
                </span>
              </div>
              <div className='mt-1 text-sm'>{c.text}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CommentList

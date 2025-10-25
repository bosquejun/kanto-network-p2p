import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/context/UserContext'
import { createTextPost } from '@/features/feed/data/my-feed'
import { useState } from 'react'

function FeedComposer({ onCreated = null }) {
  const { profile } = useUser()
  const [text, setText] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const canPost = text.trim().length > 0 && text.trim().length <= 500

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canPost || isPosting) return
    setIsPosting(true)
    try {
      const post = await createTextPost(text.trim())
      setText('')
      onCreated?.(post)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className='p-4 bg-card rounded-xl border shadow-sm'
    >
      <div className='flex gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={profile?.avatar} alt={profile?.username} />
          <AvatarFallback>
            {(profile?.username || 'U').slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 space-y-3'>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='What’s happening?'
            rows={3}
          />
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <div>{text.trim().length}/500</div>
            <Button type='submit' disabled={!canPost || isPosting}>
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default FeedComposer

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { shortPublicKey } from '@/lib/utils'

function CommentList({ comments, emptyText = 'No comments yet.' }) {
  if (!comments || comments.length === 0) {
    return <div className='text-sm text-muted-foreground'>{emptyText}</div>
  }
  return (
    <div className='space-y-3'>
      {comments.map((c) => (
        <div key={c.key} className='flex items-start gap-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage
              src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${
                c.commenterKeyHex || 'U'
              }`}
              alt={c.commenterKeyHex || 'commenter'}
            />
            <AvatarFallback>
              {(shortPublicKey(c.commenterKeyHex || 'U') || 'U')
                .slice(0, 1)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <div className='text-sm'>
              <span className='font-medium mr-2'>
                {c.commenterKeyHex ? shortPublicKey(c.commenterKeyHex) : 'Anon'}
              </span>
              {c.text}
            </div>
            <div className='text-xs text-muted-foreground mt-1'>
              {new Date(c.ts).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommentList

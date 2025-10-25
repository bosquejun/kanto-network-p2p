import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

function LikeButton({
  liked,
  count = 0,
  onToggle,
  disabled = false,
  size = 'sm',
  variantWhenLiked = 'ghost',
  variantWhenIdle = 'ghost'
}) {
  const variant = liked ? variantWhenLiked : variantWhenIdle
  return (
    <Button
      size={size}
      variant={variant}
      onClick={onToggle}
      disabled={disabled}
      className='flex items-center gap-1'
      aria-pressed={liked}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <Heart
        className={liked ? 'h-4 w-4 text-red-500 fill-current' : 'h-4 w-4'}
      />
      {count > 0 && <span>{count}</span>}
    </Button>
  )
}

export default LikeButton

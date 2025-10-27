import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Flame } from 'lucide-react'

function LikeButton({
  liked,
  count = 0,
  onToggle,
  disabled = false,
  size = 'sm',
  variantWhenLiked = 'ghost',
  variantWhenIdle = 'ghost',
  Icon = Flame,
  className,
  label
}) {
  const variant = liked ? variantWhenLiked : variantWhenIdle
  return (
    <Button
      size={size}
      variant={variant}
      onClick={onToggle}
      disabled={disabled}
      className={cn('flex items-center gap-1', className)}
      aria-pressed={liked}
      aria-label={liked ? 'Remove Spark' : 'Spark'}
    >
      <Icon
        className={liked ? 'h-4 w-4 text-primary fill-current' : 'h-4 w-4'}
      />
      {label && <span>{label}</span>}
      {!label && count > 0 && <span>{count}</span>}
    </Button>
  )
}

export default LikeButton

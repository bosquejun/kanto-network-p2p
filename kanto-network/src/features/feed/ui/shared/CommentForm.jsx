import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function CommentForm({ value, onChange, onSubmit, disabled = false }) {
  return (
    <form onSubmit={onSubmit} className='flex gap-2 items-center w-full'>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Write a reply'
        className='flex-1 rounded-full border bg-background'
      />
      <Button size='sm' type='submit' disabled={disabled || !value.trim()}>
        Reply
      </Button>
    </form>
  )
}

export default CommentForm

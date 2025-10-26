import { Button } from '@/components/ui/button'

function CommentForm({ value, onChange, onSubmit, disabled = false }) {
  return (
    <form onSubmit={onSubmit} className='flex gap-2'>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Write a reply'
        className='flex-1 px-3 py-2 rounded-full border bg-background'
      />
      <Button size='sm' type='submit' disabled={disabled || !value.trim()}>
        Reply
      </Button>
    </form>
  )
}

export default CommentForm

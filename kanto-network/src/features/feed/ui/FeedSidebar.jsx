import { Card } from '@/components/ui/card'

const sections = [
  { id: 'global', title: 'Global' },
  { id: 'following', title: 'Following' },
  { id: 'mine', title: 'My Posts' }
]

function FeedSidebar({ active = 'global', onChange = null }) {
  return (
    <Card className='p-2 sticky top-4'>
      <div className='space-y-1'>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange?.(s.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              active === s.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>
    </Card>
  )
}

export default FeedSidebar

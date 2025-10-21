import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { Compass } from 'lucide-react'

function Explore() {
  // Placeholder - replace with actual explore data
  const exploreItems = []

  return (
    <div className='container p-4 md:p-6'>
      <h2 className='text-xl font-semibold'>Explore</h2>
      <p className='text-muted-foreground mt-1'>
        Discover new content and connections.
      </p>

      <div className='mt-6'>
        {exploreItems.length === 0 ? (
          <Empty className='border'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Compass />
              </EmptyMedia>
              <EmptyTitle>Nothing to explore yet</EmptyTitle>
              <EmptyDescription>
                Start connecting with others to discover new content and
                connections in the network.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className='grid gap-4'>
            {exploreItems.map((item, index) => (
              <div key={index} className='p-4 bg-card rounded-lg border'>
                <h3 className='text-lg font-semibold'>{item.title}</h3>
                <p className='text-muted-foreground mt-1'>{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Explore

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { useUser } from '@/context/UserContext'
import { Home as HomeIcon, Plus } from 'lucide-react'

function Home() {
  const { profile, isProfileLoaded } = useUser()

  // Placeholder - replace with actual posts data
  const posts = []

  return (
    <div className='container p-4 md:p-6'>
      <h2 className='text-xl font-semibold'>Home</h2>
      <p className='text-muted-foreground mt-1'>
        {isProfileLoaded
          ? `Welcome, ${profile?.username || profile?.shortPublicKey}!`
          : 'Loading...'}
      </p>

      <div className='mt-6'>
        {posts.length === 0 ? (
          <Empty className='border'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <HomeIcon />
              </EmptyMedia>
              <EmptyTitle>Your feed is empty</EmptyTitle>
              <EmptyDescription>
                Start following others to see their posts here, or create your
                first post to share with the network.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>
                <Plus className='w-4 h-4 mr-2' />
                Create Your First Post
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className='space-y-4'>
            {posts.map((post, index) => (
              <div key={index} className='p-4 bg-card rounded-lg border'>
                <h3 className='text-lg font-semibold'>{post.title}</h3>
                <p className='text-muted-foreground mt-1'>{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home

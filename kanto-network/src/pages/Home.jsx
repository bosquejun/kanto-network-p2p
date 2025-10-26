import { useUser } from '@/context/UserContext'
import FeedComposer from '@/features/feed/ui/FeedComposer'
import FeedList from '@/features/feed/ui/FeedList'
import { useState } from 'react'

function Home() {
  const { profile, isProfileLoaded } = useUser()
  const [refreshToken, setRefreshToken] = useState(0)
  const [section, setSection] = useState('mine')

  // Posts list is handled by FeedList

  return (
    <div className='container p-4 md:p-6'>
      <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
        {/* LEFT: Mini Corner Host card (sticky) */}
        <aside className='md:col-span-3 space-y-4'>
          <div className='sticky top-16 backdrop-blur supports-[backdrop-filter]:bg-background/70 border rounded-xl shadow-sm p-4'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-full bg-muted overflow-hidden'>
                {profile?.avatar && (
                  <img
                    className='h-full w-full object-cover'
                    src={profile.avatar}
                    alt={profile?.username}
                  />
                )}
              </div>
              <div>
                <div className='font-semibold'>
                  {isProfileLoaded
                    ? profile?.username || profile?.shortPublicKey
                    : 'Loading...'}
                </div>
                <div className='text-xs text-muted-foreground'>Corner Host</div>
              </div>
            </div>
            <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
              <div className='p-2 rounded-md border bg-card'>
                <div className='text-xs text-muted-foreground'>Neighbors</div>
                <div className='font-medium'>0</div>
              </div>
              <div className='p-2 rounded-md border bg-card'>
                <div className='text-xs text-muted-foreground'>
                  Linked Corners
                </div>
                <div className='font-medium'>0</div>
              </div>
            </div>
          </div>

          {/* Removed legacy tabs sidebar; sticky tabs exist in main section */}
        </aside>

        {/* CENTER: Tabs, Composer, Notes list */}
        <main className='md:col-span-6 space-y-4'>
          {/* Sticky tab bar */}
          <div className='sticky top-0 z-10 -mx-4 md:mx-0 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b'>
            <div className='px-4 md:px-0 py-2 flex gap-2'>
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  section === 'mine'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('mine')}
              >
                My Corner
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  section === 'following'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('following')}
              >
                Linked Corners
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  section === 'global'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSection('global')}
              >
                The Neighborhood
              </button>
            </div>
          </div>

          {/* Note Composer */}
          <FeedComposer onCreated={() => setRefreshToken((t) => t + 1)} />

          {/* Notes list */}
          <FeedList refreshToken={refreshToken} section={section} />
        </main>

        {/* RIGHT: Placeholder column (hidden on small) */}
        <aside className='md:col-span-3 hidden md:block'>
          <div className='sticky top-16 border rounded-xl shadow-sm p-4 bg-card'>
            <div className='text-sm text-muted-foreground'>
              Community Blocks — coming soon
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Home

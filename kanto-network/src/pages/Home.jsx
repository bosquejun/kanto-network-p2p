import FeedComposer from '@/features/feed/ui/FeedComposer'
import FeedList from '@/features/feed/ui/FeedList'
import FeedSidebar from '@/features/feed/ui/FeedSidebar'
import { useState } from 'react'

function Home() {
  const [refreshToken, setRefreshToken] = useState(0)
  const [section, setSection] = useState('global')

  // Posts list is handled by FeedList

  return (
    <div className='container p-4 md:p-6'>
      {/* <h2 className='text-xl font-semibold'>Home</h2>
      <p className='text-muted-foreground mt-1'>
        {isProfileLoaded
          ? `Welcome, ${profile?.username || profile?.shortPublicKey}!`
          : 'Loading...'}
      </p> */}

      <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
        <div className='md:col-span-3'>
          <FeedSidebar active={section} onChange={setSection} />
        </div>
        <div className='md:col-span-9 space-y-4'>
          <FeedComposer onCreated={() => setRefreshToken((t) => t + 1)} />
          <FeedList refreshToken={refreshToken} section={section} />
        </div>
      </div>
    </div>
  )
}

export default Home

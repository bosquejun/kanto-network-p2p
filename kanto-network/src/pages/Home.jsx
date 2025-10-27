import { Button } from '@/components/ui/button'
import { useUser } from '@/context/UserContext'
import FeedComposer from '@/features/feed/ui/FeedComposer'
import FeedList from '@/features/feed/ui/FeedList'
import usernameRegistry from '@/modules/global/username-registry'
import { getUserPublicKey } from '@/modules/user/user'
import { useEffect, useState } from 'react'

function Home() {
  const { profile, isProfileLoaded } = useUser()
  const [refreshToken, setRefreshToken] = useState(0)
  const [section, setSection] = useState('mine')
  const [registryData, setRegistryData] = useState(null)

  // Fetch user's registry data (refetch when profile changes)
  useEffect(() => {
    let cancelled = false
    const fetchRegistryData = async () => {
      try {
        const publicKey = await getUserPublicKey()
        if (publicKey) {
          const userData = await usernameRegistry.lookupByPublicKey(publicKey)
          if (!cancelled && userData) {
            console.log(`✅ Home: Updated sidebar registry data:`, userData)
            setRegistryData(userData)
          }
        }
      } catch (err) {
        console.error('Error fetching registry data:', err)
      }
    }
    fetchRegistryData()

    // Listen for registry updates
    const unsubscribe = usernameRegistry.onUpdate((registryKeyHex) => {
      console.log(
        `🔄 Home: Registry ${registryKeyHex.slice(0, 8)}... updated, refetching sidebar data`
      )
      // Refetch registry data when any registry updates
      fetchRegistryData()
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [profile?.updatedAt])

  // Get display name and subtitle based on registry data
  const getDisplayInfo = () => {
    if (registryData?.displayName) {
      return {
        primary: registryData.displayName,
        secondary: registryData.username ? `@${registryData.username}` : null
      }
    }
    if (registryData?.username) {
      return {
        primary: registryData.username,
        secondary: profile?.shortPublicKey
      }
    }
    // Fallback to local profile
    if (profile?.username) {
      return {
        primary: profile.username,
        secondary: profile?.shortPublicKey
      }
    }
    return {
      primary: profile?.shortPublicKey || 'Anonymous',
      secondary: null
    }
  }

  const getAvatar = () => {
    if (registryData?.avatar) return registryData.avatar
    return profile?.avatar
  }

  const displayInfo = getDisplayInfo()
  const avatar = getAvatar()

  // Posts list is handled by FeedList

  return (
    <div className='container p-4'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* LEFT: Mini Corner Host card (sticky) */}
        <aside className='md:col-span-3 space-y-4'>
          <div className='sticky top-6 backdrop-blur supports-[backdrop-filter]:bg-background/70 border rounded-xl shadow-sm p-4'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-full bg-muted overflow-hidden'>
                {avatar && (
                  <img
                    className='h-full w-full object-cover'
                    src={avatar}
                    alt={displayInfo.primary}
                  />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='font-semibold truncate'>
                  {isProfileLoaded ? displayInfo.primary : 'Loading...'}
                </div>
                <div className='text-xs text-muted-foreground truncate'>
                  {displayInfo.secondary || 'Corner Host'}
                </div>
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
              <Button
                className='rounded-full'
                variant={section === 'mine' ? 'default' : 'outline'}
                onClick={() => setSection('mine')}
              >
                My Corner
              </Button>
              <Button
                disabled
                className='rounded-full'
                variant={section === 'following' ? 'default' : 'outline'}
                onClick={() => setSection('following')}
              >
                Linked Corners
              </Button>
              <Button
                disabled
                className='rounded-full'
                variant={section === 'global' ? 'default' : 'outline'}
                onClick={() => setSection('global')}
              >
                The Neighborhood
              </Button>
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

import ProfileEditDialog from '@/components/ProfileEditDialog'
import ProfileSkeleton from '@/components/ProfileSkeleton'
import ProfileActivity from '@/components/profile/ProfileActivity'
import ProfileOverview from '@/components/profile/ProfileOverview'
import ProfileSettings from '@/components/profile/ProfileSettings'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/UserContext'
import { cn } from '@/lib/utils'
import {
  IconActivity,
  IconCamera,
  IconSettings,
  IconUser
} from '@tabler/icons-react'
import { useState } from 'react'

// Note: Lazy loading doesn't work with Pear's runtime due to module transformation
// Using direct imports for reliability - this is actually better for desktop apps:
// - No network requests after initial load
// - Instant tab switching
// - Smaller bundle overhead than you'd think

const TABS = [
  { id: 'overview', label: 'Overview', icon: IconUser },
  { id: 'settings', label: 'Settings', icon: IconSettings },
  { id: 'activity', label: 'Activity', icon: IconActivity }
]

function Profile() {
  const { profile, isProfileLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  if (!isProfileLoaded) {
    return (
      <div className='container mx-auto px-4 py-6 max-w-7xl'>
        <ProfileSkeleton />
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ProfileOverview profile={profile} isLoading={!isProfileLoaded} />
        )
      case 'settings':
        return (
          <ProfileSettings profile={profile} isLoading={!isProfileLoaded} />
        )
      case 'activity':
        return <ProfileActivity isLoading={!isProfileLoaded} />
      default:
        return (
          <ProfileOverview profile={profile} isLoading={!isProfileLoaded} />
        )
    }
  }

  return (
    <div className='container mx-auto px-4 py-6 max-w-7xl'>
      <div className='flex flex-col lg:flex-row gap-6 h-full'>
        {/* Sidebar Navigation - Mobile: Horizontal scroll, Desktop: Vertical */}
        <aside className='w-full lg:w-64 shrink-0'>
          <div className='lg:sticky lg:top-6'>
            {/* Mobile: Horizontal scroll tabs */}
            <div className='flex lg:hidden overflow-x-auto gap-2 pb-2 -mx-4 px-4'>
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap',
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    <Icon className='w-4 h-4' />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Desktop: Vertical navigation */}
            <nav className='hidden lg:flex flex-col gap-2'>
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left',
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className='w-5 h-5' />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 min-w-0'>
          <div className='space-y-6'>
            {/* Cover Image with Gradient */}
            <div className='relative h-48 rounded-lg overflow-hidden bg-linear-to-br from-primary/40 via-primary/30 to-primary/20'>
              <Button
                size='sm'
                variant='secondary'
                className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <IconCamera className='w-4 h-4 mr-2' />
                Change Cover
              </Button>
            </div>

            {/* Profile Header */}
            <div className='relative -mt-20 px-4 sm:px-6'>
              <div className='flex flex-col sm:flex-row items-start gap-4'>
                {/* Avatar */}
                <div className='relative group'>
                  <Avatar className='w-32 h-32 border-4 border-background ring-2 ring-primary/10'>
                    <AvatarImage
                      src={profile?.avatar}
                      alt={profile?.username || 'User'}
                    />
                    <AvatarFallback className='text-4xl font-bold bg-primary/10 text-primary'>
                      {profile?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
                    <IconCamera className='w-6 h-6 text-white' />
                  </button>
                </div>

                {/* Name and Info */}
                <div className='flex-1 mt-0 sm:mt-16 min-w-0'>
                  <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                    <div className='min-w-0'>
                      <h1 className='text-2xl sm:text-3xl font-bold truncate'>
                        {profile?.displayName ||
                          profile?.username ||
                          'Anonymous User'}
                      </h1>
                      {profile?.displayName && (
                        <p className='text-sm text-muted-foreground'>
                          @{profile?.username}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground mt-2 font-mono truncate'>
                    {profile?.shortPublicKey}
                  </p>
                </div>

                {/* Edit Profile Button */}
                <Button
                  variant='outline'
                  className='w-full sm:w-auto sm:mt-16'
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  Edit Profile
                </Button>
              </div>

              {/* Stats */}
              <div className='grid grid-cols-3 gap-4 mt-6'>
                <div className='text-center p-4 bg-card rounded-lg border'>
                  <div className='text-2xl font-bold'>0</div>
                  <div className='text-sm text-muted-foreground'>Posts</div>
                </div>
                <div className='text-center p-4 bg-card rounded-lg border'>
                  <div className='text-2xl font-bold'>0</div>
                  <div className='text-sm text-muted-foreground'>Following</div>
                </div>
                <div className='text-center p-4 bg-card rounded-lg border'>
                  <div className='text-2xl font-bold'>0</div>
                  <div className='text-sm text-muted-foreground'>Followers</div>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className='px-4 sm:px-6'>{renderContent()}</div>
          </div>
        </main>
      </div>

      {/* Edit Profile Dialog */}
      <ProfileEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profile={profile}
      />
    </div>
  )
}

export default Profile

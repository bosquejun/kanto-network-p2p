import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function ProfileOverview({ profile, isLoading }) {
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-32' />
        <Skeleton className='h-48' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>About</h3>
        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Bio
            </label>
            <p className='mt-1'>
              {profile?.bio ||
                'No bio yet. Tell the world a little about yourself!'}
            </p>
          </div>

          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Location
            </label>
            <p className='mt-1'>{profile?.location || 'Not specified'}</p>
          </div>

          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Website
            </label>
            <p className='mt-1'>
              {profile?.website ? (
                <a
                  href={profile.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  {profile.website}
                </a>
              ) : (
                'Not specified'
              )}
            </p>
          </div>

          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Member Since
            </label>
            <p className='mt-1'>
              {profile?.joinedAt
                ? new Date(profile.joinedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Unknown'}
            </p>
          </div>
        </div>
      </Card>

      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Activity Stats</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='text-center p-4 bg-muted/50 rounded-lg'>
            <div className='text-2xl font-bold'>0</div>
            <div className='text-sm text-muted-foreground'>Total Posts</div>
          </div>
          <div className='text-center p-4 bg-muted/50 rounded-lg'>
            <div className='text-2xl font-bold'>0</div>
            <div className='text-sm text-muted-foreground'>Total Likes</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfileOverview

import { useUser } from '@/context/UserContext'

function Profile() {
  const { profile, isProfileLoaded } = useUser()

  if (!isProfileLoaded) {
    return (
      <div className='container p-4 md:p-6'>
        <p className='text-muted-foreground'>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className='container p-4 md:p-6'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-card rounded-lg border p-6'>
          <div className='flex items-center gap-4'>
            <div className='w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center'>
              <span className='text-3xl font-bold text-primary'>
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className='text-2xl font-semibold'>
                {profile?.username || 'Anonymous User'}
              </h2>
              <p className='text-sm text-muted-foreground mt-1'>
                {profile?.shortPublicKey}
              </p>
            </div>
          </div>

          <div className='mt-6 space-y-4'>
            <div>
              <h3 className='text-lg font-semibold'>About</h3>
              <p className='text-muted-foreground mt-2'>
                Welcome to your profile page. Here you can manage your account
                settings and view your activity.
              </p>
            </div>

            <div className='grid grid-cols-3 gap-4 pt-4'>
              <div className='text-center p-4 bg-background rounded-lg'>
                <div className='text-2xl font-bold'>42</div>
                <div className='text-sm text-muted-foreground'>Posts</div>
              </div>
              <div className='text-center p-4 bg-background rounded-lg'>
                <div className='text-2xl font-bold'>128</div>
                <div className='text-sm text-muted-foreground'>Following</div>
              </div>
              <div className='text-center p-4 bg-background rounded-lg'>
                <div className='text-2xl font-bold'>256</div>
                <div className='text-sm text-muted-foreground'>Followers</div>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <h3 className='text-lg font-semibold mb-4'>Recent Activity</h3>
          <div className='space-y-3'>
            {[...Array(10)].map((_, index) => (
              <div key={index} className='p-4 bg-card rounded-lg border'>
                <h4 className='font-semibold'>Activity {index + 1}</h4>
                <p className='text-sm text-muted-foreground mt-1'>
                  Your recent activity in the network.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

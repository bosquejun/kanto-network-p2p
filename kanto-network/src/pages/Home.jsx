import { Button } from '@/components/ui/button'
import { useUser } from '@/context/UserContext'

function Home() {
  const { profile, isProfileLoaded } = useUser()
  return (
    <div className='container p-4 md:p-6'>
      <h2 className='text-xl font-semibold'>Home</h2>
      <p className='text-muted-foreground mt-1'>
        {isProfileLoaded
          ? `Welcome, ${profile?.username || profile?.shortPublicKey}!`
          : 'Loading...'}
      </p>

      {[...Array(50)].map((_, index) => (
        <div key={index} className='mt-4 p-4 bg-card rounded-lg'>
          <h3 className='text-lg font-semibold'>Post {index + 1}</h3>
          <p className='text-muted-foreground mt-1'>
            This is a post by {profile?.username || profile?.shortPublicKey}.
          </p>
          <Button>Post</Button>
        </div>
      ))}
    </div>
  )
}

export default Home

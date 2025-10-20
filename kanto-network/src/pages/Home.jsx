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
    </div>
  )
}

export default Home

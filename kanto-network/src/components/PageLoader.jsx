import Loader from '@/components/Loader'

export default function PageLoader({ message }) {
  return (
    <div className='z-[99] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 w-screen h-screen flex items-center justify-center flex-col gap-4 transition-all duration-500 ease-in-out animate-fade-in'>
      <Loader />
      <p className='text-sm text-muted-foreground'>{message || 'Loading...'}</p>
    </div>
  )
}

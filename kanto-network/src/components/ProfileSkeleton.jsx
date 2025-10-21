import { Skeleton } from './ui/skeleton'

function ProfileSkeleton() {
  return (
    <div className='flex flex-col md:flex-row gap-6 h-full'>
      {/* Sidebar Skeleton */}
      <aside className='w-full md:w-64 shrink-0'>
        <div className='sticky top-20 space-y-2'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className='flex-1 min-w-0'>
        <div className='space-y-6'>
          {/* Cover Image */}
          <Skeleton className='h-48 w-full rounded-lg' />

          {/* Avatar and Basic Info */}
          <div className='flex items-start gap-4 -mt-16 relative z-10 px-4'>
            <Skeleton className='h-32 w-32 rounded-full border-4 border-background' />
            <div className='mt-16 space-y-2 flex-1'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
            <Skeleton className='h-10 w-24 mt-16' />
          </div>

          {/* Stats */}
          <div className='grid grid-cols-3 gap-4 px-4'>
            <Skeleton className='h-20' />
            <Skeleton className='h-20' />
            <Skeleton className='h-20' />
          </div>

          {/* Content */}
          <div className='space-y-4 px-4'>
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileSkeleton

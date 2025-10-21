import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function ProfileActivity({ isLoading }) {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-24' />
        ))}
      </div>
    )
  }

  // Placeholder activities
  const activities = []

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Recent Activity</h3>
      </div>

      {activities.length === 0 ? (
        <Card className='p-12 text-center'>
          <p className='text-muted-foreground'>
            No activity yet. Start exploring the network!
          </p>
        </Card>
      ) : (
        activities.map((activity, index) => (
          <Card key={index} className='p-4'>
            <div className='flex items-start gap-4'>
              <div className='flex-1'>
                <h4 className='font-semibold'>{activity.title}</h4>
                <p className='text-sm text-muted-foreground mt-1'>
                  {activity.description}
                </p>
                <p className='text-xs text-muted-foreground mt-2'>
                  {activity.timestamp}
                </p>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

export default ProfileActivity

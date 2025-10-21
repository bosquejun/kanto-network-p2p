import { Card } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity } from 'lucide-react'

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
        <Empty className='border'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Activity />
            </EmptyMedia>
            <EmptyTitle>No activity yet</EmptyTitle>
            <EmptyDescription>
              Your recent activities will appear here. Start exploring the
              network to see updates!
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
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

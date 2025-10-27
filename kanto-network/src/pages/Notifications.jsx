import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { Bell } from 'lucide-react'

function Notifications() {
  // Placeholder - replace with actual notifications data
  const notifications = []

  return (
    <div className='container p-4'>
      <h2 className='text-xl font-semibold'>Notifications</h2>
      <p className='text-muted-foreground mt-1'>
        Stay updated with your latest notifications.
      </p>

      <div className='mt-6'>
        {notifications.length === 0 ? (
          <Empty className='border'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Bell />
              </EmptyMedia>
              <EmptyTitle>No notifications</EmptyTitle>
              <EmptyDescription>
                You're all caught up! Notifications from your network activity
                will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className='space-y-3'>
            {notifications.map((notification, index) => (
              <div
                key={index}
                className='p-4 bg-card rounded-lg border flex items-start gap-4'
              >
                <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                  <span className='text-primary font-semibold'>
                    {index + 1}
                  </span>
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold'>{notification.title}</h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {notification.description}
                  </p>
                  <p className='text-xs text-muted-foreground mt-2'>
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications

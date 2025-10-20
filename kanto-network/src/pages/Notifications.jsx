function Notifications() {
  return (
    <div className='container p-4 md:p-6'>
      <h2 className='text-xl font-semibold'>Notifications</h2>
      <p className='text-muted-foreground mt-1'>
        Stay updated with your latest notifications.
      </p>

      <div className='mt-6 space-y-3'>
        {[...Array(15)].map((_, index) => (
          <div
            key={index}
            className='p-4 bg-card rounded-lg border flex items-start gap-4'
          >
            <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
              <span className='text-primary font-semibold'>{index + 1}</span>
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold'>Notification {index + 1}</h3>
              <p className='text-sm text-muted-foreground mt-1'>
                You have a new notification from the network.
              </p>
              <p className='text-xs text-muted-foreground mt-2'>
                {index + 1} minutes ago
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications

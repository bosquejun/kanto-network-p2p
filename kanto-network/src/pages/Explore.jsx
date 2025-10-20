function Explore() {
  return (
    <div className='container p-4 md:p-6'>
      <h2 className='text-xl font-semibold'>Explore</h2>
      <p className='text-muted-foreground mt-1'>
        Discover new content and connections.
      </p>

      <div className='mt-6 grid gap-4'>
        {[...Array(20)].map((_, index) => (
          <div key={index} className='p-4 bg-card rounded-lg border'>
            <h3 className='text-lg font-semibold'>Discover Item {index + 1}</h3>
            <p className='text-muted-foreground mt-1'>
              Explore and discover new content in the network.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Explore

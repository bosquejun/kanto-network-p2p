import { Outlet } from 'react-router-dom'

function Bare() {
  return (
    <div className='min-h-dvh'>
      <Outlet />
    </div>
  )
}

export default Bare

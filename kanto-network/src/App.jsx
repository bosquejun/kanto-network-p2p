import { Outlet } from 'react-router-dom'

function App() {
  return (
    // <div className='min-h-dvh flex flex-col'>

    // </div>
    <main className='flex-1'>
      <Outlet />
    </main>
  )
}

export default App

import { Outlet } from 'react-router-dom'
import BottomBar from './components/BottomBar'

function App() {
  return (
    <>
      <Outlet />

      <BottomBar />
    </>
  )
}

export default App

import GettingStarted from '@/pages/GettingStarted'
import Home from '@/pages/Home'
import Onboarding from '@/pages/Onboarding'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import Topbar from './components/Topbar.jsx'
import { AppProvider } from './context/AppContext'
import { UserProvider } from './context/UserContext.jsx'
import './index.css'
import './modules/pear-runtime.js'

function Root() {
  return (
    <AppProvider>
      <UserProvider>
        <Topbar />
        <div className='mt-10'>
          <Outlet />
        </div>
      </UserProvider>
    </AppProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [{ index: true, element: <Home /> }]
      },
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/getting-started', element: <GettingStarted /> }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)

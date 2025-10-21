import Explore from '@/pages/Explore'
import GettingStarted from '@/pages/GettingStarted'
import Home from '@/pages/Home'
import Notifications from '@/pages/Notifications'
import Onboarding from '@/pages/Onboarding'
import Profile from '@/pages/Profile'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import Topbar from './components/Topbar.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { TooltipProvider } from './components/ui/tooltip.jsx'
import { AppProvider } from './context/AppContext'
import { UserProvider } from './context/UserContext.jsx'
import './index.css'
import './modules/pear-runtime.js'
import Goodbye from './pages/Goodbye.jsx'

function Root() {
  return (
    <TooltipProvider>
      <AppProvider>
        <UserProvider>
          <div className='h-screen flex flex-col'>
            <Topbar />
            <main
              id='main-content'
              className='flex-1 overflow-y-auto overflow-x-hidden pt-10 pb-18 [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:mt-11 [&::-webkit-scrollbar-track]:mb-24 md:[&::-webkit-scrollbar-track]:mb-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50'
            >
              <Outlet />
            </main>
          </div>
        </UserProvider>
      </AppProvider>
    </TooltipProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <Home /> },
          { path: 'explore', element: <Explore /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'profile', element: <Profile /> }
        ]
      },
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/getting-started', element: <GettingStarted /> },
      { path: '/goodbye', element: <Goodbye /> }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>
)

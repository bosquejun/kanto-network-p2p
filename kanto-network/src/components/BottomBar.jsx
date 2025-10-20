import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LimelightNav } from './ui/limelight-nav'

const HomeIcon = (props) => (
  <svg
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
  </svg>
)

const CompassIcon = (props) => (
  <svg
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <circle cx='12' cy='12' r='10' />
    <path d='m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z' />
  </svg>
)

const BellIcon = (props) => (
  <svg
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' />
    <path d='M10.3 21a1.94 1.94 0 0 0 3.4 0' />
  </svg>
)

const UserIcon = (props) => (
  <svg
    {...props}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
)

export default function BottomBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolledFromBottom, setIsScrolledFromBottom] = useState(false)

  const navItems = useMemo(() => {
    const items = [
      {
        id: 'home',
        icon: <HomeIcon />,
        label: 'Home',
        path: '/',
        onClick: () => navigate('/')
      },
      {
        id: 'explore',
        icon: <CompassIcon />,
        label: 'Explore',
        path: '/explore',
        onClick: () => navigate('/explore')
      },
      {
        id: 'notifications',
        icon: <BellIcon />,
        label: 'Notifications',
        path: '/notifications',
        onClick: () => navigate('/notifications')
      },
      {
        id: 'profile',
        icon: <UserIcon />,
        label: 'Profile',
        path: '/profile',
        onClick: () => navigate('/profile')
      }
    ]
    return items
  }, [navigate])

  const activeIndex = useMemo(() => {
    const currentPath = location.pathname
    const index = navItems.findIndex((item) => item.path === currentPath)
    return index !== -1 ? index : 0
  }, [location.pathname, navItems])

  return (
    <div
      className={cn(
        'fixed bottom-0 w-full h-18 flex items-center justify-center z-[100] pb-4 bg-transparent transition-all duration-200'
      )}
    >
      <LimelightNav
        items={navItems}
        activeIndex={activeIndex}
        className='bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border'
      />
    </div>
  )
}

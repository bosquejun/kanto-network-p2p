import { cn, getAppOS } from '@/lib/utils'
import { IconRotateClockwise } from '@tabler/icons-react'
import ui from 'pear-electron'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

function Topbar() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const os = getAppOS()

  useEffect(() => {
    const run = async () => {
      const result = await ui.app.isFullscreen()
      setIsFullscreen(result)
    }
    run()

    window.addEventListener('resize', () => {
      run()
    })

    return () => {
      window.removeEventListener('resize', () => {
        run()
      })
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        setIsScrolled(mainContent.scrollTop > 0)
      }
    }

    // Wait for the main-content element to be available
    const checkAndAttach = () => {
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        mainContent.addEventListener('scroll', handleScroll)
        return true
      }
      return false
    }

    // Try immediately
    if (!checkAndAttach()) {
      // If not available, wait a bit and try again
      const timeoutId = setTimeout(checkAndAttach, 100)
      return () => clearTimeout(timeoutId)
    }

    return () => {
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <header
      id='top-bar'
      className={cn('w-full fixed top-0 z-[100] transition-all duration-200', {
        'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60':
          isScrolled,
        'border-transparent bg-transparent': !isScrolled
      })}
    >
      <div
        className={cn('flex h-10 items-center px-2', {
          '-mr-2': os === 'linux'
        })}
      >
        {os === 'macos' && (
          <div
            className={cn({
              '-mt-1': os === 'macos'
            })}
          >
            <pear-ctrl />
          </div>
        )}
        <div
          className={cn('font-semibold tracking-tight', {
            'ml-16': !isFullscreen && os === 'macos'
          })}
        >
          kanto.network
        </div>

        <div className='ml-auto flex items-center'>
          <div className='flex items-center gap-1 -mr-4'>
            <Button size='sm' variant='ghost' onClick={Pear.reload}>
              <IconRotateClockwise />
            </Button>
          </div>
          {os !== 'macos' && <pear-ctrl />}
        </div>
        {/* <NavigationMenu className='ml-auto'>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavLink to='/' end>
                {({ isActive }) => (
                  <NavigationMenuLink
                    data-active={isActive}
                    className='px-3 py-2 rounded-md'
                  >
                    Home
                  </NavigationMenuLink>
                )}
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu> */}
      </div>
    </header>
  )
}

export default Topbar

import { cn } from '@/lib/utils'
import ui from 'pear-electron'
import { useEffect, useState } from 'react'

function Topbar() {
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  return (
    <header
      id='top-bar'
      className='w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 z-[100]'
    >
      <div className='flex h-10 items-center px-2'>
        <div className='-mt-1'>
          <pear-ctrl />
        </div>
        <div
          className={cn('font-semibold tracking-tight', {
            'ml-16': !isFullscreen
          })}
        >
          kanto.network
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

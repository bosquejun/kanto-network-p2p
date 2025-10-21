import { Maximize2, Minimize2, Minus, X } from 'lucide-react'
import ui from 'pear-electron'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

console.log(ui.app)

export default function WindowControl() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const run = async () => {
      const result = await ui.app.isMaximized()
      setIsMaximized(result)
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
    <div className='window-control flex items-center gap-0.5'>
      <Button
        className=''
        size='sm'
        variant='ghost'
        onClick={() => ui.app.minimize()}
      >
        <Minus />
      </Button>
      <Button
        className=''
        size='sm'
        variant='ghost'
        onClick={() => (isMaximized ? ui.app.restore() : ui.app.maximize())}
      >
        {isMaximized ? <Minimize2 /> : <Maximize2 />}
      </Button>
      <Button
        className=''
        size='sm'
        variant='ghost'
        onClick={() => ui.app.close()}
      >
        <X />
      </Button>
    </div>
  )
}

import PageLoader from '@/components/PageLoader'
import { initPearRuntime, swarm } from '@/modules/pear-runtime'
import { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')

  useEffect(() => {
    const run = async () => {
      swarm.on('connection', (socket) => {
        console.log('connection', socket)
      })

      // When there's updates to the swarm, update the peers count
      swarm.on('update', () => {
        console.log('update', swarm.connections.size)
      })

      await initPearRuntime((status) => {
        setLoadingMessage(status)
      })

      setIsAppLoading(false)
    }

    run()
  }, []) // don't include navigate in deps to avoid extra redirects

  const value = { isAppLoading }

  return (
    <AppContext.Provider value={value}>
      {isAppLoading ? <PageLoader message={loadingMessage} /> : children}
      {/* {children} */}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

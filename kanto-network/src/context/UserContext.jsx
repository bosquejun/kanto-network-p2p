import {
  getUserProfile,
  hasCompletedOnboarding,
  setupNewUser,
  updateUserProfile
} from '@/modules/user/user'
import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from './AppContext'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  const { isAppLoading } = useApp()

  useEffect(() => {
    if (isAppLoading) return
    const run = async () => {
      const completed = await hasCompletedOnboarding()

      console.log('completed', completed)

      if (!completed) {
        navigate('/getting-started', { replace: true })
        return
      }

      const profile = await getUserProfile()

      console.log('profile', profile)

      if (!profile) {
        navigate('/onboarding', { replace: true })
        return
      }
      setProfile(profile)
      setIsProfileLoaded(true)
    }
    run()
  }, [isAppLoading])

  const setupUser = async (username = null) => {
    const profile = await setupNewUser(username)
    setProfile(profile)
    setIsProfileLoaded(true)
    navigate('/', { replace: true })
  }

  const updateProfile = async (updates) => {
    const updatedProfile = await updateUserProfile(updates)
    setProfile(updatedProfile)
    return updatedProfile
  }

  return (
    <UserContext.Provider
      value={{ profile, isProfileLoaded, setupUser, updateProfile }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

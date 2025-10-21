import { useDebounceCallback } from '@/hooks/use-debounce-callback'
import usernameRegistry from '@/modules/global/username-registry'
import { useCallback, useState } from 'react'

export function isUsernameValid(username) {
  username = username?.trim() || ''
  if (!username) return false
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return false
  return true
}

export function useUsernameValidation(initialUsername = '') {
  const [username, setUsername] = useState(initialUsername)
  const [isSearching, setIsSearching] = useState(false)
  const [isAvailable, setIsAvailable] = useState(null)

  const handleSearchUsername = useCallback(async (username) => {
    const entry = await usernameRegistry.lookUpUsername(username)
    setIsAvailable(!entry)
    setIsSearching(false)
  }, [])

  const handleDebouncedSearch = useDebounceCallback(handleSearchUsername, 500)

  const handleUsernameChange = useCallback(
    (value) => {
      setUsername(value)

      if (!isUsernameValid(value)) {
        setIsAvailable(null)
        setIsSearching(false)
        if (handleDebouncedSearch.isPending()) {
          handleDebouncedSearch.cancel()
        }
        return
      }

      setIsSearching(true)
      handleDebouncedSearch(value)
    },
    [handleDebouncedSearch]
  )

  const reset = useCallback(() => {
    setUsername(initialUsername)
    setIsSearching(false)
    setIsAvailable(null)
    if (handleDebouncedSearch.isPending()) {
      handleDebouncedSearch.cancel()
    }
  }, [initialUsername, handleDebouncedSearch])

  return {
    username,
    isSearching,
    isAvailable,
    isValid: isUsernameValid(username),
    handleUsernameChange,
    setUsername,
    reset
  }
}

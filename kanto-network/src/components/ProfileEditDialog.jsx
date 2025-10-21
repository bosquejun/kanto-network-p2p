import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useUser } from '@/context/UserContext'
import { useUsernameValidation } from '@/hooks/use-username-validation'
import { cn } from '@/lib/utils'
import { IconCheck, IconDeviceFloppy, IconX } from '@tabler/icons-react'
import { Info, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function ProfileEditDialog({ open, onOpenChange, profile }) {
  const { updateProfile } = useUser()
  const [isSaving, setIsSaving] = useState(false)

  // Username validation
  const {
    username,
    isSearching,
    isAvailable,
    isValid: isUsernameValid,
    handleUsernameChange,
    setUsername
  } = useUsernameValidation(profile?.username || '')

  // Other form fields
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || ''
  })

  // Sync form data when profile changes or dialog opens
  useEffect(() => {
    if (profile && open) {
      setUsername(profile.username || '')
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || ''
      })
    }
  }, [profile, open, setUsername])

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    // Validate username if changed
    if (username !== profile?.username) {
      if (!isUsernameValid) {
        toast.error(
          'Username must be 3-20 characters: letters, numbers, underscore'
        )
        return
      }
      if (isAvailable === false) {
        toast.error('Username is already taken')
        return
      }
    }

    setIsSaving(true)
    try {
      await updateProfile({
        ...formData,
        username: username.trim()
      })
      toast.success('Profile updated successfully!')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const canSave =
    !isSaving &&
    (!isSearching || username === profile?.username) &&
    (username === profile?.username ||
      (isUsernameValid && isAvailable === true))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. Changes will be visible to others
            on the network.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Username Field */}
          <div className='space-y-2'>
            <Label htmlFor='edit-username'>Username</Label>
            <InputGroup>
              <InputGroupInput
                id='edit-username'
                placeholder='your_username'
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                maxLength={20}
              />
              <InputGroupAddon>
                <Label htmlFor='edit-username'>@</Label>
              </InputGroupAddon>
              <InputGroupAddon align='inline-end'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {isSearching && username !== profile?.username ? (
                      <Loader className='size-4 animate-spin' />
                    ) : isAvailable !== null &&
                      username !== profile?.username ? (
                      <div
                        className={cn(
                          'text-primary-foreground flex size-4 items-center justify-center rounded-full',
                          {
                            'bg-primary': isAvailable,
                            'bg-destructive': !isAvailable
                          }
                        )}
                      >
                        {isAvailable ? (
                          <IconCheck className='size-3' />
                        ) : (
                          <IconX className='size-3' />
                        )}
                      </div>
                    ) : null}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isSearching
                        ? 'Checking availability...'
                        : isAvailable !== null
                          ? isAvailable
                            ? 'Username is available'
                            : 'Username is taken'
                          : 'Current username'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </InputGroupAddon>
            </InputGroup>
            <div className='flex items-start gap-2 text-xs text-muted-foreground'>
              <Info className='mt-0.5 size-3' />
              <p>Use 3–20 characters. Letters, numbers, and underscore only.</p>
            </div>
          </div>

          {/* Display Name */}
          <div className='space-y-2'>
            <Label htmlFor='displayName'>Display Name</Label>
            <Input
              id='displayName'
              name='displayName'
              value={formData.displayName}
              onChange={handleChange}
              placeholder='Your display name'
            />
          </div>

          {/* Bio */}
          <div className='space-y-2'>
            <Label htmlFor='bio'>Bio</Label>
            <Textarea
              id='bio'
              name='bio'
              value={formData.bio}
              onChange={handleChange}
              className='min-h-[80px]'
              placeholder='Tell us about yourself...'
              maxLength={160}
            />
            <p className='text-xs text-muted-foreground'>
              {formData.bio.length}/160 characters
            </p>
          </div>

          {/* Location */}
          <div className='space-y-2'>
            <Label htmlFor='location'>Location</Label>
            <Input
              id='location'
              name='location'
              value={formData.location}
              onChange={handleChange}
              placeholder='City, Country'
            />
          </div>

          {/* Website */}
          <div className='space-y-2'>
            <Label htmlFor='website'>Website</Label>
            <Input
              id='website'
              name='website'
              type='url'
              value={formData.website}
              onChange={handleChange}
              placeholder='https://example.com'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            <IconDeviceFloppy className='w-4 h-4 mr-2' />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileEditDialog

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/context/UserContext'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function ProfileSettings({ profile, isLoading, onCancel, onSave }) {
  const { updateProfile } = useUser()
  // If onCancel/onSave props are provided, we're in inline edit mode
  const isInlineEdit = Boolean(onCancel && onSave)
  const [isEditing, setIsEditing] = useState(isInlineEdit)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || ''
  })

  // Sync form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || ''
      })
    }
  }, [profile])

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile(formData)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      if (onSave) onSave()
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      username: profile?.username || '',
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || ''
    })
    setIsEditing(false)
    if (onCancel) onCancel()
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-64' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold'>
            {isInlineEdit ? 'Edit Profile' : 'Profile Settings'}
          </h3>
          {!isEditing && !isInlineEdit && (
            <Button variant='outline' onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        <div className='space-y-4'>
          <div>
            <Label htmlFor='username'>Username</Label>
            <Input
              id='username'
              name='username'
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditing}
              className='mt-1'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              Your unique username
            </p>
          </div>

          <div>
            <Label htmlFor='displayName'>Display Name</Label>
            <Input
              id='displayName'
              name='displayName'
              value={formData.displayName}
              onChange={handleChange}
              disabled={!isEditing}
              className='mt-1'
              placeholder='Enter display name'
            />
          </div>

          <div>
            <Label htmlFor='bio'>Bio</Label>
            <Textarea
              id='bio'
              name='bio'
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              className='mt-1 min-h-[100px]'
              placeholder='Tell us about yourself...'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              Max 160 characters
            </p>
          </div>

          <div>
            <Label htmlFor='location'>Location</Label>
            <Input
              id='location'
              name='location'
              value={formData.location}
              onChange={handleChange}
              disabled={!isEditing}
              className='mt-1'
              placeholder='City, Country'
            />
          </div>

          <div>
            <Label htmlFor='website'>Website</Label>
            <Input
              id='website'
              name='website'
              type='url'
              value={formData.website}
              onChange={handleChange}
              disabled={!isEditing}
              className='mt-1'
              placeholder='https://example.com'
            />
          </div>
        </div>

        {isEditing && (
          <div className='flex gap-3 mt-6'>
            <Button onClick={handleSave} disabled={isSaving}>
              <IconDeviceFloppy className='w-4 h-4 mr-2' />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant='outline'
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>

      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4'>Public Key</h3>
        <div className='space-y-2'>
          <Label>Short Key</Label>
          <div className='p-3 bg-muted rounded-md font-mono text-sm break-all'>
            {profile?.shortPublicKey || 'Loading...'}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfileSettings

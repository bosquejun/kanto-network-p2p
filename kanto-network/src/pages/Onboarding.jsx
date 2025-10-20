import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { useUser } from '@/context/UserContext'
import { ArrowRight, Info } from 'lucide-react'
import { useMemo, useState } from 'react'

function Onboarding() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const { setupUser } = useUser()

  async function handleSubmit(e) {
    e.preventDefault()
    const value = username.trim()
    if (!value) {
      setError('Please enter a username')
      return
    }
    if (!/^[-a-zA-Z0-9_]{3,20}$/.test(value)) {
      setError('Use 3-20 chars: letters, numbers, dash, underscore')
      return
    }

    await setupUser(value)
  }

  async function handleSkip() {
    await setupUser()
  }

  const isValidUsername = useMemo(() => {
    const value = username.trim()
    if (!value) return false
    if (!/^[-a-zA-Z0-9_]{3,20}$/.test(value)) return false
    return true
  }, [username])

  return (
    <div className='min-h-dvh flex items-center justify-center px-4'>
      <div className='container max-w-xl mx-auto p-0'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent'>
            Create your username
          </h1>
          <p className='text-sm md:text-base text-muted-foreground mt-2'>
            Choose a public alias (optional). This will help others find you.
            You can skip this and stay private.
          </p>
        </div>
        <Card className='rounded-2xl p-6 md:p-7 bg-background/70 backdrop-blur-md border border-border/60 shadow-xl'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <InputGroup>
                <InputGroupInput
                  id='username'
                  placeholder='juan_delacruz'
                  onChange={(e) => setUsername(e.target.value)}
                />
                <InputGroupAddon>
                  <Label htmlFor='username'>@</Label>
                </InputGroupAddon>
                <InputGroupAddon align='inline-end'>
                  {/* <div className='bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full'>
                    <IconCheck className='size-3' />
                  </div> */}
                  {/* <Loader className='size-4 animate-spin' /> */}
                </InputGroupAddon>
              </InputGroup>

              <div className='flex items-start gap-2 text-xs md:text-sm text-muted-foreground '>
                <Info className='mt-0.5 size-3' />
                <p className='text-xs'>
                  Use 3–20 characters. Letters, numbers, and underscore are
                  allowed.
                </p>
              </div>
              {error ? (
                <p className='text-sm text-destructive'>{error}</p>
              ) : null}
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='ghost'
                className='group'
                onClick={handleSkip}
              >
                Skip
              </Button>
              <Button
                disabled={!isValidUsername}
                type='submit'
                className='group'
              >
                Continue
                <ArrowRight className='ml-1 size-4 transition-transform group-hover:translate-x-0.5' />
              </Button>
            </div>
          </form>
        </Card>
        <p className='text-xs text-muted-foreground mt-3 text-center'>
          You can change this later in settings.
        </p>
      </div>
    </div>
  )
}

export default Onboarding

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useUser } from '@/context/UserContext'
import { useUsernameValidation } from '@/hooks/use-username-validation'
import { cn } from '@/lib/utils'
import { IconCheck, IconX } from '@tabler/icons-react'
import { ArrowRight, Globe, Info, Loader } from 'lucide-react'
import { useState } from 'react'

function Onboarding() {
  const [error, setError] = useState('')
  const { setupUser } = useUser()
  const { username, isSearching, isAvailable, isValid, handleUsernameChange } =
    useUsernameValidation()

  async function handleSubmit(e) {
    e.preventDefault()
    const value = username.trim()
    if (!value) {
      setError('Please enter a username')
      return
    }
    if (!isValid) {
      setError('Use 3-20 chars: letters, numbers, underscore')
      return
    }

    await setupUser(value)
  }

  async function handleSkip() {
    await setupUser()
  }

  const handleInputChange = (e) => {
    handleUsernameChange(e.target.value)
  }

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      if (isAvailable === true && !isSearching && isValid) {
        handleSubmit(e)
      }
    }
  }

  return (
    <div className='flex items-center justify-center h-[calc(100vh-112px)]'>
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
                  value={username}
                  onChange={handleInputChange}
                  onKeyUp={handleKeyUp}
                  maxLength={20}
                />
                <InputGroupAddon>
                  <Label htmlFor='username'>@</Label>
                </InputGroupAddon>
                <InputGroupAddon align='inline-end'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {isSearching ? (
                        <Loader className='size-4 animate-spin' />
                      ) : isAvailable !== null ? (
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
                          ? 'Looking up username...'
                          : isAvailable !== null
                            ? isAvailable
                              ? 'Username is available'
                              : 'Username is not available'
                            : 'Username is available'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
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
              <Alert className='bg-blue-700/10 border-blue-900'>
                <Globe />
                <AlertTitle>Make your mark on the network</AlertTitle>
                <AlertDescription className='text-xs'>
                  Each username is unique across the Kanto network. When you
                  choose one, it’s shared publicly so other peers can discover
                  you. <br />
                  <br /> Continue only if you’re okay with your username being
                  visible to everyone on the network.
                </AlertDescription>
              </Alert>
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
                disabled={isSearching || isAvailable !== true || !isValid}
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

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { setCompletedOnboarding } from '@/modules/user/user'
import { ArrowLeft, ArrowRight, HardDrive, Share2, Shield } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const steps = [
  {
    title: 'Peer-to-Peer by design',
    body: 'No middleman. Your app connects directly to peers for content and collaboration.',
    Icon: Share2
  },
  {
    title: 'Private identity',
    body: 'Identity stays on your device. You decide what to share and with whom.',
    Icon: Shield
  },
  {
    title: 'Local-first',
    body: 'Your data is stored locally and synced over P2P whenever peers are online.',
    Icon: HardDrive
  }
]

function GettingStarted() {
  const totalSteps = 3
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1) // 1: forward, -1: back

  return (
    <div className='relative flex items-center h-[calc(100vh-112px)]'>
      <div className='container max-w-3xl mx-auto p-4 md:p-8'>
        {/* Heading */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent'>
            Welcome to Kanto Network
          </h1>
          <p className='text-muted-foreground mt-3 text-sm md:text-base'>
            A privacy-first, local-first, peer-to-peer community platform.
          </p>
        </div>

        {/* Single step */}
        <div className='mx-auto max-w-xl'>
          {(() => {
            const { title, body, Icon } = steps[step]
            return (
              <div
                className={`relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-primary/20 to-transparent shadow-md ${dir === 1 ? 'animate-gs-enter-right' : 'animate-gs-enter-left'}`}
              >
                <Card className='rounded-2xl p-6 md:p-7 bg-background/70 backdrop-blur-md border border-border/60 transition-all duration-300'>
                  <div className='flex items-start gap-4'>
                    <div className='grid size-12 place-items-center rounded-full bg-primary/10 text-primary shadow-inner p-2.5'>
                      <Icon className='size-6' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg md:text-xl font-semibold leading-tight'>
                        {title}
                      </h3>
                      <p className='text-sm md:text-base text-muted-foreground mt-2'>
                        {body}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )
          })()}
        </div>

        {/* Actions + dot indicators */}
        <div className='mt-8 space-y-4'>
          <div className='flex justify-center gap-2'>
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <span
                key={idx}
                className={cn('h-2 w-2 rounded-full transition-all', {
                  'bg-primary w-4': idx === step,
                  'bg-border': idx !== step
                })}
              />
            ))}
          </div>
          <div className='flex items-center justify-between'>
            {step > 0 ? (
              <Button
                size='sm'
                variant='ghost'
                disabled={step === 0}
                onClick={() => {
                  setDir(-1)
                  setStep((s) => Math.max(s - 1, 0))
                }}
                className='group'
              >
                <ArrowLeft className='mr-1 size-4 transition-transform group-hover:-translate-x-0.5' />
                Back
              </Button>
            ) : (
              <div />
            )}
            {step < totalSteps - 1 ? (
              <Button
                size='sm'
                onClick={() => {
                  setDir(1)
                  setStep((s) => Math.min(s + 1, totalSteps - 1))
                }}
                className='group'
              >
                Next
                <ArrowRight className='ml-1 size-4 transition-transform group-hover:translate-x-0.5' />
              </Button>
            ) : (
              <Button
                asChild
                size='sm'
                className='group'
                onClick={() => {
                  setCompletedOnboarding()
                }}
              >
                <Link
                  to='/onboarding'
                  className='inline-flex items-center gap-2'
                >
                  Continue
                  <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
                </Link>
              </Button>
            )}
          </div>
          <div className='text-center text-xs text-muted-foreground'>
            No accounts. No middlemen. You are in control.
          </div>
        </div>
      </div>
    </div>
  )
}

export default GettingStarted

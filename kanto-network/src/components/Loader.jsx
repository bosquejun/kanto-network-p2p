import LoaderSvg from '../assets/loader.svg?react'

export default function Loader() {
  return (
    <div className='p-2 size-12 shadow-lg shadow-primary/50 border rounded-md bg-card'>
      <LoaderSvg className='w-full h-full' style={{ display: 'block' }} />
    </div>
  )
}

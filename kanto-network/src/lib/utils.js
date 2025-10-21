import b4a from 'b4a'
import { clsx } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const toHex = (buffer) => buffer.toString('hex')

export const fromHex = (hexString) => b4a.from(hexString, 'hex')

export const encodeBuffer = (buffer, toEncoding) => buffer.toString(toEncoding)

export const decodeBuffer = (bufferString, encoding) =>
  b4a.from(bufferString, encoding)

export const toBuffer = (dataString, fromEncoding) =>
  b4a.from(dataString, fromEncoding)

export const fromBuffer = (buffer, toEncoding) =>
  b4a.from(buffer).toString(toEncoding)

export const shortPublicKey = (pubKey) =>
  (typeof pubKey !== 'string' ? pubKey.toString('hex') : pubKey).slice(0, 6)

export const sleep = async (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const getAppOS = () => {
  const platform = window.navigator.platform
  if (platform.includes('Win')) return 'windows'
  if (platform.includes('Mac')) return 'macos'
  if (platform.includes('Linux')) return 'linux'
  return 'unknown'
}

export const getToastById = (id) => {
  return toast.getToasts().find((t) => t.id === id)
}

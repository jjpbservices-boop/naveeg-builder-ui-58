import en from './en.json'

const messages = {
  en,
} as const

export type Locale = keyof typeof messages
export type MessageKey = keyof typeof en

export function getMessage(locale: Locale, key: string): string {
  const keys = key.split('.')
  let value: any = messages[locale]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return key if not found
    }
  }

  return typeof value === 'string' ? value : key
}

export function t(locale: Locale, key: string): string {
  return getMessage(locale, key)
}

export { messages, en }

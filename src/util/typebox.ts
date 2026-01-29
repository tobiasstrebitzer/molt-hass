import { Type, UnsafeOptions } from '@sinclair/typebox'

export function stringEnum<T extends readonly string[]>(values: T, options: UnsafeOptions = {}) {
  return Type.Unsafe<T[number]>({ type: 'string', enum: [...values], ...options })
}

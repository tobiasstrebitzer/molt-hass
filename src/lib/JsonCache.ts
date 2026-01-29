import { existsSync, readFileSync, writeFileSync } from 'fs'

export interface HACacheOptions {
  configDir: string
}

export interface JsonCache<T> {
  exists(): boolean
  read(): T | undefined
  read(defaultValue: T): T
  read(defaultValue?: T): T | undefined
  write(value: T): void
}

export function createJsonCache<T>(path: string): JsonCache<T> {
  const cache: JsonCache<T> = {
    exists: () => existsSync(path),
    read: (defaultValue?: T) => {
      if (!cache.exists()) { return defaultValue }
      return JSON.parse(readFileSync(path, 'utf-8'))
    },
    write: (value) => {
      writeFileSync(path, JSON.stringify(value, null, 2))
    }
  }
  return cache
}

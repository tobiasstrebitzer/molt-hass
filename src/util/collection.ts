import { type Collection, type UnsubscribeFunc } from 'home-assistant-js-websocket'
import { type JsonCache } from '../lib/JsonCache.js'
import { resolvable } from './promise.js'

export interface WrappedCollection<T> {
  value: T
  promise: Promise<T>
  unsubscribe: UnsubscribeFunc
}

export function wrapCollection<T>(collection$: Promise<Collection<T>>, callback: (value: T) => void, cache?: JsonCache<T>): WrappedCollection<T> {
  let currentValue: T | undefined = undefined
  const { promise, resolve } = resolvable<T>()
  const $unsubscribe = collection$.then((collection) => {
    return collection.subscribe((state) => {
      if (!currentValue) { resolve(state) }
      callback(state)
      currentValue = state
      if (cache) { cache.write(state) }
    })
  })

  if (cache) {
    const cachedResult = cache.read()
    if (cachedResult) {
      resolve(cachedResult)
      currentValue = cachedResult
      callback(cachedResult)
    }
  }

  return {
    get value() {
      if (!currentValue) { throw new Error('Value access before loaded') }
      return currentValue
    },
    unsubscribe: () => { $unsubscribe.then((unsubscribe) => unsubscribe()) },
    promise
  }
}

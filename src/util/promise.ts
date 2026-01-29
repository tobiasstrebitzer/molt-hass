export interface Resolvable<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
}

export function resolvable<T>(): Resolvable<T> {
  const result: Resolvable<T> = { promise: null!, resolve: null!, reject: null! }
  result.promise = new Promise<T>((resolve, reject) => { result.resolve = resolve; result.reject = reject })
  return result
}

export function timeout(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export interface HAActionResult<T = unknown> {
  context: {
    id: string
    parent_id: string | null
    user_id: string
  }
  response: T
}

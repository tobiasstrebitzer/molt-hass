import { type AgentToolResult } from '@mariozechner/pi-agent-core'
import { encode } from '@toon-format/toon'

export interface ToolResult {
  content: Array<{ type: string; text: string }>
  details: unknown
}

export function toolResult<T extends object>(data: object, details?: T): AgentToolResult<T> {
  return { content: [{ type: 'text', text: encode(data) }], details: details ?? {} as T }
}

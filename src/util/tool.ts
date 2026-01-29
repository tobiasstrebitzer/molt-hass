import type { AgentToolResult } from '@mariozechner/pi-agent-core'

export interface ToolResult {
  content: Array<{ type: string; text: string }>
  details: unknown
}

export function toolResult<T extends object>(data: object, details?: T): AgentToolResult<T> {
  return { content: [{ type: 'text', text: JSON.stringify(data) }], details: details ?? {} as T }
}

import type { OpenClawPluginApi } from 'openclaw/plugin-sdk'
import { type PluginConfig } from '../types/PluginConfig.js'

export function parseConfig(rawConfig: OpenClawPluginApi['config']): PluginConfig | undefined {
  const config = (rawConfig.plugins?.entries?.['claw-hass']?.config ?? {}) as Partial<PluginConfig>
  const url = config.url ?? 'http://127.0.0.1:8123'
  const services = config.services ?? []
  const accessToken = config.accessToken
  if (!accessToken) { return undefined }
  return { url, accessToken, services }
}

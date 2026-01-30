import { OpenClawPluginApi } from 'openclaw/types'
import { PluginConfig } from '../types/PluginConfig.js'

export function parseConfig(rawConfig: OpenClawPluginApi['config']): PluginConfig | undefined {
  const config = (rawConfig.plugins?.entries?.['claw-hass']?.config ?? {}) as Partial<PluginConfig>
  const url = config.url ?? 'http://127.0.0.1:8123'
  const accessToken = config.accessToken
  if (!accessToken) { return undefined }
  return { url, accessToken }
}

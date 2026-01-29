import { MoltbotPluginApi } from 'moltbot/types'
import { PluginConfig } from '../types/PluginConfig.js'

export function parseConfig(rawConfig: MoltbotPluginApi['config']): PluginConfig {
  const config = (rawConfig.plugins?.entries?.['molt-hass']?.config ?? {}) as Partial<PluginConfig>
  const url = config.url ?? 'http://127.0.0.1:8123'
  const accessToken = config.accessToken
  return { url, accessToken }
}

import { readFileSync } from 'fs'
import type { MoltbotPluginApi } from 'moltbot/types'
import { join } from 'path'
import { resolveConfigDir } from '../../moltbot/src/utils.js'
import { HAClient } from '../src/lib/HAClient.js'
import { PluginConfig } from '../src/types/PluginConfig.js'

async function main() {
  const moltbotConfig: MoltbotPluginApi['config'] = JSON.parse(readFileSync('test/config.json', 'utf-8'))
  const config = moltbotConfig.plugins?.entries?.['molt-hass']?.config as PluginConfig | undefined
  if (!config?.url) { throw new Error('Missing HASS config url (plugins.entries.molt-hass.config.url)') }
  const client = new HAClient({
    url: config.url,
    accessToken: config.accessToken,
    cacheDir: join(resolveConfigDir(), 'ha')
  })
  const actions = await client.listActions()
  console.info({ actions })
}

main()

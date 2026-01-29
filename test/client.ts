import { readFileSync } from 'fs'
import { join } from 'path'
import { resolveConfigDir } from '../../moltbot/src/utils.js'
import { HAClient } from '../src/lib/HAClient.js'
import { parseConfig } from '../src/util/config.js'

async function main() {
  const { url, accessToken } = parseConfig(JSON.parse(readFileSync('test/config.json', 'utf-8')))
  if (!accessToken) { throw new Error('Access token required') }
  const client = new HAClient({ url, accessToken, cacheDir: join(resolveConfigDir(), 'ha') })
  const actions = await client.listActions()
  console.info({ actions })
}

main()

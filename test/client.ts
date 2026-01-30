import { readFileSync } from 'fs'
import { join } from 'path'
import { resolveConfigDir } from '../../openclaw/src/utils.js'
import { HAClient } from '../src/lib/HAClient.js'
import { parseConfig } from '../src/util/config.js'

async function main() {
  const config = parseConfig(JSON.parse(readFileSync('test/config.json', 'utf-8')))
  if (!config) { throw new Error('Config required') }
  const client = new HAClient({ ...config, cacheDir: join(resolveConfigDir(), 'ha') })
  const actions = await client.listActions()
  console.info({ actions })
}

main()

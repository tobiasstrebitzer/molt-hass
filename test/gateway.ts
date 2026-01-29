import { parseCliProfileArgs } from '../../moltbot/src/cli/profile.js'
import { runCli } from '../../moltbot/src/cli/run-main.js'
import { loggingState } from '../../moltbot/src/logging/state.js'

async function main() {
  loggingState.consolePatched = true
  const argv = ['moltbot', '--dev', 'gateway']
  const parsed = parseCliProfileArgs(argv)
  if (!parsed.ok) { throw new Error('Invalid cli arguments') }
  process.argv = parsed.argv
  await runCli(argv)
}

main()

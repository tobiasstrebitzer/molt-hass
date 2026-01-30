import { parseCliProfileArgs } from '../../openclaw/src/cli/profile.js'
import { runCli } from '../../openclaw/src/cli/run-main.js'
import { loggingState } from '../../openclaw/src/logging/state.js'

async function main() {
  loggingState.consolePatched = true
  const argv = ['claw', '--dev', 'gateway']
  const parsed = parseCliProfileArgs(argv)
  if (!parsed.ok) { throw new Error('Invalid cli arguments') }
  process.argv = parsed.argv
  await runCli(argv)
}

main()

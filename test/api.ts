import plugin from '../src/index.js'
import { createStubContext } from './helpers/moltbot.js'

async function main() {
  const context = createStubContext()
  await plugin.register!(context.api)
  console.info(await context.tools['ha:actions_list'].execute('0', {}))
  console.info(await context.tools['ha:action_run'].execute('1', {
    actionId: 'turn_on',
    serviceId: 'light',
    entityId: 'light.standing_lamp_black',
    data: { rgb_color: [255, 0, 0] }
  }))
}

main()

import plugin from '../src/index.js'
import { timeout } from '../src/util/promise.js'
import { createStubContext } from './helpers/openclaw.js'

async function main() {
  const context = await createStubContext(plugin)
  console.info(await context.tools['ha:get_sensors'].execute('0', {}))
  console.info(await context.tools['ha:get_actions'].execute('1', {}))
  console.info(await context.tools['ha:run_action'].execute('2', {
    actionId: 'turn_on',
    serviceId: 'light',
    entityId: 'light.standing_lamp_black',
    data: '{ "rgb_color": [255, 255, 255] }'
  }))
  await timeout(1000)
  console.info(await context.tools['ha:run_action'].execute('3', {
    actionId: 'turn_off',
    serviceId: 'light',
    entityId: 'light.standing_lamp_black',
    data: '{}'
  }))
  await context.stop()
}

main()

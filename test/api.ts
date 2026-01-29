import plugin from '../src/index.js'
import { createStubContext } from './helpers/moltbot.js'

async function main() {
  const context = createStubContext()
  await plugin.register!(context.api)
  const listActionsResult = await context.tools['ha:actions_list'].execute('0', {})
  const content = listActionsResult.content[0]
  if (content.type !== 'text') { throw new Error('Invalid result') }
  const actions = JSON.parse(content.text)
  console.info('actions', actions)
  const result = await context.tools['ha:actions_run'].execute('1', {
    actions: [{
      actionId: 'turn_on',
      serviceId: 'light',
      entityId: 'light.standing_lamp_black',
      data: {
        rgb_color: [255, 0, 0]
      }
    }]
  })
  console.info('result', result)
}

main()

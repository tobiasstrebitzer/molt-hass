import { Type } from '@sinclair/typebox'
import type { MoltbotPluginDefinition } from 'moltbot/types'
import { HAClient } from './lib/HAClient.js'
import { PluginConfig } from './types/PluginConfig.js'
import { emptyPluginConfigSchema } from './util/config.js'
import { toolResult } from './util/tool.js'

interface RunActionParams {
  actionId: string
  serviceId: string
  entityId: string
  data: string
}

const plugin: MoltbotPluginDefinition = {
  id: 'molt-hass',
  name: 'Home Assistant',
  description: 'Moltbot Home Assistant Integration',
  configSchema: emptyPluginConfigSchema(),
  register(api) {
    const config = api.config.plugins?.entries?.['molt-hass']?.config as PluginConfig | undefined
    if (!config?.url) { throw new Error('Missing HASS config url (plugins.entries.molt-hass.config.url)') }
    const client = new HAClient({ url: config.url, accessToken: config.accessToken })

    api.registerTool({
      name: 'ha:actions_list',
      description: 'List all available actions',
      label: 'List Actions',
      parameters: Type.Object({}),
      async execute() {
        try {
          const actions = await client.listActions(['light', 'climate', 'cover'])
          return toolResult(actions)
        } catch (error) {
          return toolResult({ error })
        }
      }
    })

    api.registerTool({
      name: 'ha:action_run',
      description: 'Run a specific home automation action',
      label: 'Run Action',
      parameters: Type.Object({
        actionId: Type.String({ description: 'The actionId to run' }),
        serviceId: Type.String({ description: 'The serviceId the action belongs to' }),
        entityId: Type.String({ description: 'The entityId to run the action for' }),
        data: Type.String({ description: 'Json stringified action data / parameters' })
      }),
      async execute(_, params: RunActionParams) {
        try {
          const { serviceId, actionId, data, entityId } = params
          const action = `${serviceId}.${actionId}`
          const target = { entity_id: entityId }
          const result = await client.runSequence([{ action, data: JSON.parse(data), target }])
          return toolResult(result)
        } catch (error) {
          return toolResult({ error })
        }
      }
    })
  }
}

export default plugin

/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentTool } from '@mariozechner/pi-agent-core'
import { readFileSync } from 'fs'
import type { MoltbotPluginApi, MoltbotPluginDefinition, MoltbotPluginService } from 'moltbot/types'

export interface StubContext {
  api: MoltbotPluginApi
  config: MoltbotPluginApi['config']
  tools: Record<string, AgentTool<any, unknown>>
  stop: () => Promise<void>
}

export async function createStubContext(plugin: MoltbotPluginDefinition): Promise<StubContext> {
  let config: MoltbotPluginApi['config'] = JSON.parse(readFileSync('test/config.json', 'utf-8'))
  const services: MoltbotPluginService[] = []
  const tools: Record<string, AgentTool<any, unknown>> = {}
  const api: MoltbotPluginApi = {
    id: 'molt-hass',
    logger: console,
    name: 'Home Assistant',
    source: '/Users/atomic/projects/ai/molt/molt-hass/src/index.ts',
    on() { },
    registerChannel: () => { },
    registerCli: () => { },
    registerCommand: () => { },
    registerGatewayMethod: () => { },
    registerHook: () => { },
    registerHttpHandler: () => { },
    registerHttpRoute: () => { },
    registerProvider: () => { },
    registerService: (service) => { services.push(service) },
    registerTool: (tool) => { tools[tool.name] = tool as AgentTool<any, unknown> },
    resolvePath: (input) => input,
    runtime: {
      version: '2026.1.26',
      config: { loadConfig: () => config, writeConfigFile: async (value) => { config = value } },
      logging: { shouldLogVerbose: () => true, getChildLogger: () => console },
      state: { resolveStateDir: () => process.env.MOLTBOT_STATE_DIR! },
      channel: null!,
      media: null!,
      system: null!,
      tools: null!,
      tts: null!
    },
    description: 'Moltbot Home Assistant Integration',
    version: '1.0.0',
    config
  }
  await plugin.register!(api)
  await Promise.all(services.map(async (service) => { await service.start({ config, logger: console, stateDir: '.' }) }))

  const stop = async () => {
    await Promise.all(services.map(async (service) => { await service.stop?.({ config, logger: console, stateDir: '.' }) }))
  }

  return { api, config, tools, stop }
}

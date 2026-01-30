/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentTool } from '@mariozechner/pi-agent-core'
import { readFileSync } from 'fs'
import type { OpenClawPluginApi, OpenClawPluginDefinition, OpenClawPluginService } from 'openclaw/types'

export interface StubContext {
  api: OpenClawPluginApi
  config: OpenClawPluginApi['config']
  tools: Record<string, AgentTool<any, unknown>>
  stop: () => Promise<void>
}

export async function createStubContext(plugin: OpenClawPluginDefinition): Promise<StubContext> {
  let config: OpenClawPluginApi['config'] = JSON.parse(readFileSync('test/config.json', 'utf-8'))
  const services: OpenClawPluginService[] = []
  const tools: Record<string, AgentTool<any, unknown>> = {}
  const api: OpenClawPluginApi = {
    id: 'claw-hass',
    logger: console,
    name: 'Home Assistant',
    source: '/Users/atomic/projects/ai/claw-hass/src/index.ts',
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
      state: { resolveStateDir: () => process.env.OPENCLAW_STATE_DIR! },
      channel: null!,
      media: null!,
      system: null!,
      tools: null!,
      tts: null!
    },
    description: 'OpenClaw Home Assistant Integration',
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

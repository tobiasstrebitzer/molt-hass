import EventEmitter from 'events'
import { existsSync, mkdirSync } from 'fs'
import { Auth, callService, configColl, Connection, createConnection, createLongLivedTokenAuth, entitiesColl, HassConfig, HassEntities, HassServices, MessageBase, servicesColl } from 'home-assistant-js-websocket'
import { JSONSchema7 } from 'json-schema'
import { join } from 'path'
import { HAAction, HAActionDef } from '../types/HAActionDef.js'
import { HAActionResult } from '../types/HAActionResult.js'
import { HAArea } from '../types/HAArea.js'
import { HADevice } from '../types/HADevice.js'
import { HADisplayListResult } from '../types/HADisplayListResult.js'
import { EntityRecord } from '../types/HAEntityRecord.js'
import { HAManifest } from '../types/HAManifest.js'
import { HASearchResult } from '../types/HASearchResult.js'
import { HATranslations } from '../types/HATranslations.js'
import { ItemType } from '../types/ItemType.js'
import { wrapCollection, WrappedCollection } from '../util/collection.js'
import { FieldDef } from '../util/field.js'
import { createJsonCache, JsonCache } from './JsonCache.js'

export interface HAClientReadyEvent {
  config: HassConfig
  services: HassServices
  entities: HassEntities
}

export interface HAClientOptions {
  url: string
  accessToken: string
  cacheDir?: string
}

interface HAClientEventMap {
  'services': [HassServices]
  'entities': [HassEntities]
  'config': [HassConfig]
}

async function getAsyncAuth(options: HAClientOptions): Promise<Auth> {
  return createLongLivedTokenAuth(options.url, options.accessToken)
}

export class HAClient extends EventEmitter<HAClientEventMap> {
  private connection$: Promise<Connection>
  private configCollection: WrappedCollection<HassConfig>
  private servicesCollection: WrappedCollection<HassServices>
  private entitiesCollection: WrappedCollection<HassEntities>

  ready: Promise<HAClientReadyEvent>

  constructor(private options: HAClientOptions) {
    super()
    this.connection$ = getAsyncAuth(options).then((auth) => createConnection({ auth }))
    this.configCollection = wrapCollection(this.connection$.then(configColl), (state) => this.emit('config', state), this.cache('config'))
    this.servicesCollection = wrapCollection(this.connection$.then(servicesColl), (state) => this.emit('services', state), this.cache('services'))
    this.entitiesCollection = wrapCollection(this.connection$.then(entitiesColl), (state) => this.emit('entities', state), this.cache('entities'))
    this.ready = Promise.all([
      this.configCollection.promise,
      this.servicesCollection.promise,
      this.entitiesCollection.promise
    ]).then<HAClientReadyEvent>(([config, services, entities]) => ({ config, services, entities }))
  }

  get config() { return this.configCollection.value }
  get services() { return this.servicesCollection.value }
  get entities() { return this.entitiesCollection.value }

  async sendMessage<T>(data: MessageBase) {
    const connection = await this.connection$
    return connection.sendMessagePromise<T>(data)
  }

  async runSequence(sequence: HAAction[]) {
    const { context, response } = await this.sendMessage<HAActionResult>({ type: 'execute_script', sequence })
    return { context, response }
  }

  async runAction(params: HAAction) {
    return this.runSequence([params])
  }

  async callServiceLight(entityId: string, service: 'turn_on' | 'turn_off', data: object = {}) {
    const connection = await this.connection$
    return callService(connection, 'light', service, data, { entity_id: entityId })
  }

  getFrontendTranslations(category: string, language = 'en-GB'): Promise<HATranslations> {
    return this.cacheFn(`frontend.get_translations.${category}`, () => {
      return this.sendMessage<HATranslations>({ type: 'frontend/get_translations', category, language })
    })
  }

  getAreaRegistryList() {
    return this.cacheFn('config.area_registry.list', () => {
      return this.sendMessage<HAArea[]>({ type: 'config/area_registry/list' })
    })
  }

  getDeviceRegistryList() {
    return this.cacheFn('config.device_registry.list', () => {
      return this.sendMessage<HADevice[]>({ type: 'config/device_registry/list' })
    })
  }

  getEntityRegistryList() {
    return this.cacheFn('config.entity_registry.list', () => {
      return this.sendMessage<EntityRecord[]>({ type: 'config/entity_registry/list' })
    })
  }

  getEntityRegistryListForDisplay() {
    return this.cacheFn('config.entity_registry.list_for_display', () => {
      return this.sendMessage<HADisplayListResult>({ type: 'config/entity_registry/list_for_display' })
    })
  }

  getSearchRelated(itemType: ItemType, itemId: string) {
    return this.cacheFn(`search.related.${itemType}.${itemId}`, () => {
      return this.sendMessage<HASearchResult>({ type: 'search/related', item_type: itemType, item_id: itemId })
    })
  }

  getManifestList() {
    return this.cacheFn('manifest.list', () => {
      return this.sendMessage<HAManifest[]>({ type: 'manifest/list' })
    })
  }

  getManifest(integration: string) {
    return this.cacheFn(`manifest.list.${integration}`, () => {
      return this.sendMessage<HAManifest>({ type: 'manifest/get', integration })
    })
  }

  async listActions(serviceIds?: string[]) {
    await this.ready
    const { resources } = await this.getFrontendTranslations('services')
    const manifestList = await this.getManifestList()
    const devices = await this.getDeviceRegistryList()
    const deviceMap = Object.fromEntries(devices.map((device) => [device.id, device]))
    const entityRecords = await this.getEntityRegistryList()
    const entityRecordMap = Object.fromEntries(entityRecords.map((record) => [record.entity_id, record]))
    const serviceEntityIdMap = Object.values(this.entities).reduce<Record<string, string[]>>((obj, entity) => {
      const [serviceId] = entity.entity_id.split('.')
      if (!obj[serviceId]) { obj[serviceId] = [] }
      obj[serviceId].push(entity.entity_id)
      return obj
    }, {})
    const specifiedServiceIds = serviceIds ?? Object.keys(this.services)
    const actions = specifiedServiceIds.reduce<HAActionDef[]>((arr, serviceId) => {
      const serviceManifest = manifestList.find(({ domain }) => domain === serviceId)
      for (const actionId of Object.keys(this.services[serviceId])) {
        const entityIds = serviceEntityIdMap[serviceId]
        if (!entityIds) { return arr }
        arr.push({
          actionId,
          actionName: resources[`component.${serviceId}.services.${actionId}.name`] ?? actionId,
          description: resources[`component.${serviceId}.services.${actionId}.description`],
          serviceId,
          serviceName: serviceManifest?.name ?? serviceId,
          fields: this.generateActionSchema(serviceId, actionId, resources),
          entities: entityIds.map((entityId) => {
            const entity = this.entities[entityId]
            const record = entityRecordMap[entityId]
            const device = deviceMap[record?.device_id]
            const name = entity.attributes.friendly_name ?? record?.name ?? device?.name_by_user ?? device?.name
            return { entityId, name }
          })
        })
      }
      return arr
    }, [])
    return actions
  }

  generateActionSchema(serviceId: string, actionId: string, resources: Record<string, string> = {}): Pick<JSONSchema7, 'properties' | 'required'> {
    const action = this.services[serviceId][actionId]
    const properties: Record<string, JSONSchema7> = {}
    const required: string[] = []
    for (const [fieldName, field] of Object.entries(action.fields)) {
      const prefix = `component.${serviceId}.services.${actionId}.fields.${fieldName}`
      if (fieldName === 'advanced_fields') { continue }
      if (field.required) { required.push(fieldName) }
      const fieldSchema = this.generateFieldSchema(field)
      fieldSchema.title = resources[`${prefix}.name`]
      fieldSchema.description = resources[`${prefix}.description`]
      properties[fieldName] = fieldSchema
    }
    return { properties, required }
  }

  generateFieldSchema({ selector }: FieldDef): JSONSchema7 {
    if (!selector) { throw new Error('Missing selector') }
    const schema: JSONSchema7 = {}
    if (selector.text) {
      schema.type = 'string'
    } else if (selector.number) {
      schema.type = 'number'
      schema.minimum = selector.number.min
      schema.maximum = selector.number.max
    } else if (selector.color_rgb) {
      schema.type = 'array'
      schema.items = { type: 'number', minimum: 0, maximum: 255 }
      schema.minItems = 3
      schema.maxItems = 3
    } else if (selector.constant) {
      schema.const = selector.constant.value
      schema.title = selector.constant.label
    } else if (selector.color_temp) {
      schema.type = 'number'
      schema.minimum = selector.color_temp.min
      schema.maximum = selector.color_temp.max
      schema.description = `(unit: ${selector.color_temp.unit})`
    } else if (selector.select) {
      if (selector.select.multiple) {
        schema.type = 'array'
        schema.items = { type: 'string' }
      } else {
        schema.type = 'string'
      }
    }
    return schema
  }

  destroy() {
    this.configCollection.unsubscribe()
    this.servicesCollection.unsubscribe()
    this.entitiesCollection.unsubscribe()
    this.connection$.then((connection) => connection.close())
  }

  private cache<T>(name: string): JsonCache<T> | undefined {
    if (!this.options.cacheDir) { return undefined }
    if (!existsSync(this.options.cacheDir)) { mkdirSync(this.options.cacheDir, { recursive: true }) }
    return createJsonCache<T>(join(this.options.cacheDir, `${name}.json`))
  }

  private async cacheFn<T>(name: string, callback: () => Promise<T>) {
    const cache = this.cache<T>(name)
    if (!cache) { return callback() }
    const cachedValue = cache.read()
    if (cachedValue) { return cachedValue }
    return callback().then((value) => {
      cache.write(value)
      return value
    })
  }
}

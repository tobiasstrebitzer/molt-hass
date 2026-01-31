import { type JSONSchema7 } from 'json-schema'

export interface HAAction {
  action: string
  data: object
  target: { entity_id: string }
}

export interface HAActionEntity {
  entityId: string
  name?: string
}

export interface HAActionDef {
  actionId: string
  actionName: string
  description?: string
  serviceId: string
  serviceName: string
  entities: HAActionEntity[]
  fields: JSONSchema7
}

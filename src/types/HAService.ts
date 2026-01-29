/* eslint-disable @typescript-eslint/no-explicit-any */
export interface HAServiceFieldSelector {
  entity?: {
    domain?: string[]
    integration?: string
    multiple?: boolean
    reorder?: boolean
    supported_features?: number[]
  }
  number?: {
    min?: number
    max?: number
    step?: number | 'any'
    mode?: 'box' | 'slider'
    unit_of_measurement?: string
  }
  text?: {
    multiple?: boolean
    multiline?: boolean
  }
  boolean?: object
  select?: {
    options: string[]
    multiple?: boolean
    sort?: boolean
    custom_value?: boolean
    translation_key?: string
  }
  datetime?: object
  time?: object
  object?: {
    multiple?: boolean
  }
  state?: {
    hide_states?: string[]
    multiple?: boolean
  }
  theme?: {
    include_default?: boolean
  }
  statistic?: {
    multiple?: boolean
  }
  template?: object
  config_entry?: object
  device?: {
    integration?: string
    multiple?: boolean
  }
}

export interface HAServiceField {
  required?: boolean
  advanced?: boolean
  default?: any
  example?: any
  description?: string
  filter?: { supported_features?: number[] }
  selector?: HAServiceFieldSelector | null
}

export interface HAServiceEntity {
  domain?: string[]
  integration?: string
  supported_features?: number[]
}

export interface HAService {
  name?: string
  description?: string
  fields: Record<string, HAServiceField>
  target?: { entity?: HAServiceEntity[] }
  response?: { optional: boolean }
}

export interface HAServiceDomain {
  domain: string
  services: Record<string, HAService>
}

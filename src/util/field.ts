export interface FieldSelectorNumber {
  min: number
  max: number
  unit_of_measurement: string
  step: number
  mode: string
}

export interface FieldSelectorColorTemp {
  unit: 'kelvin'
  min: number
  max: number
}

export interface FieldSelectorText {
  multiline: boolean
  multiple: boolean
}

export interface FieldSelectorObject {
  multiple: boolean
}

export interface FieldSelectorSelect {
  custom_value: boolean
  multiple: boolean
  options: string[]
  sort: boolean
  translation_key: string
}

export interface FieldSelectorConstant {
  label: string
  value: string | boolean | number
}

export interface FieldSelectorMap {
  number?: FieldSelectorNumber
  color_temp?: FieldSelectorColorTemp
  color_rgb?: object
  text?: FieldSelectorText
  select?: FieldSelectorSelect
  constant?: FieldSelectorConstant
}

export interface FieldDef {
  example?: string | boolean | number
  default?: unknown
  required?: boolean
  advanced?: boolean
  selector?: FieldSelectorMap
  filter?: {
    supported_features?: number[]
    attribute?: Record<string, unknown[]>
  }
  name?: string
  description?: string
  advanced_fields?: {
    collapsed: boolean
    fields: Record<string, FieldDef>
  }
}

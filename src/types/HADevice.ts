export interface HADevice {
  id: string
  name: string
  area_id: string | null
  connections: string[]
  labels: string[]
  identifiers: [string[]]
  config_entries: string[]
  config_entries_subentries: Record<string, (null | string)[]>
  created_at: number
  modified_at: number
  entry_type: 'service' | null
  hw_version: string | null
  disabled_by: string | null
  configuration_url: string | null
  manufacturer: string | null
  model: string | null
  model_id: string | null
  name_by_user: string | null
  primary_config_entry: string
  serial_number: string | null
  sw_version: string | null
  via_device_id: string | null
}

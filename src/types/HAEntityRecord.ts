export interface EntityRecord {
  area_id: string | null
  categories: Record<string, unknown>
  config_entry_id: string
  config_subentry_id: string | null
  created_at: number
  device_id: string
  disabled_by: string | null
  entity_category: string | null
  entity_id: string
  has_entity_name: boolean
  hidden_by: string | null
  icon: string | null
  id: string
  labels: string[]
  modified_at: number
  name: string | null
  options: Record<string, unknown>
  original_name: string | null
  platform: string
  translation_key: string | null
  unique_id: string
}

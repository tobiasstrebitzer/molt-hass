export interface HAArea {
  area_id: string
  floor_id: string
  name: string
  icon: string
  labels: string[]
  aliases: string[]
  picture: string | null
  humidity_entity_id: string | null
  temperature_entity_id: string | null
  created_at: number
  modified_at: number
}

export interface HADisplayListEntity {
  di: string // Device ID
  ei: string // Entity ID
  en: string // Entity Name
  hn: boolean // Unknown
  lb: string[] // Labels
  pl: string // Platform
}

export interface HADisplayListResult {
  entities: HADisplayListEntity[]
  entity_categories: Record<number, string>
}

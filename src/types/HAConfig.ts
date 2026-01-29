export interface HAUnitSystem {
  length: string
  accumulated_precipitation: string
  area: string
  mass: string
  pressure: string
  temperature: string
  volume: string
  wind_speed: string
}

export interface HAConfig {
  allowlist_external_dirs: string[]
  allowlist_external_urls: string[]
  components: string[]
  config_dir: string
  config_source: string
  country: string
  currency: string
  debug: boolean
  elevation: number
  external_url: string
  internal_url: string
  language: string
  latitude: number
  location_name: string
  longitude: number
  radius: number
  recovery_mode: boolean
  safe_mode: boolean
  state: 'RUNNING' | 'STOPPED'
  time_zone: string
  unit_system: HAUnitSystem
  version: string
  whitelist_external_dirs: string[]
}

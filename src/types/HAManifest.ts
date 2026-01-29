export interface HAManifest {
  domain: string
  name: string
  codeowners: string[]
  documentation: string
  integration_type: 'entity'
  quality_scale: 'internal'
  is_built_in: boolean
  overwrites_built_in: boolean
}

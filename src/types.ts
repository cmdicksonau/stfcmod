export type ConfigFieldType = 'boolean' | 'number' | 'string'

export type ConfigField = {
  key: string
  label: string
  type: ConfigFieldType
  description?: string
  min?: number
  max?: number
  step?: number
}

export type ConfigGroup = {
  title: string
  fields: ConfigField[]
}

export type ConfigSection = {
  key: string
  title: string
  description: string
  groups: ConfigGroup[]
}

export type ConfigValue = boolean | number | string
export type ConfigState = Record<string, ConfigValue>

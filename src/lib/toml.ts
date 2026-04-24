import { configSections } from '../data/configSchema'
import type { ConfigState, ConfigValue } from '../types'

const trimComment = (line: string) => {
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (!inQuotes && line[i] === '#') {
      return line.slice(0, i)
    }
  }
  return line
}

const parseValue = (raw: string): ConfigValue => {
  const value = raw.trim()
  if (/^(true|false)$/i.test(value)) {
    return value.toLowerCase() === 'true'
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value)
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replaceAll('\\"', '"')
  }

  return value
}

const encodeString = (value: string) => `"${value.replaceAll('"', '\\"')}"`

export const parseToml = (content: string): Partial<ConfigState> => {
  const parsed: Partial<ConfigState> = {}
  let currentSection = ''

  for (const sourceLine of content.split(/\r?\n/)) {
    const line = trimComment(sourceLine).trim()
    if (!line) {
      continue
    }

    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1).trim()
      continue
    }

    const separator = line.indexOf('=')
    if (separator < 1) {
      continue
    }

    const key = line.slice(0, separator).trim()
    const rawValue = line.slice(separator + 1)
    const fullKey = `${currentSection}.${key}`
    parsed[fullKey] = parseValue(rawValue)
  }

  return parsed
}

export const serializeToml = (state: ConfigState): string => {
  const blocks: string[] = []

  for (const section of configSections) {
    blocks.push(`[${section.key}]`)

    for (const group of section.groups) {
      if (group.title) {
        blocks.push(`# ${group.title}`)
      }

      for (const field of group.fields) {
        const fullKey = `${section.key}.${field.key}`
        const value = state[fullKey]

        if (typeof value === 'boolean') {
          blocks.push(`${field.key} = ${value ? 'true' : 'false'}`)
        } else if (typeof value === 'number') {
          blocks.push(`${field.key} = ${Number.isFinite(value) ? value : 0}`)
        } else {
          blocks.push(`${field.key} = ${encodeString(value ?? '')}`)
        }
      }

      blocks.push('')
    }
  }

  return `${blocks.join('\n').trim()}\n`
}

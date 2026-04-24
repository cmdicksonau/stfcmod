import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './App.css'
import { configSections, defaultConfigState } from './data/configSchema'
import { parseToml, serializeToml } from './lib/toml'
import type { ConfigField, ConfigState, ConfigValue } from './types'

const links = [
  { href: '#home', label: 'Home' },
  { href: '#docs', label: 'Docs' },
  { href: '#downloads', label: 'Downloads' },
  { href: '#mod-config', label: 'Mod Config' },
]

const getFieldMap = () => {
  const map = new Map<string, ConfigField>()
  for (const section of configSections) {
    for (const group of section.groups) {
      for (const field of group.fields) {
        map.set(`${section.key}.${field.key}`, field)
      }
    }
  }
  return map
}

const fieldMap = getFieldMap()

const getTypedValue = (field: ConfigField, value: ConfigValue) => {
  if (field.type === 'boolean') {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') return value.toLowerCase() === 'true'
    return Boolean(value)
  }

  if (field.type === 'number') {
    if (typeof value === 'number') return value
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return String(value)
}

function App() {
  const [configState, setConfigState] = useState<ConfigState>(defaultConfigState)
  const [status, setStatus] = useState('Ready.')
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return configSections

    return configSections
      .map((section) => ({
        ...section,
        groups: section.groups
          .map((group) => ({
            ...group,
            fields: group.fields.filter((field) => {
              const haystack = `${field.key} ${field.label} ${field.description ?? ''}`.toLowerCase()
              return haystack.includes(query)
            }),
          }))
          .filter((group) => group.fields.length > 0),
      }))
      .filter((section) => section.groups.length > 0)
  }, [search])

  const tomlOutput = useMemo(() => serializeToml(configState), [configState])

  const updateValue = (fullKey: string, value: ConfigValue) => {
    setConfigState((prev) => ({ ...prev, [fullKey]: value }))
  }

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const parsed = parseToml(text)

    setConfigState((prev) => {
      const next = { ...prev }
      for (const [key, rawValue] of Object.entries(parsed)) {
        const field = fieldMap.get(key)
        if (!field || rawValue === undefined) continue
        next[key] = getTypedValue(field, rawValue)
      }
      return next
    })

    setStatus(`Imported ${file.name}.`)
    event.target.value = ''
  }

  const onDownload = () => {
    const blob = new Blob([tomlOutput], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'community_patch_settings.toml'
    link.click()
    URL.revokeObjectURL(url)
    setStatus('Downloaded community_patch_settings.toml')
  }

  const onCopy = async () => {
    await navigator.clipboard.writeText(tomlOutput)
    setStatus('Copied TOML to clipboard.')
  }

  const resetDefaults = () => {
    setConfigState(defaultConfigState)
    setStatus('Defaults restored.')
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell nav-shell">
          <a className="brand" href="#home" aria-label="STFC Community Mod home">
            STFC Community Mod
          </a>
          <nav aria-label="Primary">
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="shell">
        <section id="home" className="panel hero">
          <p className="eyebrow">Star Trek Fleet Command Community Mod</p>
          <h1>A modern home for the STFC mod and configuration workflow.</h1>
          <p>
            This website centralizes project information, setup instructions, release links, and a full
            web-based mod config builder compatible with <code>community_patch_settings.toml</code>.
          </p>
          <div className="hero-actions">
            <a className="button" href="#mod-config">
              Open Mod Config
            </a>
            <a className="button ghost" href="#downloads">
              Download Releases
            </a>
          </div>
        </section>

        <section id="docs" className="panel">
          <h2>Getting Started</h2>
          <ol>
            <li>Download the latest release assets for your platform.</li>
            <li>Install files into the game or launcher location from the official install guide.</li>
            <li>Generate or edit your config in the Mod Config section below.</li>
            <li>Save as <code>community_patch_settings.toml</code> and place it in the settings folder.</li>
            <li>Launch the game and validate values using <code>community_patch_runtime.vars</code>.</li>
          </ol>
        </section>

        <section id="downloads" className="panel">
          <h2>Download & Install</h2>
          <p>
            Official releases are published on GitHub and include Windows, macOS, and installer assets.
          </p>
          <div className="download-links">
            <a className="button" href="https://github.com/netniV/stfc-mod/releases/latest" target="_blank" rel="noreferrer">
              Latest release
            </a>
            <a className="button ghost" href="https://github.com/netniV/stfc-mod/releases" target="_blank" rel="noreferrer">
              All releases
            </a>
            <a className="button ghost" href="https://github.com/netniV/stfc-mod/blob/main/INSTALL.md" target="_blank" rel="noreferrer">
              Install guide
            </a>
          </div>
        </section>

        <section id="mod-config" className="panel">
          <h2>Mod Config Builder</h2>
          <p>
            Feature-complete web editor for STFC Community Mod settings with grouped controls, search,
            TOML import, clipboard copy, and export.
          </p>

          <div className="toolbar" role="group" aria-label="Config actions">
            <label htmlFor="config-search" className="sr-only">
              Search settings
            </label>
            <input
              id="config-search"
              type="search"
              placeholder="Search setting name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              Import TOML
            </button>
            <button type="button" onClick={onCopy}>
              Copy TOML
            </button>
            <button type="button" onClick={onDownload}>
              Download TOML
            </button>
            <button type="button" onClick={resetDefaults}>
              Reset defaults
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".toml,text/plain"
              onChange={onImport}
              className="hidden"
            />
          </div>

          <p className="status" aria-live="polite">
            {status}
          </p>

          <div className="config-grid">
            <div className="settings-panel">
              {filteredSections.length === 0 ? <p>No settings matched your search.</p> : null}
              {filteredSections.map((section) => (
                <section key={section.key} className="settings-section" aria-labelledby={`section-${section.key}`}>
                  <h3 id={`section-${section.key}`}>{section.title}</h3>
                  <p className="section-description">{section.description}</p>

                  {section.groups.map((group) => (
                    <details key={`${section.key}-${group.title}`} open>
                      <summary>{group.title}</summary>
                      <div className="field-grid">
                        {group.fields.map((field) => {
                          const fullKey = `${section.key}.${field.key}`
                          const value = configState[fullKey]

                          return (
                            <label key={fullKey} htmlFor={fullKey} className="field">
                              <span>
                                {field.label}
                                <small>{field.key}</small>
                              </span>

                              {field.type === 'boolean' ? (
                                <input
                                  id={fullKey}
                                  type="checkbox"
                                  checked={Boolean(value)}
                                  onChange={(event) => updateValue(fullKey, event.target.checked)}
                                />
                              ) : field.type === 'number' ? (
                                <input
                                  id={fullKey}
                                  type="number"
                                  value={Number(value)}
                                  step={field.step ?? 1}
                                  min={field.min}
                                  max={field.max}
                                  onChange={(event) => updateValue(fullKey, Number(event.target.value))}
                                />
                              ) : (
                                <input
                                  id={fullKey}
                                  type="text"
                                  value={String(value)}
                                  onChange={(event) => updateValue(fullKey, event.target.value)}
                                />
                              )}
                            </label>
                          )
                        })}
                      </div>
                    </details>
                  ))}
                </section>
              ))}
            </div>

            <aside className="preview-panel" aria-label="Generated TOML preview">
              <h3>TOML Preview</h3>
              <p>Live output for your current settings.</p>
              <textarea readOnly value={tomlOutput} spellCheck={false} />
            </aside>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell">
          <p>
            Maintained by the STFC Community Mod contributors. Support: <a href="https://discord.gg/PrpHgs7Vjs">Discord</a> ·{' '}
            <a href="https://github.com/netniV/stfc-mod">GitHub</a>
          </p>
        </div>
      </footer>
    </>
  )
}

export default App

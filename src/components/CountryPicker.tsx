import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import worldAtlas from 'world-atlas/countries-110m.json'
import { numericToAlpha2, countryName } from '../lib/countries'

interface Props {
  value: string[]
  onChange: (codes: string[]) => void
}

export function CountryPicker({ value, onChange }: Props) {
  function toggle(alpha2: string) {
    onChange(value.includes(alpha2) ? value.filter((c) => c !== alpha2) : [...value, alpha2])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-lg border border-neutral-300 bg-[#EFEEEA] dark:border-neutral-700 dark:bg-neutral-900">
        <ComposableMap width={400} height={190} projectionConfig={{ scale: 68 }}>
          <Geographies geography={worldAtlas as never}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const alpha2 = typeof geo.id === 'string' ? numericToAlpha2(geo.id) : null
                const selected = alpha2 ? value.includes(alpha2) : false
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => alpha2 && toggle(alpha2)}
                    className={alpha2 ? 'country-geo' : 'country-geo-disabled'}
                    fill={selected ? '#A6763D' : '#D7D5CF'}
                    stroke="#FAFAF7"
                    strokeWidth={0.4}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => toggle(code)}
              className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs dark:bg-neutral-800"
            >
              {countryName(code)} ×
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

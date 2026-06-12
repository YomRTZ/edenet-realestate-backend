import { useMemo, useState } from 'react'
import PropertyCard from '../components/PropertyCard.jsx'
import PropertyFilterSearch from '../components/PropertyFilterSearch.jsx'
import { propertiesMock } from '../mock/propertiesMock.js'

export default function Home() {
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [minBeds, setMinBeds] = useState(0)
  const [minBaths, setMinBaths] = useState(0)
  const [minPrice, setMinPrice] = useState('')


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return propertiesMock.filter((p) => {
      const matchesQuery = !q
        ? true
        : [p.title, p.description, p.location?.city, p.location?.state]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(q)

      const matchesType = filterType === 'ALL' ? true : p.listingType === filterType

      const beds = p.specs?.bedrooms ?? 0
      const baths = p.specs?.bathrooms ?? 0

      const matchesBeds = minBeds > 0 ? beds >= minBeds : true
      const matchesBaths = minBaths > 0 ? baths >= minBaths : true

      const parsedMinPrice = minPrice.trim() ? Number(String(minPrice).replace(/,/g, '')) : null
      const priceNumber = p.price && p.price !== '—' ? Number(String(p.price).replace(/,/g, '')) : null
      const matchesPrice = parsedMinPrice != null ? priceNumber != null && priceNumber >= parsedMinPrice : true

      return matchesQuery && matchesType && matchesBeds && matchesBaths && matchesPrice

    })
  }, [query, filterType, minBeds, minBaths, minPrice])


  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/70 via-transparent to-transparent" />
        <div className="relative p-7 md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                Web3-ready real estate marketplace UI
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Find your next property — fast, clean, and modern.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                This page uses a single-file mock dataset. Cards are reusable and designed for a premium browsing experience.
              </p>
            </div>

            <PropertyFilterSearch
              query={query}
              onQueryChange={setQuery}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              minBeds={minBeds}
              onMinBedsChange={setMinBeds}
              minBaths={minBaths}
              onMinBathsChange={setMinBaths}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              resultCount={filtered.length}
            />
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Featured Listings</h2>
          <div className="text-sm text-slate-500">Premium cards • Mock data • Remote images</div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onViewDetails={() => {
                // placeholder: wire later to a details page
                window.alert(`Details for: ${property.title}`)
              }}
              onContact={() => {
                window.alert(`Contact requested for: ${property.title}`)
              }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}


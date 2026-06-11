import { useMemo } from 'react'

const Badge = ({ tone = 'slate', children }) => {
  const className =
    tone === 'emerald'
      ? 'inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200'
      : tone === 'blue'
        ? 'inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200'
        : 'inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200'

  return <span className={className}>{children}</span>
}

const moneyLine = (price, currency) => {
  if (!price || price === '—') return null
  return `${currency} ${price}`
}

const rentLine = (rentRate, rentPeriod) => {
  if (!rentRate || rentRate === '—') return null
  const suffix = rentPeriod ? ` / ${rentPeriod}` : ''
  return `${rentRate} ${suffix}`
}

export default function PropertyCard({ property, onViewDetails, onContact }) {
  const locationText = useMemo(() => {
    const { city, state, country } = property.location || {}
    return [city, state, country].filter(Boolean).join(', ')
  }, [property])

  const imageAlt = `${property.title} cover`

  const listTone =
    property.listingType === 'RENT'
      ? 'emerald'
      : property.listingType === 'SALE'
        ? 'blue'
        : 'slate'

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative">
        <img
          src={property.imageUrl}
          alt={imageAlt}
          loading="lazy"
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/10 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone={listTone}>{property.listingType === 'BOTH' ? 'For Sale / Rent' : `For ${property.listingType}`}</Badge>
          {property.status === 'ACTIVE' ? (
            <Badge tone="emerald">Available</Badge>
          ) : (
            <Badge>Pending</Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white">{property.title}</h3>
              <p className="truncate text-xs text-white/80">{locationText}</p>
            </div>
            <div className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-right text-[11px] font-semibold text-white ring-1 ring-white/15">
              {property.id}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="line-clamp-2 text-sm text-slate-600">{property.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          {moneyLine(property.price, property.currency) ? (
            <span className="rounded-xl bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-900 ring-1 ring-inset ring-slate-200">
              Sale: {moneyLine(property.price, property.currency)}
            </span>
          ) : null}
          {rentLine(property.rentRate, property.rentPeriod) ? (
            <span className="rounded-xl bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-900 ring-1 ring-inset ring-slate-200">
              Rent: {rentLine(property.rentRate, property.rentPeriod)}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">Beds</div>
            <div className="text-sm font-semibold text-slate-900">{property.specs?.bedrooms ?? 0}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">Baths</div>
            <div className="text-sm font-semibold text-slate-900">{property.specs?.bathrooms ?? 0}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">Area</div>
            <div className="text-sm font-semibold text-slate-900">{property.specs?.areaSizeSqm ?? 0} sqm</div>
          </div>
        </div>

        <div className="flex gap-2">
            <button
            type="button"
            onClick={() =>
              onViewDetails?.(property) ??
              (window.location.pathname = `/property/${property.id}`)
            }
            className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            View Details
          </button>

          <button
            type="button"
            onClick={() => onContact?.(property)}
            className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-100"
          >
            Contact
          </button>
        </div>
      </div>
    </article>
  )
}


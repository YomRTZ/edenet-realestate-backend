import { useMemo, useState } from 'react'
import PropertyChatDrawer from '../../components/PropertyChatDrawer.jsx'
import RealEstateMap from '../../components/RealEstateMap.jsx'
import { propertiesMock } from '../../mock/propertiesMock.js'


function formatMoneyLine(value, currency) {

  if (!value || value === '—') return null
  return `${currency} ${value}`
}

export default function PropertyDetails() {

  const currentPath = window.location.pathname || ''
  const idFromPath = useMemo(() => {
    // Expected: /property/<id>
    const parts = currentPath.split('/').filter(Boolean)
    return parts.length >= 2 ? parts[1] : ''
  }, [currentPath])

  const property = propertiesMock.find((p) => p.id === idFromPath) || propertiesMock[0]
  const [activeTab, setActiveTab] = useState('overview')
  const [isChatOpen, setIsChatOpen] = useState(false)






  const locationText = useMemo(() => {
    const { city, state, country } = property.location || {}
    return [city, state, country].filter(Boolean).join(', ')
  }, [property])

  const saleLine = formatMoneyLine(property.price, property.currency)


  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-6">

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (window.location.pathname = '/')}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-200"
        >
          ← Back to listings
        </button>
        <div className="text-xs text-slate-500">Listing ID: <span className="font-semibold text-slate-700">{property.id}</span></div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative">
          <img
            src={property.imageUrl}
            alt={`${property.title} cover`}
            className="h-72 w-full object-cover md:h-96"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />

          <div className="absolute left-6 right-6 bottom-5 md:left-10 md:right-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                  <span
                    className={
                      property.listingType === 'RENT'
                        ? 'h-2 w-2 rounded-full bg-emerald-400'
                        : property.listingType === 'SALE'
                          ? 'h-2 w-2 rounded-full bg-blue-400'
                          : 'h-2 w-2 rounded-full bg-slate-400'
                    }
                  />
                  {property.listingType === 'BOTH'
                    ? 'For Sale / For Rent'
                    : property.listingType === 'SALE'
                      ? 'For Sale'
                      : 'For Rent'}
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">{property.title}</h1>
                <p className="mt-2 text-sm text-white/80">{locationText}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {saleLine ? (
                  <div className="rounded-2xl bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-white">
                    Sale: {saleLine}
                  </div>
                ) : null}
                {property.rentRate && property.rentRate !== '—' ? (
                  <div className="rounded-2xl bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-white">
                    Rent: {property.rentRate} {property.rentPeriod ? `/${property.rentPeriod}` : ''}
                  </div>
                ) : null}
                {property.status === 'ACTIVE' ? (
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                    Available
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                    Pending
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="w-full lg:max-w-xl">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
                <h2 className="text-base font-semibold text-slate-900">About this property</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{property.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(property.highlights || []).slice(0, 4).map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Map display */}
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-inset ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Location map</h2>
                    <p className="mt-1 text-sm text-slate-600">{locationText || '—'}</p>
                  </div>

                  <a
                    href={
                      (() => {
                        const { city, state, country } = property.location || {}
                        const q = [city, state, country].filter(Boolean).join(', ')
                        return q
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
                          : '#'
                      })()
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Open in Google Maps
                  </a>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <RealEstateMap 
                    height="300px"
                    center={property.location.lat && property.location.lng 
                      ? [property.location.lat, property.location.lng] 
                      : [40.7128, -74.0060]
                    }
                    zoom={14}
                    singleProperty={{
                      id: property.id,
                      title: property.title,
                      lat: property.location.lat,
                      lng: property.location.lng,
                      price: property.price
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-inset ring-slate-200">
                <h2 className="text-base font-semibold text-slate-900">Specs</h2>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-500">Beds</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{property.specs?.bedrooms ?? 0}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-500">Baths</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{property.specs?.bathrooms ?? 0}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-500">Area</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{property.specs?.areaSizeSqm ?? 0} sqm</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-500">Parking</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{property.specs?.parkingSpots ?? 0}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-500">Year built</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{property.specs?.yearBuilt ?? 0}</div>
                  </div>
                </div>
              </div>
            </div>


            <div className="w-full lg:flex-1">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-inset ring-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={
                      activeTab === 'overview'
                        ? 'rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white'
                        : 'rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200'
                    }
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className={
                      activeTab === 'documents'
                        ? 'rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white'
                        : 'rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200'
                    }
                  >
                    Documents
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('contact')}
                    className={
                      activeTab === 'contact'
                        ? 'rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white'
                        : 'rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200'
                    }
                  >
                    Contact
                  </button>
                </div>

                {activeTab === 'overview' ? (
                  <div className="mt-4">
                    <div className="text-sm text-slate-600">
                      This is a mock details view. Replace this panel with on-chain/DB data later.
                    </div>
                    <ul className="mt-3 space-y-2">
                      <li className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200">
                        <span className="font-semibold text-slate-900">Listing status:</span> {property.status}
                      </li>
                      <li className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200">
                        <span className="font-semibold text-slate-900">Type:</span> {property.listingType}
                      </li>
                      <li className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200">
                        <span className="font-semibold text-slate-900">Location:</span> {locationText}
                      </li>
                    </ul>
                  </div>
                ) : null}

                {activeTab === 'documents' ? (
                  <div className="mt-4">
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                      Documents section is placeholder for now.
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-inset ring-slate-200">
                        <div className="text-sm font-semibold text-slate-900">Certificate</div>
                        <div className="mt-1 text-xs text-slate-500">Mock PDF metadata</div>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-inset ring-slate-200">
                        <div className="text-sm font-semibold text-slate-900">Inspection Report</div>
                        <div className="mt-1 text-xs text-slate-500">Mock PDF metadata</div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeTab === 'contact' ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      Contact is placeholder. Hook this to your backend later.
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => window.alert(`Request sent for: ${property.title}`)}
                        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Request Viewing
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChatOpen(true)
                        }}
                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-200"
                      >
                        Send Message
                      </button>

                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PropertyChatDrawer
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        property={property}
      />


    </div>
  )
}



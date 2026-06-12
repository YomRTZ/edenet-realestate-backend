import { useState } from 'react'
import DocumentUploader from '../../components/DocumentUploader.jsx'


const PROPERTY_TYPES = [
  'HOUSE',
  'APARTMENT',
  'CONDO',
  'LAND',
  'COMMERCIAL',
  'TOWNHOUSE',
  'FARM',
]

const LISTING_TYPES = ['SALE', 'RENT', 'BOTH']

const STATUSES = [
  'PENDING_APPROVAL',
  'ACTIVE',
  'SOLD',
  'RENTED',
  'INACTIVE',
  'UNDER_CONTRACT',
]

const toNumberOrEmpty = (value) => {
  if (value === '' || value === null || value === undefined) return ''
  const n = Number(value)
  return Number.isFinite(n) ? n : ''
}

export default function AddProperties() {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

 
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [property_type, setPropertyType] = useState('')
  const [listing_type, setListingType] = useState('')
  const [status, setStatus] = useState('')

  const [price, setPrice] = useState('')

  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [area_size, setAreaSize] = useState('')
  const [lot_size, setLotSize] = useState('')
  const [year_built, setYearBuilt] = useState('')
  const [parking_spots, setParkingSpots] = useState('')

  const [property_tax, setPropertyTax] = useState(0)
  const [hoa_fees, setHoaFees] = useState('')

  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [zip_code, setZipCode] = useState('')



  
  const [pet_policy, setPetPolicy] = useState('')

  const [is_furnished, setIsFurnished] = useState(false)

  const validate = () => {
 
    if (!title.trim()) return 'title is required.'
    if (!description.trim()) return 'description is required.'
    if (!property_type) return 'property_type is required.'
    if (!listing_type) return 'listing_type is required.'
    if (!status) return 'status is required.'
    if (price === '' || !Number.isFinite(Number(price))) return 'price must be a valid number.'
    if (!state.trim()) return 'state is required.'
    if (!country.trim()) return 'country is required.'
 
    return ''
  }


  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) return setError(v)

    setSubmitting(true)
    try {
      const payload = {

        title: title.trim(),
        description: description.trim(),
        property_type,
        listing_type,
        status,
        price: toNumberOrEmpty(price),
        bedrooms: toNumberOrEmpty(bedrooms),
        bathrooms: toNumberOrEmpty(bathrooms),
        area_size: toNumberOrEmpty(area_size),
        lot_size: toNumberOrEmpty(lot_size),
        year_built: toNumberOrEmpty(year_built),
        parking_spots: toNumberOrEmpty(parking_spots),
        property_tax: toNumberOrEmpty(property_tax),
        hoa_fees: toNumberOrEmpty(hoa_fees),
        city: city.trim(),
        state: state.trim(),
        zip_code: zip_code.trim(),
        country: country.trim(),
 
     

        pet_policy: pet_policy.trim(),
        is_furnished: Boolean(is_furnished),
        // id/DEFAULT uuid handled by DB on backend
      }

      console.log('AddProperties payload:', payload)
      alert('Property submitted (see console for payload).')
    } catch (err) {
      setError(err?.message || 'Failed to submit property')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Add Property</h1>
        <p className="mt-1 text-sm text-slate-600">Create a new real estate listing.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <div className="text-sm font-medium text-slate-900">title</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Condo with City View"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium text-slate-900">description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Property description"
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block sm:col-span-1">
                <div className="text-sm font-medium text-slate-900">property_type</div>
                <select
                  value={property_type}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select type</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-1">
                <div className="text-sm font-medium text-slate-900">listing_type</div>
                <select
                  value={listing_type}
                  onChange={(e) => setListingType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select listing type</option>
                  {LISTING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-1">
                <div className="text-sm font-medium text-slate-900">status</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select status</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-medium text-slate-900">price</div>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 250000"
                  inputMode="decimal"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={is_furnished}
                  onChange={(e) => setIsFurnished(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span className="text-sm font-medium text-slate-900">is_furnished</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <div className="text-sm font-medium text-slate-900">bedrooms</div>
                <input
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="e.g. 2"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium text-slate-900">bathrooms</div>
                <input
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="e.g. 2"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium text-slate-900">parking_spots</div>
                <input
                  value={parking_spots}
                  onChange={(e) => setParkingSpots(e.target.value)}
                  placeholder="e.g. 1"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <div className="text-sm font-medium text-slate-900">area_size</div>
                <input
                  value={area_size}
                  onChange={(e) => setAreaSize(e.target.value)}
                  placeholder="e.g. 1200"
                  inputMode="decimal"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium text-slate-900">lot_size</div>
                <input
                  value={lot_size}
                  onChange={(e) => setLotSize(e.target.value)}
                  placeholder="e.g. 5000"
                  inputMode="decimal"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium text-slate-900">year_built</div>
                <input
                  value={year_built}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  placeholder="e.g. 2018"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-medium text-slate-900">property_tax</div>
                <input
                  value={property_tax}
                  onChange={(e) => setPropertyTax(e.target.value)}
                  placeholder="0"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium text-slate-900">hoa_fees</div>
                <input
                  value={hoa_fees}
                  onChange={(e) => setHoaFees(e.target.value)}
                  placeholder="e.g. 150"
                  inputMode="decimal"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-lg font-semibold text-slate-900">Address & Media</div>

          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <div className="text-sm font-medium text-slate-900">city</div>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder=""
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-900">country</div>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder=""
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block sm:col-span-1">
                <div className="text-sm font-medium text-slate-900">state</div>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                placeholder=""
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>


              <label className="block sm:col-span-1">
                <div className="text-sm font-medium text-slate-900">zip_code</div>
                <input
                  value={zip_code}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="e.g. 94107"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>

            <label className="block">
              <div className="text-sm font-medium text-slate-900">pet_policy</div>
              <input
                value={pet_policy}
                onChange={(e) => setPetPolicy(e.target.value)}
                placeholder="e.g. Cats allowed"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <div className="pt-2">
              <DocumentUploader label="Upload property documents / images" />
            </div>

          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Add Property'}
          </button>
        </div>
      </form>
    </div>
  )
}


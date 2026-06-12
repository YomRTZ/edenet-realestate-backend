import { useEffect, useId, useState } from 'react'

export default function PropertyFilterSearch({
  query,
  onQueryChange,
  filterType,
  onFilterTypeChange,
  minBeds,
  onMinBedsChange,
  minBaths,
  onMinBathsChange,
  minPrice,
  onMinPriceChange,
  resultCount,
}) {

  const inputId = useId()
  const selectId = useId()
  const [isOpen, setIsOpen] = useState(false)

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const openBtnClass =
    'rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800'

  return (
    <div className="w-full md:max-w-md">
      {/* compact button */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          className={openBtnClass}
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          Search & Filter
        </button>
      </div>

      {/* modal */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-[92%] max-w-xl rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200">

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Filter listings</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search by title, city, or state. Then tap Apply.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close filter"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  id={inputId}
                  value={query}
                  onChange={(e) => onQueryChange?.(e.target.value)}
                  placeholder="Search by city, state, or title"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-emerald-500"
                />

                <select
                  id={selectId}
                  value={filterType}
                  onChange={(e) => onFilterTypeChange?.(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All</option>
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                  <option value="BOTH">Sale / Rent</option>
                </select>
              </div>

              {/* Advanced filters */}
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <div className="mb-1 text-xs font-medium text-slate-600">Min beds</div>
                  <input
                    value={minBeds}
                    onChange={(e) => onMinBedsChange?.(Number(e.target.value) || 0)}
                    inputMode="numeric"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="Any"
                  />
                </div>

                <div>
                  <div className="mb-1 text-xs font-medium text-slate-600">Min baths</div>
                  <input
                    value={minBaths}
                    onChange={(e) => onMinBathsChange?.(Number(e.target.value) || 0)}
                    inputMode="numeric"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="Any"
                  />
                </div>

                <div>
                  <div className="mb-1 text-xs font-medium text-slate-600">Min price</div>
                  <input
                    value={minPrice}
                    onChange={(e) => onMinPriceChange?.(e.target.value)}
                    inputMode="numeric"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="e.g. 420000"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">

                <div>
                  Showing{' '}
                  <span className="font-semibold text-slate-700">{resultCount}</span> listings
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  onQueryChange?.('')
                  onFilterTypeChange?.('ALL')
                  onMinBedsChange?.(0)
                  onMinBathsChange?.(0)
                  onMinPriceChange?.('')
                }}

                className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-100"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Apply
              </button>
            </div>

            {/* note: backend wiring placeholder */}
              <div className="mt-3 text-[11px] text-slate-400">
              Advanced filters (beds/baths/price/etc.) can be added once Home state wiring is implemented.
            </div>

          </div>
        </div>
      ) : null}
    </div>
  )
}


import { useId } from 'react'

export default function PropertyFilterSearch({
  query,
  onQueryChange,
  filterType,
  onFilterTypeChange,
  resultCount,
}) {
  const inputId = useId()
  const selectId = useId()

  return (
    <div className="w-full md:max-w-md">
      <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-inset ring-slate-200 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            id={inputId}
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder="Search by city, state, or title"
            className="w-full flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-emerald-500"
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
        <div className="mt-2 text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{resultCount}</span>{' '}
          listings
        </div>
      </div>
    </div>
  )
}


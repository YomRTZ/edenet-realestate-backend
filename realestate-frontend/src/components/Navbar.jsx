export default function Navbar() {
  const currentPath = window.location.pathname || '/'

  // Navbar is only meant for the Home screen.
  // Hide it on dashboard/citizen pages (and any other routes).
  if (currentPath !== '/') return null

  return (
    <div className="w-full">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="text-base font-semibold text-slate-900">Realstate</div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={() => (window.location.pathname = '/')}
          >
            Home
          </button>

          <button
            type="button"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
            onClick={() => (window.location.pathname = '/dashboard')}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}




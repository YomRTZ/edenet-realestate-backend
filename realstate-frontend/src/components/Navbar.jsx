export default function Navbar() {
  const currentPath = window.location.pathname || '/'
  const isUserProfile = currentPath === '/userprofile'
  const isAddProperty = currentPath === '/addproperties'
  const isPortal = currentPath === '/portal'

  const homeClass = isUserProfile || isAddProperty || isPortal
    ? 'rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200'
    : 'rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white'

  const profileClass = isUserProfile
    ? 'rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white'
    : 'rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200'

  const addPropertyClass = isAddProperty
    ? 'rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white'
    : 'rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200'
  return (
    <div className="w-full">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="text-base font-semibold text-slate-900">Realstate</div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className={homeClass}
            onClick={() => (window.location.pathname = '/')}
          >
            Home
          </button>

          <button
            type="button"
            className={profileClass}
            onClick={() => (window.location.pathname = '/userprofile')}
          >
            UserProfile
          </button>

          <button
            type="button"
            className={addPropertyClass}
            onClick={() => (window.location.pathname = '/addproperties')}
          >
            Add Property
          </button>

        </div>


      </div>
    </div>
  )
}



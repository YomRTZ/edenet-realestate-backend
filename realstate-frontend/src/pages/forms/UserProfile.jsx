import { useState } from 'react'
import DocumentUploader from '../../components/DocumentUploader.jsx'

export default function UserProfile() {
  const [country, setCountry] = useState('')
  const [cityAddress, setCityAddress] = useState('')
  const [gender, setGender] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [error, setError] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!country.trim()) return setError('Country is required.')
    if (!cityAddress.trim()) return setError('City address is required.')
    if (!gender.trim()) return setError('Gender is required.')
    if (!fullName.trim()) return setError('Full name is required.')
    if (!email.trim()) return setError('Email is required.')
    if (!phone.trim()) return setError('Phone is required.')

    // No backend profile endpoint exists in this repo yet.
    // We still prepare the payload so it can be wired later.
    const payload = {
      country: country.trim(),
      cityAddress: cityAddress.trim(),
      gender,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      submittedAt: new Date().toISOString(),
    }


    console.log('UserProfile payload:', payload)
    alert('Profile submitted (see console for payload).')

  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">User Profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Add your address and personal information, then upload supporting documents.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4">


            <label className="block">
              <div className="text-sm font-medium text-slate-900">Full name</div>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>


            <label className="block">
              <div className="text-sm font-medium text-slate-900">Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />

            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-900">Phone</div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>
                        <label className="block">
              <div className="text-sm font-medium text-slate-900">Country</div>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />

            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-900">City address</div>
              <input
                value={cityAddress}
                onChange={(e) => setCityAddress(e.target.value)}
                placeholder="e.g. New York"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>


            <label className="block">
              <div className="text-sm font-medium text-slate-900">Gender</div>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
              >

                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </label>
          </div>
        </div>


        <div>
          <DocumentUploader label="Upload documents for verification" />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Submit profile
          </button>
        </div>
      </form>
    </div>
  )
}


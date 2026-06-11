import { useMemo, useRef, useState } from 'react'

const MAX_FILES = 20
const DEFAULT_ENDPOINT = '/api/uploads'

function prettyBytes(bytes) {
  if (!Number.isFinite(bytes)) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

export default function DocumentUploader({
  endpoint = DEFAULT_ENDPOINT,
  className = '',
  label = 'Upload documents / images / files',
}) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploaded, setUploaded] = useState([])
  const [error, setError] = useState('')

  const accept = useMemo(
    () => [
      // images
      'image/*',
      // common docs
      'application/pdf',
      '.pdf',
      'application/msword',
      '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.docx',
      'application/vnd.ms-excel',
      '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xlsx',
      'application/vnd.ms-powerpoint',
      '.ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.pptx',
      // text
      'text/plain',
      '.txt',
    ].join(','),
    [],
  )

  const pickFiles = () => inputRef.current?.click()

  const onChange = (e) => {
    const list = Array.from(e.target.files || [])
    setError('')

    if (list.length > MAX_FILES) {
      setError(`Please select up to ${MAX_FILES} files.`)
      setFiles(list.slice(0, MAX_FILES))
      return
    }

    setFiles(list)
  }

  const removeFileAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setUploaded([])

    if (!files.length) {
      setError('Select at least one file.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Upload failed (${res.status})`)
      }

      const data = await res.json()
      setUploaded(data?.files || [])
      setFiles([])

      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError(err?.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`w-full max-w-3xl ${className}`}>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <div className="text-lg font-semibold text-slate-900">{label}</div>
            <div className="mt-1 text-sm text-slate-600">
              Supports documents, images and other files (up to {MAX_FILES}).
            </div>
          </div>

          <button
            type="button"
            onClick={pickFiles}
            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={isUploading}
          >
            Choose files
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 pt-0">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple
            accept={accept}
            onChange={onChange}
          />

          <div
            className="mt-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4"
            role="region"
            aria-label="Selected files"
          >
            {files.length === 0 ? (
              <div className="text-sm text-slate-600">
                No files selected yet. Click <span className="font-medium">Choose files</span>.
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((f, idx) => {
                  const isImg = f.type?.startsWith('image/')
                  return (
                    <div
                      key={`${f.name}_${f.size}_${idx}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                          {isImg ? (
                            <span aria-hidden>🖼️</span>
                          ) : f.type?.includes('pdf') || f.name.toLowerCase().endsWith('.pdf') ? (
                            <span aria-hidden>📄</span>
                          ) : (
                            <span aria-hidden>📎</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">{f.name}</div>
                          <div className="text-xs text-slate-600">{prettyBytes(f.size)} • {f.type || 'unknown'}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFileAt(idx)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        disabled={isUploading}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {uploaded.length ? (
            <div className="mt-4">
              <div className="text-sm font-semibold text-slate-900">Uploaded files</div>
              <ul className="mt-2 space-y-2">
                {uploaded.map((f) => (
                  <li key={f.url || f.storedName} className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{f.originalName || f.storedName}</div>
                        <div className="text-xs text-slate-600">{f.mimeType || f.mimeType === '' ? f.mimeType : ''}</div>
                      </div>
                      {f.url ? (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          View
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Endpoint: <span className="font-mono">{endpoint}</span>
            </div>

            <button
              type="submit"
              disabled={isUploading || files.length === 0}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


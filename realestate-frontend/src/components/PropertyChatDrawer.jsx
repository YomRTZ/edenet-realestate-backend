import { useMemo, useState } from 'react'

export default function PropertyChatDrawer({
  open,
  onClose,
  property,
  initialMessages = [],
}) {
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState(
    initialMessages.length
      ? initialMessages
      : [
          { id: 1, from: 'owner', text: 'Hi! Thanks for your interest. How can I help?' },
          { id: 2, from: 'you', text: 'Hello 👋 I would like more details about the property.' },
        ],
  )

  const ownerName = useMemo(() => {
    return 'Property owner'
  }, [])

  const sendChatMessage = () => {
    const text = chatInput.trim()
    if (!text) return

    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), from: 'you', text },
      { id: Date.now() + 1, from: 'owner', text: 'Got it — I’ll get back to you shortly.' },
    ])
    setChatInput('')
  }

  return (
    <div
      className={
        open
          ? 'fixed inset-0 z-50 bg-black/30'
          : 'pointer-events-none fixed inset-0 z-50 bg-black/0 opacity-0'
      }
      onClick={onClose}
      role="presentation"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className={
          open
            ? 'absolute right-0 top-0 h-full w-full max-w-md translate-x-0 transform bg-white shadow-xl transition-transform duration-[1000ms] ease-out'
            : 'absolute right-0 top-0 h-full w-full max-w-md translate-x-full transform bg-white shadow-xl transition-transform duration-[1000ms] ease-out'
        }
        aria-label="Chat"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{ownerName}</div>
            <div className="truncate text-xs text-slate-500">{property?.title ?? ''}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div className="flex h-[calc(100vh-58px-64px)] flex-col px-4 py-4 overflow-y-auto">
          <div className="space-y-3">
            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={m.from === 'you' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={
                    m.from === 'you'
                      ? 'max-w-[75%] rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white'
                      : 'max-w-[75%] rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-900'
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendChatMessage()
              }}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={sendChatMessage}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Mock chat UI — connect to backend later.
          </div>
        </div>
      </aside>
    </div>
  )
}


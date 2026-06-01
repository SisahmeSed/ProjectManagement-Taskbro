import { useEffect, useState, useRef } from "react"
import { useMembers } from "../../store/MemberContext"
import { getAllMembers } from "../../api/members.api"

const AVATAR_COLORS = [
  "bg-violet-500", "bg-sky-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-indigo-500",
  "bg-pink-500", "bg-teal-500", "bg-orange-500",
]
const getColorClass = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const STATUS_COLORS = ["bg-green-400", "bg-yellow-400", "bg-red-400", "bg-gray-300"]
const getStatus = (id = "") => STATUS_COLORS[id.charCodeAt(0) % STATUS_COLORS.length]

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-100" />
      </div>
      <div className="flex-1 min-w-0 border-b border-gray-100 pb-4">
        <div className="h-3.5 w-1/3 bg-gray-100 rounded mb-2" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

function MemberRow({ member, selected, onClick }) {
  const initials = (member.user_id || "U").slice(0, 2).toUpperCase()
  const colorClass = getColorClass(member.user_id || "")
  const statusColor = getStatus(member.user_id || "")

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 text-left
        ${selected ? "bg-gray-50" : "hover:bg-gray-50/70"}`}
    >
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white font-semibold text-sm`}>
          {initials}
        </div>
        <span className={`absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border-2 border-white`} />
      </div>

      <div className="flex-1 min-w-0 border-b border-gray-100 pb-3.5">
        <p className="font-semibold text-sm text-gray-900 truncate">
          {member.user_id || "Unknown"}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {member.email || "No email provided"}
        </p>
      </div>

      <svg className="w-4 h-4 text-gray-300 shrink-0 -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

function MemberDetail({ member, onClose }) {
  if (!member) return null
  const initials = (member.user_id || "U").slice(0, 2).toUpperCase()
  const colorClass = getColorClass(member.user_id || "")
  const statusColor = getStatus(member.user_id || "")

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-100 shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-700">Profile</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center gap-6">
        <div className="relative">
          <div className={`w-24 h-24 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-3xl shadow-lg`}>
            {initials}
          </div>
          <span className={`absolute bottom-1 right-1 w-4 h-4 ${statusColor} rounded-full border-2 border-white shadow`} />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">{member.user_id || "Unknown"}</h2>
          <p className="text-sm text-gray-400 mt-1">{member.email || "No email"}</p>
        </div>

        <div className="w-full space-y-2 mt-2">
          {[
            { label: "User ID", value: member.user_id || "—" },
            { label: "Email", value: member.email || "—" },
            { label: "Role", value: member.role || "Member" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-medium text-gray-400">{label}</span>
              <span className="text-sm font-medium text-gray-700 truncate max-w-[60%] text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MembersPanel({ open, onClose }) {
  const { members, setMembers, loading, setLoading, error, setError } = useMembers()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
   if (!open) { setDetailOpen(false); setSelected(null); return }
    const fetchMembers = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getAllMembers()
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data) ? res.data : []
        setMembers(list)
      } catch {
        setError("Could not load members.")
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
    setQuery("")
    setSelected(null)
    setDetailOpen(false)
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 300)
  }, [open])

  const filtered = members.filter((m) => {
    const q = query.toLowerCase()
    return (
      (m.user_id || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q)
    )
  })

  const grouped = filtered.reduce((acc, m) => {
    const letter = (m.user_id || "?")[0].toUpperCase()
    ;(acc[letter] = acc[letter] || []).push(m)
    return acc
  }, {})

  const handleSelect = (m) => {
    setSelected(m)
    setDetailOpen(true)
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full z-40 flex shadow-2xl
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(420px, 100vw)" }}
      >
        <div
          className={`w-full h-full bg-white flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${detailOpen ? "-translate-x-full" : "translate-x-0"}`}
        >
          <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">Members</h1>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5 bg-gray-100 rounded-xl px-3.5 py-2.5">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search members…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {!loading && !error && members.length > 0 && (
            <p className="px-5 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
              {filtered.length} member{filtered.length !== 1 ? "s" : ""}
            </p>
          )}

          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="mx-4 mt-2 rounded-xl px-4 py-3 text-sm bg-red-50 border border-red-100 text-red-600">
                ⚠️ {error}
              </div>
            )}

            {loading && [...Array(7)].map((_, i) => <MemberSkeleton key={i} />)}

            {!loading && !error && filtered.length === 0 && query && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                <span className="text-4xl">🔍</span>
                <p className="font-semibold text-gray-700">No results for "{query}"</p>
                <p className="text-sm text-gray-400">Try a different name or email</p>
              </div>
            )}

            {!loading && !error && members.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                <span className="text-4xl">👥</span>
                <p className="font-semibold text-gray-700">No members yet</p>
                <p className="text-sm text-gray-400">Members appear once they sign up</p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 &&
              Object.keys(grouped).sort().map((letter) => (
                <div key={letter}>
                  <div className="px-5 pt-4 pb-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{letter}</span>
                  </div>
                  {grouped[letter].map((m) => (
                    <MemberRow
                      key={m.id ?? m.user_id}
                      member={m}
                      selected={selected?.user_id === m.user_id}
                      onClick={() => handleSelect(m)}
                    />
                  ))}
                </div>
              ))
            }
          </div>
        </div>

        <div
          className={`absolute inset-0 bg-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${detailOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <MemberDetail
            member={selected}
            onClose={() => setDetailOpen(false)}
          />
        </div>
      </div>
    </>
  )
}
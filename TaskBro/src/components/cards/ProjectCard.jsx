import { useState } from "react"
import EditProjectModal from "../modals/EditProjectModal"

function isOnHold(dateStr) {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() > 365 * 24 * 60 * 60 * 1000
}

function fmtDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const CARD_PALETTES = [
  {
    bg: "#0d0d0d", border: "rgba(255,255,255,0.08)",
    blob1: "rgba(255,255,255,0.055)", blob2: "rgba(255,255,255,0.03)",
    divider: "rgba(255,255,255,0.08)",
    descColor: "rgba(255,255,255,0.32)", metaColor: "rgba(255,255,255,0.35)",
    userColor: "rgba(255,255,255,0.38)", avatarBg: "rgba(255,255,255,0.12)",
    statusBg: "rgba(52,211,153,0.15)", statusColor: "#34d399", dotColor: "#34d399",
  },
  {
    bg: "#1a52d4", border: "rgba(255,255,255,0.05)",
    blob1: "rgba(255,255,255,0.13)", blob2: "rgba(255,255,255,0.07)",
    divider: "rgba(255,255,255,0.18)",
    descColor: "rgba(255,255,255,0.72)", metaColor: "rgba(255,255,255,0.78)",
    userColor: "rgba(255,255,255,0.72)", avatarBg: "rgba(255,255,255,0.2)",
    statusBg: "rgba(255,255,255,0.16)", statusColor: "#fff", dotColor: "rgba(255,255,255,0.9)",
  },
  {
    bg: "#e8461f", border: "rgba(255,255,255,0.05)",
    blob1: "rgba(255,255,255,0.12)", blob2: "rgba(255,255,255,0.06)",
    divider: "rgba(255,255,255,0.18)",
    descColor: "rgba(255,255,255,0.72)", metaColor: "rgba(255,255,255,0.78)",
    userColor: "rgba(255,255,255,0.72)", avatarBg: "rgba(255,255,255,0.2)",
    statusBg: "rgba(255,255,255,0.16)", statusColor: "#fff", dotColor: "rgba(255,255,255,0.9)",
  },
  {
    bg: "#0d2818", border: "rgba(255,255,255,0.07)",
    blob1: "rgba(255,255,255,0.07)", blob2: "rgba(255,255,255,0.04)",
    divider: "rgba(255,255,255,0.1)",
    descColor: "rgba(255,255,255,0.38)", metaColor: "rgba(255,255,255,0.4)",
    userColor: "rgba(255,255,255,0.42)", avatarBg: "rgba(255,255,255,0.13)",
    statusBg: "rgba(74,222,128,0.2)", statusColor: "#4ade80", dotColor: "#4ade80",
  },
  {
    bg: "#1e0a3c", border: "rgba(255,255,255,0.07)",
    blob1: "rgba(255,255,255,0.09)", blob2: "rgba(255,255,255,0.05)",
    divider: "rgba(255,255,255,0.1)",
    descColor: "rgba(255,255,255,0.4)", metaColor: "rgba(255,255,255,0.42)",
    userColor: "rgba(255,255,255,0.45)", avatarBg: "rgba(255,255,255,0.15)",
    statusBg: "rgba(167,139,250,0.2)", statusColor: "#c4b5fd", dotColor: "#c4b5fd",
  },
]

export function pickPalette(id) {
  return CARD_PALETTES[id % CARD_PALETTES.length]
}

function CardMenu({ onEdit, darkMode = false }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        className={`w-5.5 h-5.5 rounded-md flex items-center justify-center transition-all cursor-pointer border ${
          open
            ? darkMode ? "bg-white/20 border-white/20 text-white" : "bg-gray-100 border-gray-200 text-gray-700"
            : darkMode
              ? "bg-transparent border-transparent text-white/30 hover:bg-white/15 hover:text-white/70 hover:border-white/20"
              : "bg-transparent border-transparent text-gray-300 hover:bg-gray-100 hover:text-gray-600 hover:border-gray-200"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="7" cy="2.5" r="1.2"/><circle cx="7" cy="7" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-30 w-35 bg-white rounded-[10px] border border-gray-200 shadow-xl p-1 animate-[menuIn_0.12s_ease-out]">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit() }}
            className="w-full text-left px-2.5 py-1.5 text-[12px] font-medium text-gray-700 rounded-md flex items-center gap-2 bg-transparent border-none cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 1.5l2 2-6.5 6.5H2v-2L8.5 1.5z"/>
            </svg>
            Edit project
          </button>
        </div>
      )}
    </div>
  )
}

export function ProjectSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="h-2 w-14 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>
          <div className="w-5.5 h-5.5 rounded-md" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>
        <div className="h-6 w-[72%] rounded animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} />
        <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="h-2.5 w-[80%] rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="h-2.5 w-[55%] rounded animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="h-2.5 w-20 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
      </div>
    </div>
  )
}

export default function ProjectCard({ project, index, onClick, onRefresh, onSuccess, members = [] }) {
  const [editOpen, setEditOpen] = useState(false)

  const name        = project.name || project.project_name || "Untitled"
  const description = project.description || ""
  const createdAt   = project.created_at || ""
  const updatedAt   = project.updated_at || ""
  const userId      = project.user_id ?? ""

  const onHold  = isOnHold(updatedAt)
  const palette = pickPalette(project.id ?? index)

  return (
    <>
      <div
        onClick={onClick}
        className="relative cursor-pointer select-none flex flex-col overflow-hidden rounded-3xl"
        style={{
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          transform: "translateZ(0)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-4px)"
          e.currentTarget.style.boxShadow = "0 20px 44px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.15)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)"
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)"
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", top: "-28px", left: "-20px", width: "75%", height: "130px", borderRadius: "60% 55% 50% 65% / 55% 60% 50% 60%", background: palette.blob1, pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", top: "-10px", left: "28%", width: "55%", height: "95px", borderRadius: "50% 65% 55% 50% / 60% 50% 65% 55%", background: palette.blob2, pointerEvents: "none" }} />

        <div className="relative flex items-center justify-between px-4 pt-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full text-[9px] font-bold shrink-0"
              style={{ width: "26px", height: "26px", background: palette.avatarBg, border: "1px solid rgba(255,255,255,0.22)", color: "#fff" }}>
              U{userId}
            </div>
            <span className="text-[11px] font-medium" style={{ color: palette.userColor }}>user {userId}</span>
          </div>
          <CardMenu onEdit={() => setEditOpen(true)} darkMode />
        </div>

        <p className="relative px-4 text-[21px] font-bold leading-tight tracking-tight line-clamp-2 mb-3" style={{ color: "#fff" }}>{name}</p>

        <div className="mx-4 mb-3" style={{ height: "1px", background: palette.divider }} />

        <div className="relative px-4 mb-4 flex items-start justify-between" style={{ minHeight: "32px" }}>
          <div style={{ flex: 1 }}>
            {description
              ? <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: palette.descColor }}>{description}</p>
              : <p className="text-[12px] italic" style={{ color: palette.descColor }}>No description</p>
            }
          </div>
          <span className="text-[19px] font-extrabold leading-none ml-2 shrink-0" style={{ color: "rgba(255,255,255,0.18)", letterSpacing: "-1px" }}>#{project.id}</span>
        </div>

        <div className="relative flex items-center justify-between px-4 pb-4">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full" style={{ background: palette.statusBg, color: palette.statusColor }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: palette.dotColor }} />
            {onHold ? "On hold" : "Active"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: palette.metaColor }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {fmtDate(createdAt)}
          </span>
        </div>
      </div>

      {editOpen && (
        <EditProjectModal project={project} onClose={() => setEditOpen(false)} onSaved={onRefresh} onSuccess={onSuccess} />
      )}
    </>
  )
}

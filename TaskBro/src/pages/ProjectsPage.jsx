import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../store/AuthContext"
import { useProjects } from "../store/ProjectContext"
import { getAllProjects } from "../api/projects.api"
import { getAllMembers } from "../api/members.api"
import { useMembers } from "../store/MemberContext"
import AddProjectModal from "../components/modals/AddProjectModal"
import ProjectCard, { ProjectSkeleton, pickPalette } from "../components/cards/ProjectCard"
import FormField from "../components/forms/FormField"

function isOnHold(dateStr) {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() > 365 * 24 * 60 * 60 * 1000
}

function timeAgo(dateStr) {
  if (!dateStr) return "—"
  const diff   = Date.now() - new Date(dateStr).getTime()
  const mins   = Math.floor(diff / 60000)
  const hours  = Math.floor(diff / 3600000)
  const days   = Math.floor(diff / 86400000)
  const months = Math.floor(days / 30)
  const years  = Math.floor(days / 365)
  if (mins < 1)    return "just now"
  if (mins < 60)   return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days < 30)   return `${days}d ago`
  if (months < 12) return `${months}mo ago`
  return `${years}y ago`
}

function fmtDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}


const DATE_FILTERS = [
  { label: "All time",   value: "all" },
  { label: "Today",      value: "today" },
  { label: "This week",  value: "week" },
  { label: "This month", value: "month" },
  { label: "This year",  value: "year" },
  { label: "Active",     value: "active" },
  { label: "On hold",    value: "onhold" },
]

function isWithin(dateStr, range) {
  if (range === "all" || !dateStr) return true
  const d = new Date(dateStr), now = new Date()
  if (range === "today") return d.toDateString() === now.toDateString()
  if (range === "week") { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); return d >= s }
  if (range === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  if (range === "year") return d.getFullYear() === now.getFullYear()
  if (range === "onhold") return isOnHold(dateStr)
  return true
}

export default function ProjectsPage() {
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState("")
  const [showModal,    setShowModal]    = useState(false)
  const [search,       setSearch]       = useState("")
  const [dateFilter,   setDateFilter]   = useState("all")
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [sortOrder,    setSortOrder]    = useState("newest")
  const [sortOpen,     setSortOpen]     = useState(false)
  const [toast,        setToast]        = useState("")
  const [viewMode,     setViewMode]     = useState("board")
  const filterRef                       = useRef(null)
  const sortRef                         = useRef(null)
  const isFetching                  = useRef(false)
  const navigate                    = useNavigate()
  const { projects, setProjects }   = useProjects()
  const { members, setMembers }     = useMembers()

  const showToast = (msg = "Project updated successfully") => { setToast(msg); setTimeout(() => setToast(""), 3200) }

  const fetchProjects = async () => {
    if (isFetching.current) return
    isFetching.current = true
    setLoading(true); setError("")
    try {
      const res  = await getAllProjects()
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
      setProjects(list)
      try {
        const mres  = await getAllMembers()
        const mlist = Array.isArray(mres.data?.data) ? mres.data.data : Array.isArray(mres.data) ? mres.data : []
        setMembers(mlist)
      } catch {}
    } catch { setError("Could not load projects. Please try again.") }
    finally { setLoading(false); setTimeout(() => { isFetching.current = false }, 2000) }
  }

  useEffect(() => { fetchProjects() }, [])

  useEffect(() => {
    const h = e => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
      if (sortRef.current   && !sortRef.current.contains(e.target))   setSortOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const filteredProjects = projects.filter(p => {
    const raw = search.trim()
    const q   = (raw.startsWith("#") ? raw.slice(1) : raw).toLowerCase()
    if (q) {
      const createdReadable = p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""
      const fields = [
        String(p.name         ?? ""),
        String(p.description  ?? ""),
        String(p.id           ?? ""),
        String(p.user_id      ?? ""),
        String(p.created_at   ?? ""),
        createdReadable,
      ]
      if (!fields.some(f => f.toLowerCase().includes(q))) return false
    }

    if (dateFilter === "active"  &&  isOnHold(p.updated_at)) return false
    if (dateFilter === "onhold"  && !isOnHold(p.updated_at)) return false
    if (!["active", "onhold"].includes(dateFilter) && !isWithin(p.created_at, dateFilter)) return false

    return true
  }).sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.created_at) - new Date(a.created_at)
    if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at)
    if (sortOrder === "az")     return (a.name || "").localeCompare(b.name || "")
    if (sortOrder === "za")     return (b.name || "").localeCompare(a.name || "")
    return 0
  })

  const handleProjectCreated = (options) => {
    if (options?.show_toast) showToast(options.message ?? "Project created successfully")
    fetchProjects()
  }

  const activeDateLabel = DATE_FILTERS.find(f => f.value === dateFilter)?.label ?? "All time"
  const SORT_OPTIONS = [
    { label: "Newest first", value: "newest" },
    { label: "Oldest first", value: "oldest" },
    { label: "A → Z",        value: "az" },
    { label: "Z → A",        value: "za" },
  ]
  const activeSortLabel = SORT_OPTIONS.find(s => s.value === sortOrder)?.label ?? "Newest first"

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ padding: "16px 16px 16px 0" }}
    >
      <div className="flex-1 flex flex-col min-h-0" style={{ marginLeft: "16px", position: "relative" }}>

        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.10))" }}
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="
              M 32 0
              L 220 0
              C 255 0, 258 40, 292 40
              L 558 40
              C 578 40 600 55 600 75
              L 600 368
              C 600 380 582 400 562 400
              L 32 400
              C 15 400 0 385 0 368
              L 0 32
              C 0 15 15 0 32 0
              Z
            "
            fill="#ffffff"
          />
        </svg>

        <div
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
          style={{
            position: "relative",
            zIndex: 1,
            marginTop: "48px",
            backgroundColor: "#ffffff",
            borderRadius: "0 20px 20px 0",
          }}
        >

          <div className="shrink-0 px-7 pt-5 pb-4.5 bg-transparent border-b border-black/[0.07]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 -mb-0.5">
                  <h1 className="text-[32px] font-bold text-gray-900 tracking-tight m-0 ">Projects</h1>
                  {projects.length > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      {projects.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 m-0">
                  {projects.length > 0
                    ? `${projects.length} project${projects.length !== 1 ? "s" : ""} in your workspace`
                    : "Create your first project to get started"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[13px] font-semibold text-white bg-gray-900 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.25)] border-none transition-all hover:bg-gray-800 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M7 2v10M2 7h10"/>
                </svg>
                New project
              </button>
            </div>
          </div>

          <div className="shrink-0 px-7 py-3 bg-transparent border-b border-black/[0.07]">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">

              <div className="flex items-center rounded-[9px] border border-gray-200 bg-gray-50 p-0.75 gap-0.5">
                <button
                  onClick={() => setViewMode("board")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.25 rounded-[7px] text-[12px] font-medium border-none cursor-pointer transition-all ${
                    viewMode === "board" ? "bg-gray-900 text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="1" width="4.5" height="4.5" rx="1"/><rect x="7.5" y="1" width="4.5" height="4.5" rx="1"/>
                    <rect x="1" y="7.5" width="4.5" height="4.5" rx="1"/><rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1"/>
                  </svg>
                  Board
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.25 rounded-[7px] text-[12px] font-medium border-none cursor-pointer transition-all ${
                    viewMode === "list" ? "bg-gray-900 text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 3h11M1 6.5h11M1 10h11"/>
                  </svg>
                  List
                </button>
              </div>

              <div className="flex items-center gap-2.5">

                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="5.5" cy="5.5" r="4"/><path d="M11 11L8.5 8.5"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search projects…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-[13px] outline-none bg-gray-50 text-gray-900 border border-gray-200 rounded-[9px] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100"
                    style={{ minWidth: "200px" }}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 bg-none border-none cursor-pointer p-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l8 8M9 1L1 9"/></svg>
                    </button>
                  )}
                </div>

                <div ref={filterRef} className="relative">
                  <button
                    onClick={() => setFilterOpen(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.75 rounded-[9px] text-[12.5px] cursor-pointer border transition-all ${
                      dateFilter !== "all"
                        ? "bg-gray-900 text-white border-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="0.75" y="1.75" width="10.5" height="9.5" rx="1.25"/><path d="M0.75 4.75h10.5M3.75 0.75v2M8.25 0.75v2"/>
                    </svg>
                    {activeDateLabel}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                      className={`transition-transform duration-150 ${filterOpen ? "rotate-180" : ""}`}>
                      <path d="M2 3.5l3 3 3-3"/>
                    </svg>
                  </button>

                  {filterOpen && (
                    <div className="absolute right-0 top-9.5 z-20 w-37 bg-white rounded-[11px] border border-gray-200 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.12)] p-1 animate-[menuIn_0.12s_ease-out]">
                      {DATE_FILTERS.map(f => (
                        <button
                          key={f.value}
                          onClick={() => { setDateFilter(f.value); setFilterOpen(false) }}
                          className={`w-full text-left px-2.5 py-1.75 text-[12.5px] rounded-[7px] border-none cursor-pointer transition-colors ${
                            dateFilter === f.value ? "bg-gray-900 text-white font-semibold" : "bg-transparent text-gray-700 font-normal hover:bg-gray-100"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div ref={sortRef} className="relative">
                  <button
                    onClick={() => setSortOpen(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.75 rounded-[9px] text-[12.5px] cursor-pointer border transition-all ${
                      sortOrder !== "newest"
                        ? "bg-gray-900 text-white border-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 3h10M3 6h6M5 9h2"/>
                    </svg>
                    {activeSortLabel}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                      className={`transition-transform duration-150 ${sortOpen ? "rotate-180" : ""}`}>
                      <path d="M2 3.5l3 3 3-3"/>
                    </svg>
                  </button>

                  {sortOpen && (
                    <div className="absolute right-0 top-9.5 z-20 w-37 bg-white rounded-[11px] border border-gray-200 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.12)] p-1 animate-[menuIn_0.12s_ease-out]">
                      {SORT_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => { setSortOrder(s.value); setSortOpen(false) }}
                          className={`w-full text-left px-2.5 py-1.75 text-[12.5px] rounded-[7px] border-none cursor-pointer transition-colors ${
                            sortOrder === s.value ? "bg-gray-900 text-white font-semibold" : "bg-transparent text-gray-700 font-normal hover:bg-gray-100"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-6 scrollbar-none [&::-webkit-scrollbar]:hidden">
            <div className="max-w-7xl mx-auto">

              {error && (
                <div className="rounded-[11px] px-4 py-3 mb-5 text-[13px] bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={fetchProjects} className="text-xs font-semibold text-red-800 underline bg-none border-none cursor-pointer">Retry</button>
                </div>
              )}

              {loading && (
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                  {[...Array(8)].map((_, i) => <ProjectSkeleton key={i} />)}
                </div>
              )}

              {!loading && !error && projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-2xl">📁</div>
                  <div className="text-center">
                    <p className="text-[14px] font-bold text-gray-900 mb-1">No projects yet</p>
                    <p className="text-[12.5px] text-gray-400">Create your first project to get started</p>
                  </div>
                  <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-[9px] text-[13px] font-semibold text-white bg-gray-900 border-none cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.2)] hover:bg-gray-800 transition-all">
                    Create first project
                  </button>
                </div>
              )}

              {!loading && !error && projects.length > 0 && filteredProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-12 h-12 rounded-[14px] bg-gray-100 border border-gray-200 flex items-center justify-center text-[22px]">🔍</div>
                  <div className="text-center">
                    <p className="text-[14px] font-bold text-gray-900 mb-1">No results</p>
                    <p className="text-[12.5px] text-gray-400">Try a different name or date range</p>
                  </div>
                  <button onClick={() => { setSearch(""); setDateFilter("all") }} className="text-[12.5px] text-gray-500 underline underline-offset-2 bg-none border-none cursor-pointer hover:text-gray-900 transition-colors">
                    Clear all filters
                  </button>
                </div>
              )}

              {!loading && filteredProjects.length > 0 && viewMode === "board" && (
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                  {filteredProjects.map((project, i) => (
                    <ProjectCard
                      key={project.id ?? project.project_name ?? project.name}
                      project={project}
                      index={i}
                      members={members}
                      onClick={() => navigate(`/board/${project.id ?? project.name}`)}
                      onRefresh={fetchProjects}
                      onSuccess={() => showToast("Project updated successfully")}
                    />
                  ))}
                </div>
              )}

              {!loading && filteredProjects.length > 0 && viewMode === "list" && (
                <div className="flex flex-col gap-1.5">
                  <div className="grid items-center px-4 py-2 rounded-[10px] bg-gray-50 border border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                    style={{ gridTemplateColumns: "1fr 180px 100px 110px 110px 36px" }}>
                    <span>Project</span>
                    <span>Description</span>
                    <span>Status</span>
                    <span>Created</span>
                    <span>Updated</span>
                    <span />
                  </div>
                  {filteredProjects.map((project, i) => {
                    const name        = project.name || project.project_name || "Untitled"
                    const description = project.description || ""
                    const createdAt   = project.created_at || ""
                    const updatedAt   = project.updated_at || ""
                    const onHold      = isOnHold(updatedAt)
                    const palette     = pickPalette(project.id ?? i)
                    return (
                      <div
                        key={project.id ?? project.project_name ?? project.name}
                        onClick={() => navigate(`/board/${project.id ?? project.name}`)}
                        className="grid items-center px-4 py-3 rounded-xl border border-gray-200 bg-white cursor-pointer transition-all hover:border-gray-400 hover:shadow-[0_2px_10px_rgba(0,0,0,0.07)] group"
                        style={{ gridTemplateColumns: "1fr 180px 100px 110px 110px 36px" }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: palette.bg }}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[13px] font-semibold text-gray-900 truncate">{name}</span>
                        </div>
                        <span className="text-[12px] text-gray-400 truncate pr-4">{description || <span className="italic text-gray-300">No description</span>}</span>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${
                          onHold ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${onHold ? "bg-amber-400" : "bg-emerald-400"}`} />
                          {onHold ? "On hold" : "Active"}
                        </span>
                        <span className="text-[12px] text-gray-400">{fmtDate(createdAt)}</span>
                        <span className="text-[12px] text-gray-400">{timeAgo(updatedAt)}</span>
                        <div className="flex justify-end">
                          <svg className="text-gray-300 group-hover:text-gray-500 transition-colors" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 3l4 4-4 4"/>
                          </svg>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {toast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4.5 py-2.5 bg-gray-900 text-white rounded-xl border border-gray-700 shadow-[0_8px_28px_-4px_rgba(0,0,0,0.3)] text-[13px] font-medium whitespace-nowrap animate-[toastIn_0.25s_cubic-bezier(0.34,1.4,0.64,1)]">
              <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 5l2.5 2.5 4.5-5"/></svg>
              </div>
              {toast}
            </div>
          )}

          {showModal && <AddProjectModal onClose={() => setShowModal(false)} onCreated={handleProjectCreated} />}
        </div>
      </div>
    </div>
  )
}
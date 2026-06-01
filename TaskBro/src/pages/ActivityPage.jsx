import { useEffect, useState, useMemo, useRef } from "react"
import { useChangelogs } from "../store/ChangelogContext"
import { useAuth } from "../store/AuthContext"
import { getAllLogs } from "../api/changelog.api"
import { getAllTasks } from "../api/tasks.api"
import { getAllProjects } from "../api/projects.api"
import { useNavigate } from "react-router-dom"

const STATUS_CONFIG = {
  "Todo":        { label: "To-do",       color: "#6B7280", bg: "#F3F4F6", dot: "#A1A1AA" },
  "In Progress": { label: "In Progress", color: "#EA580C", bg: "#FFF7ED", dot: "#F97316" },
  "Done":        { label: "Done",        color: "#16A34A", bg: "#F0FDF4", dot: "#22C55E" },
}

const AVATAR_PALETTE = [
  { bg: "#DCFCE7", text: "#15803D" },
  { bg: "#DBEAFE", text: "#1D4ED8" },
  { bg: "#FEE2E2", text: "#B91C1C" },
  { bg: "#FEF3C7", text: "#B45309" },
  { bg: "#F3E8FF", text: "#7E22CE" },
  { bg: "#FFEDD5", text: "#C2410C" },
  { bg: "#E0F2FE", text: "#0369A1" },
  { bg: "#FCE7F3", text: "#BE185D" },
] 

function getAvatarStyle(name = "") {
  return AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length]
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/)
  if (!parts[0]) return "?"
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatTime(d) {
  if (!d) return ""
  const date = new Date(d)
  date.setHours(date.getHours() - 8)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function getGroupKey(d) {
  if (!d) return "Unknown"
  const date = new Date(d)
  date.setHours(date.getHours() - 8)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(+today - 86400000)
  const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (+itemDay === +today) return "TODAY"
  if (+itemDay === +yesterday) return "YESTERDAY"
  return date
    .toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase()
}


function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status || "Unknown",
    color: "#6B7280",
    bg: "#F9FAFB",
    dot: "#9CA3AF",
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderColor: `${cfg.dot}33`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  )
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="w-18 shrink-0">
        <div className="h-3 bg-gray-100 rounded w-14 ml-auto" />
      </div>
      <div className="w-px h-4 bg-gray-100 shrink-0" />
      <div className="w-7 h-7 rounded-full bg-gray-100 shrink-0" />
      <div className="flex items-center gap-2 flex-1">
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-28" />
        <div className="h-5 bg-gray-100 rounded-full w-20" />
      </div>
    </div>
  )
}

function ActivityRow({ log, projectName, currentUser, taskNameMap }) {
  const taskName =
    log.task_name || taskNameMap[String(log.task_id)] || `Task #${log.task_id}`

  let userId = log.user_id
  if (!userId && log.remark?.startsWith("moved::")) {
    const parts = log.remark.replace("moved::", "").split("||")
    if (parts[0]) userId = parts[0]
  }
  userId = userId || currentUser?.user_id || "Unknown"

  const avatarStyle = getAvatarStyle(String(userId))
  const initials = getInitials(String(userId))
  const timeStr = formatTime(log.created_at)

  const isStatusChange =
    log.action === "status_changed" || log.remark?.includes("moved::")
  const isCreated = log.action === "created"
  const isComment = log.remark?.startsWith("comment::")

  return (
    <div className="flex items-start gap-0 py-2.5 hover:bg-gray-50 rounded-lg transition-colors group cursor-default -mx-3 px-3">

      <div className="w-20 shrink-0 pt-1 text-right pr-4">
        <span className="text-[11px] text-gray-400 tabular-nums font-medium">
          {timeStr}
        </span>
      </div>

      <div className="flex flex-col items-center shrink-0 mr-3 pt-1">
        <div className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors" />
        <div className="w-px flex-1 bg-gray-100 mt-1 min-h-4" />
      </div>

      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mr-2.5"
        style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}
      >
        {initials}
      </div>

      <div className="flex-1 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 pt-0.5 text-sm leading-normal pb-2">
        <span className="font-semibold text-gray-800">{userId}</span>

        {isStatusChange ? (
          <>
            <span className="text-gray-500">moved</span>
            <span className="font-medium text-gray-700 bg-gray-100 px-1.5 py-0 rounded text-xs">
              {taskName}
            </span>
            <span className="text-gray-500">from</span>
            {log.old_status && <StatusBadge status={log.old_status} />}
            <span className="text-gray-400">→</span>
            {log.new_status && <StatusBadge status={log.new_status} />}
            <span className="text-gray-400 text-xs ml-1">in {projectName}</span>
          </>
        ) : isCreated ? (
          <>
            <span className="text-gray-500">created</span>
            <span className="font-medium text-gray-700 bg-gray-100 px-1.5 py-0 rounded text-xs">
              {taskName}
            </span>
            <span className="text-gray-500">in</span>
            <span className="font-medium text-gray-600">{projectName}</span>
          </>
        ) : isComment ? (
          <>
            <span className="text-gray-500">commented on</span>
            <span className="font-medium text-gray-700 bg-gray-100 px-1.5 py-0 rounded text-xs">
              {taskName}
            </span>
            <span className="text-gray-400 text-xs ml-1">in {projectName}</span>
          </>
        ) : (
          <>
            <span className="text-gray-500">updated</span>
            <span className="font-medium text-gray-700 bg-gray-100 px-1.5 py-0 rounded text-xs">
              {taskName}
            </span>
            <span className="text-gray-500">in</span>
            <span className="font-medium text-gray-600">{projectName}</span>
          </>
        )}
      </div>
    </div>
  )
}

function DateGroup({ label, children }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3 mb-1 mt-6 first:mt-0">
        <span className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div>{children}</div>
    </div>
  )
}

const CalendarIcon = ({ color }) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke={color} strokeWidth="1.5"/>
    <path d="M5 1v3M11 1v3M2 7h12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

function DatePickerButton({ placeholder, value, onChange }) {
  const inputRef = useRef(null)
  const active = !!value
  const formatted = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <div
        onClick={() => inputRef.current?.showPicker()}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px", borderRadius: 9, cursor: "pointer",
          border: `1.5px solid ${active ? "#111" : "#e5e5e5"}`,
          background: active ? "#111" : "#f7f7f7",
          color: active ? "#fff" : "#444",
          fontSize: 12, fontWeight: 500,
          whiteSpace: "nowrap",
          transition: "all 0.15s",
        }}
      >
        <span style={{ opacity: 0.75, display: "flex", alignItems: "center" }}>
          <CalendarIcon color={active ? "#fff" : "#888"} />
        </span>
        <span>{formatted ?? placeholder}</span>
        {active ? (
          <span
            onClick={(e) => {
              e.stopPropagation()  
              onChange("")
            }}
            style={{ marginLeft: 2, display: "flex", alignItems: "center", opacity: 0.6, cursor: "pointer" }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M1.5 1.5l6 6M7.5 1.5l-6 6"/>
            </svg>
          </span>
        ) : (
          <svg
            width="9" height="9" viewBox="0 0 9 9" fill="none"
            stroke="#888" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginLeft: 2 }}
          >
            <path d="M1.5 3l3 3 3-3"/>
          </svg>
        )}
      </div>

      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",  
        }}
      />
    </div>
  )
}

export default function ActivityPage() {
  const { changelogs, setChangelogs, loading, setLoading, error, setError } =
    useChangelogs()
  const { user } = useAuth()
  const navigate      = useNavigate()

  const [taskMap,     setTaskMap]     = useState({})
  const [taskNameMap, setTaskNameMap] = useState({})
  const [projectMap,  setProjectMap]  = useState({})
  const [search,   setSearch]   = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo,   setDateTo]   = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [logsRes, tasksRes, projectsRes] = await Promise.all([
          getAllLogs(),
          getAllTasks(),
          getAllProjects(),
        ])

        const list = Array.isArray(logsRes.data?.data)
          ? logsRes.data.data
          : Array.isArray(logsRes.data) ? logsRes.data : []
        setChangelogs(list)

        const tasks = Array.isArray(tasksRes.data?.data)
          ? tasksRes.data.data
          : Array.isArray(tasksRes.data) ? tasksRes.data : []
        const tMap = {}
        const tNameMap = {}
        tasks.forEach((t) => {
          tMap[String(t.id)] = String(t.project_id)
          tNameMap[String(t.id)] = t.name
        })
        setTaskMap(tMap)
        setTaskNameMap(tNameMap)

        const projects = Array.isArray(projectsRes.data?.data)
          ? projectsRes.data.data
          : Array.isArray(projectsRes.data) ? projectsRes.data : []
        const pMap = {}
        projects.forEach((p) => { pMap[String(p.id)] = p.name })
        setProjectMap(pMap)
      } catch {
        setError("Could not load activity.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const grouped = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null
    const to   = dateTo   ? new Date(dateTo).setHours(23, 59, 59, 999) : null

    const sorted = [...(changelogs || [])]
      .filter((log) => {
        const logTime = log.created_at ? new Date(log.created_at).getTime() : null
        if (logTime && from && logTime < from) return false
        if (logTime && to   && logTime > to)   return false
        if (!search.trim()) return true
        const q = search.toLowerCase()
        const t = (log.task_name || taskNameMap[String(log.task_id)] || "").toLowerCase()
        const u = String(log.user_id || "").toLowerCase()
        const p = (projectMap[taskMap[String(log.task_id)]] || "").toLowerCase()
        return t.includes(q) || u.includes(q) || p.includes(q)
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const groups = []
    let currentKey = null
    sorted.forEach((log) => {
      const key = getGroupKey(log.created_at)
      if (key !== currentKey) {
        groups.push({ key, items: [] })
        currentKey = key
      }
      groups[groups.length - 1].items.push(log)
    })
    return groups
  }, [changelogs, search, dateFrom, dateTo, taskNameMap, projectMap, taskMap])

  const totalCount = grouped.reduce((s, g) => s + g.items.length, 0)

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ padding: "16px 16px 16px 0", backgroundColor: "#F0EFED" }}>

      <div className="flex-1 flex flex-col min-h-0" style={{ marginLeft: "16px", position: "relative" }}>

        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0, filter:"drop-shadow(0 10px 24px rgba(0,0,0,0.10))" }}
          viewBox="0 0 600 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 32 0 L 220 0 C 255 0, 258 40, 292 40 L 558 40 C 578 40 600 55 600 75 L 600 368 C 600 385 582 400 562 400 L 32 400 C 15 400 0 385 0 368 L 0 32 C 0 15 15 0 32 0 Z" fill="#ffffff"/>
        </svg>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden"
          style={{ position:"relative", zIndex:1, marginTop:"48px", backgroundColor:"#ffffff", borderRadius:"0 20px 20px 0" }}>

          <div className="shrink-0 px-12 pb-2.5 bg-transparent border-b border-black/[0.07]">
            <div className="max-w-7xl mx-auto">

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <button onClick={() => navigate("/projects")} className="hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer p-0 text-xs text-gray-400">
                  Home
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500 font-medium">Activity</span>
              </div>

              <div className="flex items-end justify-between gap-4 mt-1">
                <div>
                  <h1 className="text-[32px] font-bold text-gray-900 tracking-tight m-0">Activity</h1>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {loading
                      ? "Loading..."
                      : `${totalCount} ${totalCount === 1 ? "update" : "updates"}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 pb-1">
                  <DatePickerButton placeholder="From" value={dateFrom} onChange={setDateFrom} />
                  <DatePickerButton placeholder="To" value={dateTo} onChange={setDateTo} />

                  {(dateFrom || dateTo) && (
                    <button
                      onClick={() => { setDateFrom(""); setDateTo("") }}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "6px 10px", borderRadius: 9, cursor: "pointer",
                        border: "1.5px solid #e5e5e5",
                        background: "#f7f7f7",
                        color: "#888",
                        fontSize: 12, fontWeight: 500,
                        whiteSpace: "nowrap",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#fca5a5"
                        e.currentTarget.style.background = "#fef2f2"
                        e.currentTarget.style.color = "#ef4444"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e5e5"
                        e.currentTarget.style.background = "#f7f7f7"
                        e.currentTarget.style.color = "#888"
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1.5 1.5l6 6M7.5 1.5l-6 6" />
                      </svg>
                      Clear dates
                    </button>
                  )}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm shadow-sm w-52">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 16 16">
                      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                        d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zm4.5 1.5 2.5 2.5" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-[13px] text-gray-700 placeholder:text-gray-400"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 mt-4" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-12 pb-10">
            <div className="max-w-7xl mx-auto">
              {error && (
                <div className="mt-6 rounded-xl px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-600 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {loading && (
                <div className="mt-6">
                  {["TODAY", "YESTERDAY"].map((label) => (
                    <div key={label} className="mb-4">
                      <div className="flex items-center gap-3 mb-1 mt-6 first:mt-0">
                        <div className="h-2.5 bg-gray-100 rounded w-16 animate-pulse" />
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      {[...Array(3)].map((_, i) => <RowSkeleton key={i} />)}
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && totalCount === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <p className="font-semibold text-gray-700">No activity found</p>
                  <p className="text-sm text-gray-400 max-w-xs">
                    {search
                      ? `No results for "${search}". Try a different search.`
                      : "Task updates will appear here as they happen."}
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="mt-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}

              {!loading && !error && grouped.map((group) => (
                <DateGroup key={group.key} label={group.key}>
                  {group.items.map((log) => (
                    <ActivityRow
                      key={log.id ?? log.created_at}
                      log={log}
                      projectName={projectMap[taskMap[String(log.task_id)]] || "Unknown Project"}
                      currentUser={user}
                      taskNameMap={taskNameMap}
                    />
                  ))}
                </DateGroup>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
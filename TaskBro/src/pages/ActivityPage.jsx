import { useEffect, useState, useMemo } from "react"
import { useChangelogs } from "../store/ChangelogContext"
import { useAuth } from "../store/AuthContext"
import { getAllLogs } from "../api/changelog.api"
import { getAllTasks } from "../api/tasks.api"
import { getAllProjects } from "../api/projects.api"

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
  // KNOWN ISSUE: Backend saves timestamps in Manila local time (UTC+8) but labels them as UTC.
  // This causes a double UTC+8 conversion in the browser, showing times 8 hours ahead.
  // For temporaray fixed is that i subtract 8 hours on the frontend until backend is fixed to use UTC_TIMESTAMP().
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
  date.setHours(date.getHours() - 8) // subtract 8 Hours to fix the known timestamp issue
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

function withinDays(d, days) {
  if (!d || days === Infinity) return true
  const date = new Date(d)
  date.setHours(date.getHours() - 8)  // subtract 8 Hours to fix the known timestamp issue
  return Date.now() - date.getTime() <= days * 86400000
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

export default function ActivityPage() {
  const { changelogs, setChangelogs, loading, setLoading, error, setError } =
    useChangelogs()
  const { user } = useAuth()

  const [taskMap,     setTaskMap]     = useState({})
  const [taskNameMap, setTaskNameMap] = useState({})
  const [projectMap,  setProjectMap]  = useState({})
  const [search,      setSearch]      = useState("")
  const [range,       setRange]       = useState(30)
  const [rangeOpen,   setRangeOpen]   = useState(false)

  const RANGES = [
    { label: "Last 7 Days",  days: 7 },
    { label: "Last 30 Days", days: 30 },
    { label: "Last 90 Days", days: 90 },
    { label: "All Time",     days: Infinity },
  ]

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
    const sorted = [...(changelogs || [])]
      .filter((log) => {
        if (!withinDays(log.created_at, range)) return false
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
  }, [changelogs, search, range, taskNameMap, projectMap, taskMap])

  const totalCount = grouped.reduce((s, g) => s + g.items.length, 0)
  const currentRange = RANGES.find((r) => r.days === range) || RANGES[1]

 return (
  <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: "#F0EFED" }}>
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden mx-4 my-4 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] bg-white" style={{ isolation: "isolate" }}>

      <div className="px-8 pt-6 pb-0 shrink-0">
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
          <span className="hover:text-gray-600 cursor-pointer transition-colors">Home</span>
          <span>/</span>
          <span className="text-gray-700 font-medium">Activity</span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading
                ? "Loading..."
                : `${totalCount} ${totalCount === 1 ? "update" : "updates"} · ${currentRange.label.toLowerCase()}`}
            </p>
          </div>

          <div className="flex items-center gap-2 pb-1">
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

            <div className="relative">
              <button
                onClick={() => setRangeOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600
                  bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50
                  transition-colors shadow-sm whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 16 16">
                  <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" d="M5 1v3m6-3v3M2 7h12" />
                </svg>
                {currentRange.label}
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 10 10">
                  <path stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" d="m2 3.5 3 3 3-3" />
                </svg>
              </button>

              {rangeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setRangeOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-20 w-44 bg-white border border-gray-200
                    rounded-xl shadow-xl overflow-hidden">
                    {RANGES.map((r) => (
                      <button
                        key={r.days}
                        onClick={() => { setRange(r.days); setRangeOpen(false) }}
                        className={`w-full text-left px-3.5 py-2.5 text-[13px] transition-colors flex items-center justify-between
                          ${range === r.days
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        {r.label}
                        {range === r.days && (
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M2.5 7 6 10.5l5.5-7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mt-4" />
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-10">
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
  )
}
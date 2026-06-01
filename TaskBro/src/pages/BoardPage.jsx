import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getProject } from "../api/projects.api"
import { getAllTasks } from "../api/tasks.api"
import KanbanBoard from "../components/board/KanbanBoard"
import ListView from "../components/board/Listview"
import AddTaskModal from "../components/modals/AddTaskModal"
import TaskDetailPanel from "../components/task/TaskDetailPanel"
import { getAllLogs } from "../api/changelog.api"
import FilterDropdown from "../components/ui/FilterDropdown"


export default function BoardPage() {
  const { projectId } = useParams()
  const navigate      = useNavigate()

  const [project,      setProject]      = useState(null)
  const [tasks,        setTasks]        = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState("")
  const [activeTab,    setActiveTab]    = useState("Board")
  const [addingToCol,  setAddingToCol]  = useState(null)
  const [searchQuery,  setSearchQuery]  = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter,   setDateFilter]   = useState("")
  const [changeLogs,   setChangeLogs]   = useState([])
  const [sortOrder,    setSortOrder]    = useState("desc")

  const sortedTasks = [...tasks].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0
    const db = b.created_at ? new Date(b.created_at).getTime() : 0
    return sortOrder === "desc" ? db - da : da - db
  })

  const lastActivityMap = {}
  changeLogs.forEach((log) => {
    if (!log.task_id) return
    const logDate = new Date(log.created_at)
    if (isNaN(logDate.getTime())) return
    if (!lastActivityMap[log.task_id] || logDate > lastActivityMap[log.task_id]) {
      lastActivityMap[log.task_id] = logDate
    }
  })

  const filteredTasks = sortedTasks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      if (!t.name?.toLowerCase().includes(q) && !t.contents?.toLowerCase().includes(q)) return false
    }

    if (statusFilter) {
      const tStatus = (t.status || "").trim().toLowerCase()
      const fStatus = statusFilter.trim().toLowerCase()
      if (tStatus !== fStatus) return false
    }

    if (dateFilter) {
      const lastActivity = lastActivityMap[t.id]
        ? lastActivityMap[t.id]
        : t.updated_at ? new Date(t.updated_at) : null

      if (!lastActivity || isNaN(lastActivity.getTime())) return true

      const now = new Date()
      if (dateFilter === "today") {
        const msIn24h = 24 * 60 * 60 * 1000
        if (now - lastActivity > msIn24h) return false
      } else if (dateFilter === "week") {
        const ago = new Date(now); ago.setDate(now.getDate() - 7)
        if (lastActivity < ago) return false
      } else if (dateFilter === "month") {
        const ago = new Date(now); ago.setMonth(now.getMonth() - 1)
        if (lastActivity < ago) return false
      }
    }

    return true
  })

  const statusOptions = [...new Set(tasks.map((t) => t.status).filter(Boolean))].map((s) => ({ value: s, label: s }))
  const dateOptions   = [
    { value: "today", label: "Updated Today" },
    { value: "week",  label: "This Week" },
    { value: "month", label: "This Month" },
  ]

  const fetchLogs = async () => {
    try {
      const logsRes = await getAllLogs()
      const allLogs = Array.isArray(logsRes.data?.data) ? logsRes.data.data
        : Array.isArray(logsRes.data) ? logsRes.data : []
      setChangeLogs(allLogs)
    } catch (err) {
      console.error("Changelog fetch error:", err)
    }
  }

  const fetchData = async () => {
    setLoading(true); setError("")
    try {
      const projRes = await getProject(projectId)
      const proj    = Array.isArray(projRes.data?.data) ? projRes.data.data[0] : projRes.data?.data || null
      setProject(proj)

      const tasksRes = await getAllTasks()
      const allTasks = Array.isArray(tasksRes.data?.data) ? tasksRes.data.data : Array.isArray(tasksRes.data) ? tasksRes.data : []
      setTasks(allTasks.filter((t) => String(t.project_id) === String(projectId)))

      await fetchLogs()
    } catch (err) {
      console.error("Board fetch error:", err); setError("Could not load board.")
    } finally { setLoading(false) }
  }

  useEffect(() => { if (projectId) fetchData() }, [projectId])

  const handleTaskUpdated = (updatedTask) => {
    if (!updatedTask || typeof updatedTask !== "object") return
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)))
    setSelectedTask((prev) => prev ? { ...prev, ...updatedTask } : prev)
    setTimeout(fetchLogs, 800)
  }
  const handleLogCreated  = () => setTimeout(fetchLogs, 800)
  const handleTaskClick   = (task) => setSelectedTask(task)
  const handleTasksChange = (updatedTasks) => {
    setTasks(updatedTasks)
    if (selectedTask) {
      const refreshed = updatedTasks.find((t) => t.id === selectedTask.id)
      if (refreshed) setSelectedTask(refreshed)
    }
    setTimeout(fetchLogs, 500)
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Loading board…</p>
      </div>
    </div>
  )

  if (error || !project) return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-gray-500">{error || "Project not found"}</p>
        <button onClick={() => navigate("/projects")} className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors">
          ← Back to Projects
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ padding: "16px 16px 16px 0", backgroundColor: "#F0EFED" }}>

      <div className="flex-1 flex flex-col min-h-0" style={{ marginLeft: "16px", position: "relative" }}>

        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0, filter:"drop-shadow(0 10px 24px rgba(0,0,0,0.10))" }}
          viewBox="0 0 600 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 32 0 L 220 0 C 255 0, 258 40, 292 40 L 558 40 C 578 40 600 55 600 75 L 600 368 C 600 385 582 400 562 400 L 32 400 C 15 400 0 385 0 368 L 0 32 C 0 15 15 0 32 0 Z" fill="#ffffff"/>
        </svg>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden"
          style={{ position:"relative", zIndex:1, marginTop:"48px", backgroundColor:"#ffffff", borderRadius:"0 20px 20px 0" }}>

          <div className="shrink-0 px-12 -pt-20 pb-2.5 bg-transparent border-b border-black/[0.07]">
            <div className="max-w-7xl mx-auto">

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <button onClick={() => navigate("/projects")} className="hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer p-0 text-xs text-gray-400">
                  Projects
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500 font-medium">Kanban</span>
              </div>

              <div className="flex items-center gap-2.5">
                <h1 className="text-[32px] font-bold text-gray-900 tracking-tight m-0">{project?.name}</h1>
                {tasks.length > 0 && (
                  <span className="text-[11px] font-black leading-relaxed px-2 py-0.5 rounded-full bg-blue-500 text-white border border-gray-200">
                    {tasks.length} Task
                  </span>
                )}
              </div>

              <div className="filter-bar" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:12, gap:12 }}>

                <div style={{ display:"flex", alignItems:"center", gap:2, padding:3, borderRadius:10, border:"1.5px solid #e5e5e5", background:"#f7f7f7" }}>
                  {[
                    { key:"Board", icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="4.5" height="11" rx="1"/><rect x="7.5" y="1" width="4.5" height="7" rx="1"/></svg> },
                    { key:"List",  icon:<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 3h11M1 6.5h11M1 10h11"/></svg> },
                  ].map(({ key, icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={`kb-toggle${activeTab === key ? " kb-on" : ""}`}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:7, fontSize:12, fontWeight:500, border:"none", cursor:"pointer", background: activeTab===key?"#111":"transparent", color: activeTab===key?"#fff":"#555", boxShadow: activeTab===key?"0 1px 4px rgba(0,0,0,0.18)":"none" }}
                    >{icon}{key}</button>
                  ))}
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:8 }}>

                  <button
                    onClick={() => setSortOrder(p => p === "desc" ? "asc" : "desc")}
                    title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
                    style={{
                      display:"flex", alignItems:"center", gap:5,
                      padding:"6px 10px", borderRadius:9, cursor:"pointer",
                      border:"1.5px solid #e5e5e5", background:"#f7f7f7",
                      color:"#444", fontSize:12, fontWeight:500,
                      transition:"all 0.15s", whiteSpace:"nowrap",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transition:"transform 0.2s", transform: sortOrder === "asc" ? "scaleY(-1)" : "scaleY(1)" }}>
                      <path d="M2 3h8M3 6h6M4 9h4"/>
                    </svg>
                    {sortOrder === "desc" ? "Newest" : "Oldest"}
                  </button>

                  <div style={{ position:"relative" }}>
                    <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
                      width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="5.5" cy="5.5" r="4"/><path d="M12 12l-3-3"/>
                    </svg>
                    <input type="text" placeholder="Search tasks…" value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      style={{ width:180, paddingLeft:30, paddingRight: searchQuery?28:12, paddingTop:6, paddingBottom:6, fontSize:12, borderRadius:9, border:"1.5px solid #e5e5e5", background:"#f7f7f7", color:"#111" }}
                    />
                    {searchQuery && (
                      <button className="xclear" onClick={() => setSearchQuery("")}
                        style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#aaa", fontSize:11, lineHeight:1, padding:0, opacity:0.7 }}
                      >✕</button>
                    )}
                  </div>

                  <FilterDropdown
                    placeholder="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    icon={
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="6" cy="6" r="5"/><path d="M6 3v3l2 1.5"/>
                      </svg>
                    }
                  />

                  <FilterDropdown
                    placeholder="Date"
                    value={dateFilter}
                    onChange={setDateFilter}
                    options={dateOptions}
                    icon={
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="1" y="2" width="10" height="9" rx="1.5"/><path d="M1 5h10M4 1v2M8 1v2"/>
                      </svg>
                    }
                  />

                  {(searchQuery || statusFilter || dateFilter) && (
                    <button className="clear-pop clear-btn"
                      onClick={() => { setSearchQuery(""); setStatusFilter(""); setDateFilter("") }}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 11px", borderRadius:9, border:"1.5px solid #111", background:"#fff", fontSize:11, fontWeight:600, color:"#111", cursor:"pointer", letterSpacing:"0.02em" }}
                    >
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 1l7 7M8 1L1 8"/>
                      </svg>
                      Clear
                    </button>
                  )}

                </div>
              </div>

            </div>
          </div>

          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {activeTab === "Board" ? (
                <KanbanBoard projectId={projectId} projectName={project?.name||"Project"} tasks={filteredTasks}
                  onTasksChange={handleTasksChange} onTaskClick={handleTaskClick}
                  selectedTaskId={selectedTask?.id} onTaskCreated={fetchData} />
              ) : (
                <ListView tasks={filteredTasks} onTasksChange={handleTasksChange}
                  onTaskClick={handleTaskClick} selectedTaskId={selectedTask?.id}
                  onAddTask={(status) => setAddingToCol(status)} />
              )}
            </div>
            <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onTaskUpdated={handleTaskUpdated} onLogCreated={handleLogCreated} />
          </div>

        </div>
      </div>

      {addingToCol && (
        <AddTaskModal projectId={projectId} defaultStatus={addingToCol}
          onClose={() => setAddingToCol(null)}
          onCreated={() => { setAddingToCol(null); fetchData() }} />
      )}
    </div>
  )
}
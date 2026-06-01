import { useState, useEffect, useRef } from "react"
import { updateTask } from "../../api/tasks.api"
import { createLog, getAllLogs } from "../../api/changelog.api"
import { useAuth } from "../../store/AuthContext"
import { useToast } from "../ui/Toast"

const STATUS_CONFIG = {
  "Todo":        { bg: "#F4F4F5", text: "#52525B", border: "#E4E4E7", dot: "#A1A1AA" },
  "In Progress": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", dot: "#F97316" },
  "Done":        { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", dot: "#22C55E" },
}

const encodeMove    = (from, to) => `moved::${from}->${to}`
const encodeComment = (text, user) => `comment::${user}||text::${text}`

const parseRemark = (remark) => {
  if (!remark) return { type: "unknown", text: "—", user: null }
  if (remark.startsWith("moved::")) {
    const rest = remark.replace("moved::", "")
    if (rest.includes("||")) {
      const [userPart, statuses] = rest.split("||")
      const [f, t] = statuses.split("->")
      return { type: "moved", from: f?.trim(), to: t?.trim(), user: userPart?.trim() }
    }
    const [from, to] = rest.split("->")
    return { type: "moved", from: from?.trim(), to: to?.trim(), user: null }
  }
  if (remark.startsWith("comment::")) {
    const body = remark.replace("comment::", "")
    const [user, textPart] = body.split("||text::")
    return { type: "comment", text: textPart || "", user: user || null }
  }
  return { type: "unknown", text: remark, user: null }
}

const formatDate = (d) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}
const formatTime = (d) => {
  if (!d) return "" 

  /*
   Backend saves timestamps in Manila local time (UTC+8) but labels them as UTC.
   This causes a double UTC+8 conversion in the browser.
   Temporary frontend correction: subtract 8 hours before display.
  */
  const date = new Date(d)
  date.setHours(date.getHours() - 8)
  const now  = new Date()
  const diff = Math.floor((now - date) / 86400000)
  const t    = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  if (diff === 0) return `Today at ${t}`
  if (diff === 1) return `Yesterday at ${t}`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` at ${t}`
}

const AVATAR_PALETTES = [
  { bg: "#18181B", text: "#FAFAFA" },
  { bg: "#27272A", text: "#F4F4F5" },
  { bg: "#3F3F46", text: "#FAFAFA" },
  { bg: "#52525B", text: "#FAFAFA" },
  { bg: "#71717A", text: "#FAFAFA" },
]
const avatarPalette = (name = "") => {
  const n = String(name).split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_PALETTES[n % AVATAR_PALETTES.length]
}
const initials = (name) => {
  if (!name) return "?"
  const parts = String(name).trim().split(/\s+/)
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : String(name).charAt(0).toUpperCase()
}

function Avatar({ name, size = 8 }) {
  const pal = avatarPalette(name)
  const px  = size === 8 ? "w-8 h-8 text-xs" : "w-6 h-6 text-[10px]"
  return (
    <div className={`${px} rounded-full shrink-0 flex items-center justify-center font-bold tracking-tight`}
      style={{ background: pal.bg, color: pal.text }}>
      {initials(name)}
    </div>
  )
}

function FieldRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
      <div className="flex items-center gap-2 w-28 shrink-0 mt-0.5">
        <span className="text-zinc-400">{icon}</span>
        <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function EditableTitle({ value, onSave, saving }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value || "")
  const ref = useRef(null)

  useEffect(() => { setDraft(value || "") }, [value])
  useEffect(() => { if (editing) { ref.current?.focus(); ref.current?.select() } }, [editing])

  const commit = async () => {
    const v = draft.trim()
    if (!v || v === value) { setEditing(false); setDraft(value || ""); return }
    await onSave(v)
    setEditing(false)
  }

  if (editing) return (
    <div className="flex flex-col gap-2">
      <input
        ref={ref}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") { setEditing(false); setDraft(value || "") }
        }}
        className="w-full text-xl font-bold text-zinc-900 bg-transparent border-b-2 border-zinc-900
          outline-none pb-1 leading-snug"
        placeholder="Task title…"
      />
      <div className="flex gap-2">
        <button onClick={commit} disabled={saving || !draft.trim()}
          className="px-3 py-1 rounded-md text-[11px] font-bold text-white bg-zinc-900
            disabled:opacity-40 hover:bg-zinc-700 transition-all">
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={() => { setEditing(false); setDraft(value || "") }}
          className="px-3 py-1 rounded-md text-[11px] font-semibold text-zinc-400
            border border-zinc-200 hover:text-zinc-600 transition-all">
          Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="group flex items-start gap-2 cursor-text" onClick={() => setEditing(true)}>
      <h1 className="flex-1 text-xl font-bold text-zinc-900 leading-snug group-hover:text-zinc-600 transition-colors">
        {value || <span className="text-zinc-300 italic font-normal">Untitled task</span>}
      </h1>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M9 1.5l2.5 2.5-7 7H2v-2.5l7-7z" stroke="#A1A1AA" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
  )
}

function EditableDescription({ value, onSave, saving }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value || "")
  const ref = useRef(null)

  useEffect(() => { setDraft(value || "") }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  const commit = async () => {
    const v = draft.trim()
    if (v === (value || "").trim()) { setEditing(false); return }
    await onSave(v)
    setEditing(false)
  }

  if (editing) return (
    <div className="flex flex-col gap-2">
      <textarea ref={ref} value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => e.key === "Escape" && (() => { setEditing(false); setDraft(value || "") })()}
        rows={3}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700
          outline-none resize-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
        placeholder="Add a description…"
      />
      <div className="flex gap-2">
        <button onClick={commit} disabled={saving}
          className="px-3 py-1 rounded-md text-[11px] font-bold text-white bg-zinc-900
            disabled:opacity-40 hover:bg-zinc-700 transition-all">
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={() => { setEditing(false); setDraft(value || "") }}
          className="px-3 py-1 rounded-md text-[11px] font-semibold text-zinc-400
            border border-zinc-200 hover:text-zinc-600 transition-all">
          Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div onClick={() => setEditing(true)}
      className="text-sm text-zinc-500 leading-relaxed px-3 py-2 rounded-lg border border-dashed
        border-zinc-200 cursor-text hover:border-zinc-400 hover:bg-zinc-50 transition-all min-h-9.5">
      {value || <span className="text-zinc-300 italic">Add a description…</span>}
    </div>
  )
}

function CommentEditor({ user, onSubmit, submitting }) {
  const [text, setText] = useState("")

  const handleSubmit = async () => {
    if (!text.trim()) return
    await onSubmit(text.trim())
    setText("")
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center rounded-full px-4 py-2.5"
        style={{
          background: "#1C1C1E",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSubmit() }}
          placeholder="Add a comment…"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{
            color: "rgba(255,255,255,0.82)",
            caretColor: "#fff",
            fontFamily: "inherit",
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !text.trim()}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95"
        style={{
          background: text.trim() ? "#007AFF" : "#2C2C2E",
          opacity: submitting ? 0.5 : 1,
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 11V3M3.5 6.5L7 3l3.5 3.5"
            stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
  
function MoveEntry({ log, parsed }) {
  const oldS = STATUS_CONFIG[parsed.from]
  const newS = STATUS_CONFIG[parsed.to]

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "#F4F4F5", border: "1.5px solid #E4E4E7" }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="#52525B" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex-1 flex flex-col gap-1 pb-1">
        {parsed.user && (
          <span className="text-xs font-semibold text-zinc-700">{parsed.user}</span>
        )}
        <div className="rounded-xl px-4 py-3 flex items-center flex-wrap gap-2"
          style={{ background: "#FAFAFA", border: "1px solid #E4E4E7" }}>
          <span className="text-xs text-zinc-500">moved from</span>
          {oldS ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: oldS.bg, color: oldS.text, border: `1px solid ${oldS.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: oldS.dot }}/>
              {parsed.from}
            </span>
          ) : <span className="text-xs font-semibold text-zinc-500">{parsed.from || "—"}</span>}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="#A1A1AA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {newS ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: newS.bg, color: newS.text, border: `1px solid ${newS.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: newS.dot }}/>
              {parsed.to}
            </span>
          ) : <span className="text-xs font-semibold text-zinc-500">{parsed.to || "—"}</span>}
        </div>
        <span className="text-[11px] text-zinc-300 ml-0.5">{formatTime(log.created_at)}</span>
      </div>
    </div>
  )
}

function CommentEntry({ log, parsed }) {
  const userName = parsed.user || "Unknown"
  return (
    <div className="flex gap-3 items-start">
      <Avatar name={userName} size={8} />
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-800">{userName}</span>
          <span className="text-[11px] text-zinc-300">{formatTime(log.created_at)}</span>
        </div>
        <div className="rounded-2xl rounded-tl-sm px-4 py-3"
          style={{ background: "#FAFAFA", border: "1px solid #E4E4E7" }}>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{parsed.text}</p>
        </div>
      </div>
    </div>
  )
}

function UnknownEntry({ log, parsed }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "#F4F4F5", border: "1.5px solid #E4E4E7" }}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <circle cx="5.5" cy="5.5" r="4.5" stroke="#A1A1AA" strokeWidth="1.2"/>
          <path d="M5.5 3.5v2.5l1.5 1.5" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="rounded-xl px-4 py-2.5" style={{ background: "#FAFAFA", border: "1px solid #E4E4E7" }}>
          <p className="text-xs text-zinc-400 italic">{parsed.text || "—"}</p>
        </div>
        <span className="text-[11px] text-zinc-300 ml-0.5">{formatTime(log.created_at)}</span>
      </div>
    </div>
  )
}

function FeedEntry({ log }) {
  const parsed = parseRemark(log.remark)
  if (parsed.type === "moved")   return <MoveEntry    log={log} parsed={parsed}/>
  if (parsed.type === "comment") return <CommentEntry log={log} parsed={parsed}/>
  return <UnknownEntry log={log} parsed={parsed}/>
}

export default function TaskDetailPanel({ task, onClose, onTaskUpdated }) {
  const { user }      = useAuth()
  const { showToast } = useToast()
  const isOpen        = !!task

  const [saving,      setSaving]      = useState(false)
  const [savingTitle, setSavingTitle] = useState(false)
  const [moving,      setMoving]      = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [logs,        setLogs]        = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const bottomRef = useRef(null)

useEffect(() => {
  if (!task) { setLogs([]); return }
  fetchLogs(task.id)
}, [task?.id]) 

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }, [logs])

  const fetchLogs = async (taskId) => {
    const id = taskId ?? task?.id
    if (!id) return
    setLogsLoading(true)
    try {
      const res = await getAllLogs()
      const all = Array.isArray(res.data?.data) ? res.data.data
        : Array.isArray(res.data) ? res.data : []
      setLogs(
        all
          .filter(l => String(l.task_id) === String(id))
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      )
    } catch(e) { console.error(e) }
    finally { setLogsLoading(false) }
  }

  const handleSaveTitle = async (value) => {
    setSavingTitle(true)
    try {
      await updateTask({ task_id: task.id, name: value, status: task.status, contents: task.contents })
      onTaskUpdated({ ...task, name: value })
      showToast("Title updated")
    } catch { showToast("Failed to save title", "error") }
    finally { setSavingTitle(false) }
  }

  const handleSaveDescription = async (value) => {
    setSaving(true)
    try {
      await updateTask({ task_id: task.id, name: task.name, status: task.status, contents: value })
      onTaskUpdated({ ...task, contents: value })
      showToast("Description updated")
    } catch { showToast("Failed to save", "error") }
    finally { setSaving(false) }
  }

  const handleMove = async (newStatus) => {
    if (moving) return
    setMoving(true)
    const userName = user?.user_id || user?.name || ""
    try {
      await updateTask({ task_id: task.id, name: task.name, status: newStatus })
      await createLog({
        user_id:    user?.user_id,
        task_id:    task.id,
        task_name:  task.name,
        old_status: task.status,
        new_status: newStatus,
        remark:     `moved::${userName}||${task.status}->${newStatus}`,
      })
      onTaskUpdated({ ...task, status: newStatus })
      await fetchLogs(task.id)
      showToast(`Moved to "${newStatus}"`)
    } catch { showToast("Failed to move task", "error") }
    finally { setMoving(false) }
  }

  const handleComment = async (text) => {
    if (!text) return
    setSubmitting(true)
    const userName = user?.user_id || user?.name || ""
    try {
      await createLog({
        user_id:    user?.user_id,
        task_id:    task.id,
        task_name:  task.name,
        old_status: task.status,
        new_status: task.status,
        remark:     encodeComment(text, userName),
      })
      await fetchLogs(task.id)
      showToast("Comment added")
    } catch { showToast("Failed to post comment", "error") }
    finally { setSubmitting(false) }
  }

  const commentCount = logs.filter(l => parseRemark(l.remark).type === "comment").length

  return (
    <>
      <div className=" rounded-2xl
       h-full flex flex-col shrink-0 overflow-hidden
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
       style={{
           width: isOpen ? "400px" : "0px",
           minWidth: isOpen ? "400px" : "0px",
          background: "#FFFFFF",
          borderLeft: isOpen ? "1px solid #E4E4E7" : "none",
        }}>

        {task && (
          <div className="flex flex-col h-full overflow-hidden">

            <div className="shrink-0 flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: "1px solid #F4F4F5" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: "#18181B" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.2"/>
                    <path d="M3.5 6l2 2 3-3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Task</span>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ color: "#A1A1AA" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F4F4F5"; e.currentTarget.style.color = "#18181B" }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A1A1AA" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#E4E4E7 transparent" }}>

              <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid #F4F4F5" }}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <EditableTitle value={task.name} onSave={handleSaveTitle} saving={savingTitle}/>
                  {(() => {
                    const s = STATUS_CONFIG[task.status] || STATUS_CONFIG["Todo"]
                    return (
                      <span className="shrink-0 inline-flex items-center gap-1.5 mt-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }}/>
                        {task.status}
                      </span>
                    )
                  })()}
                </div>

                <div className="flex gap-1.5">
                  {["Todo", "In Progress", "Done"].map(s => {
                    const active = task.status === s
                    return (
                      <button key={s} onClick={() => !active && handleMove(s)} disabled={moving}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        style={{
                          background: active ? "#18181B" : "#F4F4F5",
                          color:      active ? "#FAFAFA"  : "#71717A",
                          border:     active ? "1px solid #18181B" : "1px solid transparent",
                        }}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="px-6 py-1" style={{ borderBottom: "1px solid #F4F4F5" }}>
                <FieldRow icon={
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                } label="Created">
                  <span className="text-sm text-zinc-600">{formatDate(task.created_at)}</span>
                </FieldRow>

                <FieldRow icon={
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 3.5h9M1.5 6h9M1.5 8.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                } label="Task ID">
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-200">
                    #{task.id}
                  </span>
                </FieldRow>

                <FieldRow icon={
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 2.5h9M1.5 5h9M1.5 7.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                } label="Notes">
                  <EditableDescription value={task.contents} onSave={handleSaveDescription} saving={saving}/>
                </FieldRow>
              </div>

              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Activity</span>
                  {commentCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-900 text-white">
                      {commentCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 pb-6 flex flex-col gap-4">
                {logsLoading && (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-zinc-100 border-t-zinc-400 rounded-full animate-spin"/>
                  </div>
                )}

                {!logsLoading && logs.length === 0 && (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "#F4F4F5", border: "1px solid #E4E4E7" }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M17 11a1 1 0 01-1 1H6l-3 3V4a1 1 0 011-1h12a1 1 0 011 1v7z"
                          stroke="#A1A1AA" strokeWidth="1.4" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-zinc-500">No activity yet</p>
                      <p className="text-[11px] text-zinc-300 mt-0.5">Be the first to comment</p>
                    </div>
                  </div>
                )}

                {!logsLoading && logs.map((log, i) => (
                  <FeedEntry key={log.id || i} log={log}/>
                ))}

                <div ref={bottomRef}/>

                {logs.length > 0 && (
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-zinc-100"/>
                    <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">Reply</span>
                    <div className="flex-1 h-px bg-zinc-100"/>
                  </div>
                )}

                <CommentEditor user={user} onSubmit={handleComment} submitting={submitting}/>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  )
}
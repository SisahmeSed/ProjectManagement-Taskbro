import { useState, useRef } from "react"
import { useAuth } from "../../store/AuthContext"
import { createTask } from "../../api/tasks.api"
import { createLog } from "../../api/changelog.api"

const STATUSES = ["Todo", "In Progress", "Done"]

export default function AddTaskModal({ projectId, defaultStatus = "Todo", onClose, onCreated }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name:     "",
    contents: "",
    status:   defaultStatus,
  })
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)
  const submitting = useRef(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleCreate = async (e) => {
    e?.preventDefault?.()
    if (submitting.current) return
    if (!form.name.trim()) { setError("Task name is required"); return }
    setError("")
    setLoading(true)
    submitting.current = true

    try {
      await createTask({
        name:       form.name.trim(),
        contents:   form.contents.trim(),
        status:     form.status,
        project_id: parseInt(projectId),
      })

      await createLog({
        user_id:    user?.user_id,
        action:     "created",
        new_status: form.status,
        task_name:  form.name.trim(),
      }).catch(() => {})

      onCreated()
    } catch (err) {
      console.error("Create task error:", err)
      setError("Could not create task. Please try again.")
    } finally {
      setLoading(false)
      submitting.current = false
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      handleCreate()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: "420px",
          background: "#0a0a0a",
          border: "1px solid #222",
          borderRadius: "16px",
          boxShadow: "0 0 0 1px #111, 0 32px 64px rgba(0,0,0,0.9)",
          overflow: "hidden",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 14px",
          borderBottom: "1px solid #1a1a1a",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%", background: "#fff",
            }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", letterSpacing: "0.01em" }}>
              New Task
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#444", fontSize: "16px", lineHeight: 1, padding: "2px",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => e.target.style.color = "#fff"}
            onMouseLeave={e => e.target.style.color = "#444"}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>

          {error && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(255,60,60,0.07)",
              border: "1px solid rgba(255,60,60,0.2)",
              fontSize: "12px",
              color: "#f87171",
              letterSpacing: "0.01em",
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <label style={{ fontSize: "11px", fontWeight: 500, color: "#555", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Task Name <span style={{ color: "#fff" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={form.name}
              onChange={update("name")}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                width: "100%",
                background: "#111",
                border: "1px solid #222",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "14px",
                color: "#fff",
                outline: "none",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={e  => e.target.style.borderColor = "#444"}
              onBlur={e   => e.target.style.borderColor = "#222"}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <label style={{ fontSize: "11px", fontWeight: 500, color: "#555", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Description
            </label>
            <textarea
              placeholder="Add more details..."
              value={form.contents}
              onChange={update("contents")}
              onKeyDown={handleKeyDown}
              rows={3}
              style={{
                width: "100%",
                background: "#111",
                border: "1px solid #222",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "#fff",
                outline: "none",
                resize: "none",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
                lineHeight: "1.5",
                fontFamily: "inherit",
              }}
              onFocus={e  => e.target.style.borderColor = "#444"}
              onBlur={e   => e.target.style.borderColor = "#222"}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <label style={{ fontSize: "11px", fontWeight: 500, color: "#555", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Status
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: "7px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: form.status === s ? "#fff" : "#111",
                    border: form.status === s ? "1px solid #fff" : "1px solid #222",
                    color: form.status === s ? "#000" : "#555",
                    letterSpacing: "0.01em",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px 16px",
          borderTop: "1px solid #1a1a1a",
        }}>
          <span style={{ fontSize: "11px", color: "#333" }}>
            Ctrl + Enter to submit
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onClose}
              type="button"
              style={{
                background: "none",
                border: "1px solid #222",
                borderRadius: "7px",
                padding: "7px 16px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#555",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#444"; e.target.style.color = "#fff" }}
              onMouseLeave={e => { e.target.style.borderColor = "#222"; e.target.style.color = "#555" }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              type="button"
              style={{
                background: loading ? "#222" : "#fff",
                border: "1px solid transparent",
                borderRadius: "7px",
                padding: "7px 18px",
                fontSize: "12px",
                fontWeight: 600,
                color: loading ? "#555" : "#000",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? "Creating…" : "Create Task"}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
import { useState, useRef } from "react"
import { useAuth } from "../../store/AuthContext"
import { createTask } from "../../api/tasks.api"
import { createLog } from "../../api/changelog.api"
import Modal from "./Modal"
import FormField from "../forms/FormField"

const STATUSES = ["Todo", "In Progress", "Done"]

const inputCls =
  "w-full px-3 py-2 text-[13.5px] rounded-[10px] outline-none bg-gray-50 border border-gray-200 text-gray-900 shadow-inner transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100 focus:bg-white"

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

  const handleCreate = async () => {
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
    <Modal
      onClose={onClose}
      contentClassName="w-full max-w-md rounded-2xl flex flex-col gap-5 p-6 bg-white border border-gray-200 shadow-2xl animate-[modalIn_0.2s_cubic-bezier(0.34,1.4,0.64,1)]"
    >
    
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">New task</h2>
          <p className="text-xs text-gray-400 mt-0.5">Add a task to this project</p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200 bg-transparent cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l9 9M10 1L1 10" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] px-3.5 py-2.5 text-[13px] text-red-800 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="6" /><path d="M7 4v3.5M7 9.5v.5" />
          </svg>
          {error}
        </div>
      )}

      
      <FormField label="Task name" required>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={form.name}
          onChange={update("name")}
          onKeyDown={handleKeyDown}
          autoFocus
          className={inputCls}
        />
      </FormField>

     
      <FormField label="Description">
        <textarea
          placeholder="Add more details..."
          value={form.contents}
          onChange={update("contents")}
          onKeyDown={handleKeyDown}
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </FormField>

   
      <FormField label="Status">
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, status: s })}
              className={`flex-1 py-2 px-3 rounded-[9px] text-[12.5px] font-medium border transition-all cursor-pointer
                ${form.status === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FormField>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-gray-300">Ctrl + Enter to submit</span>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-[9px] text-[13px] font-medium text-gray-500 bg-gray-100 border-none cursor-pointer hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            type="button"
            className={`px-5 py-2 rounded-[9px] text-[13px] font-semibold text-white bg-gray-900 border-none shadow-sm transition-all
              ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-800"}`}
          >
            {loading ? "Creating…" : "Create task"}
          </button>
        </div>
      </div>
    </Modal>
  )
}
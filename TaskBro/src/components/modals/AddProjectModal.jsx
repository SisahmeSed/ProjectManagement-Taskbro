import { useState, useRef } from "react"
import { useAuth } from "../../store/AuthContext"
import { createProject } from "../../api/projects.api"
import Modal from "./Modal"
import FormField from "../forms/FormField"

const inputCls = "w-full px-3 py-2 text-[13.5px] rounded-[10px] outline-none bg-gray-50 border border-gray-200 text-gray-900 shadow-inner transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100 focus:bg-white"

export default function AddProjectModal({ onClose, onCreated }) {
  const [name, setName]       = useState("")
  const [desc, setDesc]       = useState("")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const submitting             = useRef(false)
  const { user }               = useAuth()

  const handleCreate = async () => {
    if (submitting.current) return
    if (!name.trim()) { setError("Project name is required"); return }
    setError(""); setLoading(true); submitting.current = true
    try {
      const res    = await createProject({ user_id: user?.user_id, name: name.trim(), description: desc.trim() })
      const result = res.data?.data
      if (typeof result === "string" && result.toLowerCase().includes("exist")) { setError(result); return }
      onCreated?.({ show_toast: true, message: "Project created successfully" }); onClose()
    } catch { setError("Could not create project. Please try again.") }
    finally { setLoading(false); submitting.current = false }
  }

  return (
    <Modal
      onClose={onClose}
      contentClassName="w-full max-w-md rounded-2xl flex flex-col gap-5 p-6 bg-white border border-gray-200 shadow-2xl animate-[modalIn_0.2s_cubic-bezier(0.34,1.4,0.64,1)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">New project</h2>
          <p className="text-xs text-gray-400 mt-0.5">Add a project to your workspace</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200 bg-transparent cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l9 9M10 1L1 10"/></svg>
        </button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] px-3.5 py-2.5 text-[13px] text-red-800 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="6"/><path d="M7 4v3.5M7 9.5v.5"/></svg>
          {error}
        </div>
      )}
      <FormField label="Project name" required>
        <input placeholder="e.g. Website Redesign" value={name} onChange={e => setName(e.target.value)} autoFocus className={inputCls} />
      </FormField>
      <FormField label="Description">
        <textarea placeholder="What is this project about?" value={desc} onChange={e => setDesc(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
      </FormField>
      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onClose} className="px-4 py-2 rounded-[9px] text-[13px] font-medium text-gray-500 bg-gray-100 border-none cursor-pointer hover:bg-gray-200 transition-all">Cancel</button>
        <button onClick={handleCreate} disabled={loading} className={`px-5 py-2 rounded-[9px] text-[13px] font-semibold text-white bg-gray-900 border-none shadow-sm transition-all ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-800"}`}>
          {loading ? "Creating…" : "Create project"}
        </button>
      </div>
    </Modal>
  )
}

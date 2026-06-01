import { useState, useEffect } from "react"
import { useAuth } from "../../store/AuthContext"
import { useToast } from "../../components/ui/Toast"
import { changePassword as apiChangePassword } from "../../api/auth.api"
import { getAllMembers } from "../../api/members.api"
import Modal from "./Modal"

function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 7.5S3.5 2.5 7.5 2.5 14 7.5 14 7.5 11.5 12.5 7.5 12.5 1 7.5 1 7.5z"/>
      <circle cx="7.5" cy="7.5" r="2"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 1l13 13M6.2 6.3A2 2 0 0 0 9.2 9.2M4 4.2C2.4 5.2 1 7.5 1 7.5S3.5 12.5 7.5 12.5c1.2 0 2.3-.4 3.2-1M6.5 2.6C6.8 2.5 7.1 2.5 7.5 2.5c4 0 6.5 5 6.5 5s-.6 1.2-1.7 2.3"/>
    </svg>
  )
}

function PasswordField({ label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10.5px] font-bold uppercase tracking-widest text-neutral-400">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-neutral-200 bg-white text-[13.5px] text-neutral-900 outline-none transition-all duration-150
            focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/8 placeholder:text-neutral-300"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600 transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  )
}

function InfoChip({ label, value, loading, icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10.5px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
        {icon}{label}
      </label>
      <div className={`px-3.5 py-2.5 rounded-lg border border-neutral-100 bg-neutral-50 text-[13px] font-medium text-neutral-500 truncate select-all ${loading ? "animate-pulse" : ""}`}>
        {loading ? <span className="text-transparent select-none">——</span> : (value || "—")}
      </div>
    </div>
  )
}

export default function ChangePasswordModal({ onClose }) {
  const { user } = useAuth()
  const { showToast } = useToast() || {}

  const [member,      setMember]      = useState(null)
  const [fetchStatus, setFetchStatus] = useState("loading")
  const [fetchError,  setFetchError]  = useState("")

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm,     setConfirm]     = useState("")
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState("")

  useEffect(() => {
    const userIdFromSession = user?.user_id
    if (!userIdFromSession) {
      setFetchStatus("error")
      setFetchError(`No user_id in auth session. user = ${JSON.stringify(user)}`)
      return
    }

    getAllMembers()
      .then(res => {
        const list = res?.data?.data ?? res?.data ?? []
        if (!Array.isArray(list)) {
          setFetchStatus("error")
          setFetchError(`getAllMembers did not return an array. Got: ${JSON.stringify(list)}`)
          return
        }

        const found = list.find(m => String(m.user_id) === String(userIdFromSession))
        if (!found) {
          setFetchStatus("error")
          setFetchError(`No member found with user_id "${userIdFromSession}" in list of ${list.length} members.`)
          return
        }

        setMember(found)
        setFetchStatus("success")
      })
      .catch(err => {
        setFetchStatus("error")
        setFetchError(
          `getAllMembers failed: ${err?.response?.status ?? "network error"} — ` +
          `${err?.response?.data?.message ?? err?.message ?? "unknown"}`
        )
      })
  }, [user?.user_id])

  const handleUpdate = async () => {
    setError("")
    const userId = member?.user_id
    const email  = member?.email
    if (!userId) { setError("Session error: could not identify user."); return }
    if (!email)  { setError(`Email not loaded — ${fetchError}`); return }
    if (!oldPassword || !newPassword || !confirm) { setError("All fields are required"); return }
    if (newPassword !== confirm) { setError("New password and confirmation do not match"); return }

    setLoading(true)
    try {
      const res = await apiChangePassword({
        user_id:      userId,
        email:        email,
        old_password: oldPassword,
        new_password: newPassword,
      })

      if (res?.status === 200) {
        showToast && showToast("Password updated successfully", "success")
        onClose()
      } else {
        setError(res?.data?.message || "Could not update password")
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update password")
    } finally {
      setLoading(false)
    }
  }

  const initials = member?.user_id ? String(member.user_id).slice(0, 2).toUpperCase() : "??"

  return (
    <Modal
      onClose={onClose}
      overlayStyle={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      contentClassName="w-full max-w-lg bg-white rounded-2xl overflow-hidden border border-neutral-200"
      contentStyle={{
        boxShadow: "0 32px 64px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
        animation: "modalIn 0.22s cubic-bezier(0.34,1.4,0.64,1)",
      }}
    >
      <div className="px-6 pt-6 pb-5 flex items-center justify-between border-b border-neutral-100">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white text-[12px] font-bold tracking-wide shrink-0">
            {fetchStatus === "loading"
              ? <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              : initials}
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-neutral-900 tracking-tight">Change Password</h2>
            <p className="text-[11.5px] text-neutral-400 mt-0.5 font-medium">
              {fetchStatus === "success" ? `Account · ${member?.user_id}` : "Loading account…"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 transition-all cursor-pointer"
        >
          <svg width="10" height="10" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M1 1l9 9M10 1L1 10"/>
          </svg>
        </button>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5">
        {fetchStatus === "error" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800 flex flex-col gap-1">
            <span className="font-semibold flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="7" r="6"/><path d="M7 4v3.5M7 9.5v.5"/>
              </svg>
              Failed to load account details
            </span>
            <pre className="whitespace-pre-wrap break-all text-[11px] opacity-75 mt-0.5">{fetchError}</pre>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-[12.5px] text-neutral-700 flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="7" r="6"/><path d="M7 4v3.5M7 9.5v.5"/>
            </svg>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <p className="text-[10.5px] font-bold uppercase tracking-widest text-neutral-300">Account</p>
          <div className="grid grid-cols-2 gap-3">
            <InfoChip
              label="User ID"
              value={member?.user_id}
              loading={fetchStatus === "loading"}
              icon={
                <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="5" r="3"/><path d="M1 13c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                </svg>
              }
            />
            <InfoChip
              label="Email"
              value={member?.email}
              loading={fetchStatus === "loading"}
              icon={
                <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="12" height="8" rx="1.5"/><path d="M1 4l6 4.5L13 4"/>
                </svg>
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-300">Update Password</span>
          <div className="flex-1 h-px bg-neutral-100" />
        </div>

        <div className="flex flex-col gap-3">
          <PasswordField
            label="Current Password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div className="grid grid-cols-2 gap-3">
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm Password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-[13px] font-semibold text-neutral-500 bg-white border border-neutral-200 cursor-pointer hover:bg-neutral-50 hover:text-neutral-800 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          disabled={loading || fetchStatus === "loading"}
          className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-neutral-900 border border-neutral-900 cursor-pointer hover:bg-neutral-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && (
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          )}
          {loading ? "Updating…" : "Update Password"}
        </button>
      </div>

    </Modal>
  )
}


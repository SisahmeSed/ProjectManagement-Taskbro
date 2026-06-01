
import { useState, useRef } from "react"
import { loginUser } from "../../api/auth.api"
import { EyeOpen, EyeClosed } from "./shared/EyeIcons"

function PillInput({ icon, type = "text", placeholder, value, onChange, error, autoFocus = false, rightSlot }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center gap-3 rounded-full px-5 py-3 bg-gray-100 border-2 transition-all duration-150
        ${error ? "border-red-400" : "border-transparent focus-within:border-blue-400"}`}>
        <span className="text-gray-400 shrink-0">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        {rightSlot && <span className="shrink-0">{rightSlot}</span>}
      </div>
      {error && <p className="text-xs text-red-500 pl-5">{error}</p>}
    </div>
  )
}


function PillButton({ loading, loadingText, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-full py-3 text-sm font-bold tracking-widest uppercase text-white
        flex items-center justify-center gap-2 transition-all duration-150
        active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: loading ? "#7ab3f5" : "linear-gradient(135deg, #4481eb, #04befe)" }}
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {loadingText}
        </>
      ) : children}
    </button>
  )
}

export default function LoginForm({ onSuccess, defaultUserId = "" }) {
  const [form,     setForm]     = useState({ user_id: defaultUserId, password: "" })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState("")
  const [showPass, setShowPass] = useState(false)
  const submitting = useRef(false)

  const validate = () => {
    const e = {}
    if (!form.user_id)  e.user_id  = "User ID is required"
    if (!form.password) e.password = "Password is required"
    return e
  }

  const handleSubmit = async () => {
    if (submitting.current) return
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setApiError(""); setLoading(true); submitting.current = true
    try {
      const res    = await loginUser(form)
      const result = res.data?.data
      if (typeof result === "string" && result.toLowerCase().includes("invalid")) {
        setApiError("Invalid user ID or password."); return
      }
      if (res.status === 201) { onSuccess({ user_id: form.user_id }); return }
      setApiError("Unexpected response. Please try again.")
    } catch (err) {
      console.error("Login error:", err)
      setApiError("Something went wrong. Please try again.")
    } finally {
      setLoading(false); submitting.current = false
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Sign In</h2>

      {apiError && (
        <div className="w-full rounded-full bg-red-50 border border-red-200 px-5 py-2.5 text-xs text-red-600 text-center font-medium">
          {apiError}
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        <PillInput
          icon={<UserIcon />}
          placeholder="Username"
          value={form.user_id}
          onChange={update("user_id")}
          error={errors.user_id}
          autoFocus
        />
        <PillInput
          icon={<LockIcon />}
          type={showPass ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
          rightSlot={
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              {showPass ? <EyeClosed /> : <EyeOpen />}
            </button>
          }
        />
      </div>

      <PillButton loading={loading} loadingText="Signing in…" onClick={handleSubmit}>
        Login
      </PillButton>
    </div>
  )
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}
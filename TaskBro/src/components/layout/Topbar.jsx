import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../store/AuthContext"
import MembersPanel from "./MembersPanel"
import ChangePasswordModal from "../modals/ChangePasswordModal"

const NAV_ITEMS = [
  { label: "Projects", path: "/projects", panel: null },
  { label: "Activity", path: "/activity", panel: null },
  { label: "Settings", path: null,        panel: null },
  { label: "Members",  path: null,        panel: "members" },
]

const NAV_ICONS = {
  Projects: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  Activity: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M1 7.5h2.5l2-5 2.5 9 2-4H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Members: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 13c0-3.314 2.462-5 5.5-5s5.5 1.686 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Settings: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M8.5 1.5h-2v1.2a4.2 4.2 0 0 0-1.5.8L3.8 3.1 3 4l.7 1.6A4.2 4.2 0 0 0 3 7.5c0 .6.1 1.2.3 1.7L3 9.9 3.8 10.8l1.2-.4c.4.3.9.5 1.5.6V12.5h2v-1.5c.6-.1 1.1-.3 1.5-.6l1.2.4.8-.9-.3-1.2c.2-.5.3-1.1.3-1.7 0-.6-.1-1.2-.3-1.7l.3-1.2-.8-.9-1.2.4c-.4-.3-.9-.5-1.5-.6V1.5zM7.5 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" stroke="currentColor" strokeWidth="0.6" fill="currentColor" />
    </svg>
  ),
}

export default function Topbar({ actionButtons = [] }) {
  const navigate        = useNavigate()
  const location        = useLocation()
  const { user, logout} = useAuth()
  const [menuOpen,        setMenuOpen]        = useState(false)
  const [activePanel,     setActivePanel]     = useState(null)
  const [settingsOpen,    setSettingsOpen]    = useState(false)
  const [openChangeModal, setOpenChangeModal] = useState(false)

  const isActive = (item) => {
    if (item.label === "Settings") return false
    if (settingsOpen) return false
    if (item.panel) return activePanel === item.panel
    if (!item.path) return false
    return location.pathname.startsWith(item.path)
  }

  const handleNavClick = (item) => {
    if (item.panel) {
      setActivePanel(prev => prev === item.panel ? null : item.panel)
      setSettingsOpen(false) 
      setMenuOpen(false)
      return
    }
    setActivePanel(null)
    setSettingsOpen(false)  
    navigate(item.path)
    setMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const userInitials = user?.user_id?.slice(0, 2).toUpperCase() || "?"

  return (
    <>
      <aside
        className="hidden md:flex flex-col w-52 shrink-0 h-screen overflow-hidden"
        style={{ background: "#F0EFED" }}
      >
        <div className="flex items-center gap-2.5 px-4 py-4.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span className="text-[13.5px] font-bold text-gray-900 tracking-tight">Taskflow</span>
        </div>

        <div className="px-4 mb-1">
          <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">General</span>
        </div>

        <nav className="flex-1 px-2.5 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item)

            if (item.label === "Settings") {
              return (
                <div key={item.label} className="w-full flex flex-col">
                  <button
                    onClick={() => { setSettingsOpen(v => !v); setActivePanel(null) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.75 rounded-lg text-[13px] transition-all duration-150 text-left relative ${settingsOpen
                        ? "text-gray-900 font-medium"
                        : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
                      }`}

                  >
                    {settingsOpen && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-4 bg-gray-900 rounded-r-full" />
                    )}
                    <span className={`shrink-0 ${settingsOpen ? "text-gray-900" : "text-gray-400"}`}>
                      {NAV_ICONS["Settings"]}
                    </span>
                    Settings
                    <span
                      className={`ml-auto shrink-0 transition-transform duration-150 ${settingsOpen ? "text-gray-600" : "text-gray-400"}`}
                      style={{ transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                        <path d="M2 3.5l3 3 3-3"/>
                      </svg>
                    </span>
                  </button>

                  {settingsOpen && (
                    <div className="relative mt-1 ml-5.5 pl-3">
                      <div className="absolute left-0 top-1 bottom-1 w-px bg-gray-300 rounded-full" />
                      <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
                        <button
                          onClick={() => setOpenChangeModal(true)}
                          className={`w-full text-left px-3 py-1.75 text-[13px] transition-colors ${
                            openChangeModal
                              ? "text-gray-900 font-medium bg-gray-50"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.75 rounded-lg text-[13px] transition-all duration-150 text-left relative ${
                  active
                    ? "bg-white text-gray-900 font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-4 bg-gray-900 rounded-r-full" />
                )}
                <span className={`shrink-0 ${active ? "text-gray-900" : "text-gray-400"}`}>
                  {NAV_ICONS[item.label]}
                </span>
                {item.label}
              </button>
            )
          })}

          {actionButtons.length > 0 && (
            <div className="mt-2 pt-2 flex flex-col gap-0.5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              {actionButtons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.75 rounded-lg text-[13px] transition-all text-left ${
                    btn.variant === "primary"
                      ? "bg-gray-900 text-white hover:bg-gray-800 font-medium shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="shrink-0 px-2.5 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors cursor-default">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm"
              style={{ background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)" }}
            >
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-gray-900 truncate leading-tight">{user?.user_id}</p>
              <p className="text-[10px] text-gray-400 truncate leading-tight">{user?.email || "Member"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-0.5 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M5 11H2.5A1.5 1.5 0 011 9.5v-6A1.5 1.5 0 012.5 2H5M9 9.5l3-3-3-3M12 6.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <header className="md:hidden h-12 bg-[#F0EFED] border-b border-gray-200 shrink-0 flex items-center px-4 gap-3">
        <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => navigate("/projects")}>
          <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">T</span>
          </div>
          <span className="font-bold text-sm text-gray-900">Taskflow</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 flex flex-col justify-center gap-1.5"
        >
          <span className={`h-0.5 bg-gray-700 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`h-0.5 bg-gray-700 transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 bg-gray-700 transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </header>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 flex flex-col gap-0.5 z-30 relative">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item)
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                {userInitials}
              </div>
              <span className="text-sm text-gray-600">{user?.user_id}</span>
            </div>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-700">
              Sign out
            </button>
          </div>
        </div>
      )}

      <MembersPanel open={activePanel === "members"} onClose={() => setActivePanel(null)} />
      {openChangeModal && <ChangePasswordModal onClose={() => setOpenChangeModal(false)} />}
    </>
  )
}
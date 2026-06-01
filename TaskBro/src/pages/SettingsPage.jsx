import { useState } from "react"
import ChangePasswordModal from "../components/modals/ChangePasswordModal"

export default function SettingsPage() {
  const [openChange, setOpenChange] = useState(false)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-7 pt-5 pb-4 bg-transparent border-b border-black/[0.07]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[28px] font-bold text-gray-900">Settings</h1>
          <p className="text-xs text-gray-400 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6 scrollbar-none [&::-webkit-scrollbar]:hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          <div className="bg-white border border-gray-100 rounded-[11px] p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Security</h2>
            <div className="text-sm text-gray-600">Manage your password and account security settings.</div>
            <div className="mt-4">
              <button onClick={() => setOpenChange(true)} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 hover:bg-gray-100">Change Password</button>
            </div>
          </div>

        </div>
      </div>

      {openChange && <ChangePasswordModal onClose={() => setOpenChange(false)} />}
    </div>
  )
}

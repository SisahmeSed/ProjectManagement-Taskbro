export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-2 flex items-center justify-center p-6">
      <div className="auth-enter w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}

import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"
import AuthOverlay from "./AuthOverlay"

export default function AuthCard({ isSignUp, onSignIn, onSignUp, onLoginSuccess, onSignUpSuccess, lastUserId, onUserIdChange, successMsg }) {
  return (
    <div className="relative w-full bg-white rounded-2xl overflow-hidden"
      style={{ maxWidth: 900, minHeight: 560, boxShadow: "var(--shadow-panel)" }}>
      <div className="absolute top-0 left-0 h-full w-1/2 flex items-center justify-center px-10 py-12">
        <div className="w-full max-w-xs">
          <LoginForm onSuccess={onLoginSuccess} defaultUserId={lastUserId} />
        </div>
      </div>
      <div className="absolute top-0 right-0 h-full w-1/2 flex items-center justify-center px-10 py-12">
        <div className="w-full max-w-xs">
          <RegisterForm onUserIdChange={onUserIdChange} onSignUpSuccess={onSignUpSuccess} />
        </div>
      </div>
      <AuthOverlay isSignUp={isSignUp} onSignInClick={onSignIn} onSignUpClick={onSignUp} successMsg={successMsg} />
    </div>
  )
}

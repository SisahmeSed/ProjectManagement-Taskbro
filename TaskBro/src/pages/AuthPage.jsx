import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../store/AuthContext"
import AuthLayout from "../components/auth/AuthLayout"
import AuthCard from "../components/auth/AuthCard"

export default function AuthPage() {
  const [isSignUp,   setIsSignUp]   = useState(false)
  const [lastUserId, setLastUserId] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleLoginSuccess  = (user) => { login(user); navigate("/projects") }
  const handleSignUpSuccess = ()     => { setSuccessMsg("Account created! Please sign in."); setIsSignUp(false) }
  const handleSwitchToSignIn = ()    => { setIsSignUp(false); setSuccessMsg("") }
  const handleSwitchToSignUp = ()    => { setIsSignUp(true);  setSuccessMsg("") }

  return (
    <AuthLayout>
      <AuthCard
        isSignUp={isSignUp}
        onSignIn={handleSwitchToSignIn}
        onSignUp={handleSwitchToSignUp}
        onLoginSuccess={handleLoginSuccess}
        onSignUpSuccess={handleSignUpSuccess}
        lastUserId={lastUserId}
        onUserIdChange={setLastUserId}
        successMsg={successMsg}
      />
    </AuthLayout>
  )
}

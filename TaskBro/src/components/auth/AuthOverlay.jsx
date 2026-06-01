export default function AuthOverlay({ isSignUp, onSignInClick, onSignUpClick, successMsg }) {
  return (
    <div className={`absolute top-0 h-full w-1/2 overflow-hidden z-10 transition-transform duration-700 ease-in-out left-1/2 ${isSignUp ? "-translate-x-full" : "translate-x-0"}`}>
      <div
        className={`relative h-full w-[200%] -left-full transition-transform duration-700 ease-in-out ${isSignUp ? "translate-x-1/2" : "translate-x-0"}`}
        style={{ background: "linear-gradient(140deg, #4f35d2 0%, #6246EA 55%, #7c3aed 100%)" }}
      >
        <div className="pointer-events-none absolute -top-20 right-10 h-72 w-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 20%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-20 h-48 w-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 65%)" }} />
        <Panel side="left" onAction={onSignInClick} btnLabel="Sign In">
          <Logo />
          <h2 className="mt-7 text-[1.75rem] font-bold text-white leading-snug tracking-tight text-center">Already have<br />an account?</h2>
          <p className="mt-3 text-sm text-white/60 leading-relaxed text-center max-w-50">Sign in to access your workspace, boards, and team.</p>
        </Panel>
        <Panel side="right" onAction={successMsg ? onSignInClick : onSignUpClick} btnLabel={successMsg ? "Sign In Now" : "Sign Up"}>
          <Logo />
          {successMsg ? (
            <>
              <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 border border-white/25">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white tracking-tight text-center">Account created!</h2>
              <p className="mt-2 text-sm text-white/60 leading-relaxed text-center max-w-50">{successMsg}</p>
            </>
          ) : (
            <>
              <h2 className="mt-7 text-[1.75rem] font-bold text-white leading-snug tracking-tight text-center">New here?</h2>
              <p className="mt-3 text-sm text-white/60 leading-relaxed text-center max-w-50">Create a free account and start organizing projects with your team.</p>
            </>
          )}
        </Panel>
      </div>
    </div>
  )
}

function Panel({ children, side = "left", onAction, btnLabel }) {
  return (
    <div className={`absolute top-0 h-full w-1/2 flex flex-col items-center justify-center px-10 ${side === "left" ? "left-0" : "right-0"}`}>
      {children}
      <button onClick={onAction}
        className="mt-8 rounded-full border-2 border-white/80 px-8 py-2.5 text-xs font-bold text-white tracking-[0.12em] uppercase hover:bg-white hover:text-primary transition-all duration-200 active:scale-95">
        {btnLabel}
      </button>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </div>
      <span className="text-lg font-bold text-white tracking-tight">TaskBro</span>
    </div>
  )
}

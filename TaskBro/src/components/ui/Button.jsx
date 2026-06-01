export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  fullWidth = false,
  disabled = false,
  loading = false,
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary:   "bg-[#6246EA] text-white hover:bg-[#4f35d2] active:scale-[0.98]",
    secondary: "bg-[#D1D1E9] text-[#2B2C34] hover:bg-[#bfbfdc] active:scale-[0.98]",
    ghost:     "bg-transparent text-[#2B2C34] hover:bg-[#D1D1E9] active:scale-[0.98]",
    danger:    "bg-[#E45858] text-white hover:bg-[#cf4444] active:scale-[0.98]",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""}`}
    >
      {loading ? (
        <>
          <span className="w-2 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </>
      ) : children}
    </button>
  )
}
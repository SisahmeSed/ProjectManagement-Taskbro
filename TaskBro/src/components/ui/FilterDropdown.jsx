import { useState, useEffect, useRef } from "react"

export default function FilterDropdown({ icon, placeholder, value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const active = !!value
  const label  = value ? options.find((o) => o.value === value)?.label ?? value : placeholder

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px", borderRadius: 9, cursor: "pointer",
          border: `1.5px solid ${active ? "#111" : "#e5e5e5"}`,
          background: active ? "#111" : "#f7f7f7",
          color: active ? "#fff" : "#444",
          fontSize: 12, fontWeight: 500,
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ opacity: 0.75, display: "flex", alignItems: "center" }}>{icon}</span>
        <span>{label}</span>
        <svg
          width="9" height="9" viewBox="0 0 9 9" fill="none"
          stroke={active ? "#fff" : "#888"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
          style={{ marginLeft: 2, transition: "transform 0.18s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M1.5 3l3 3 3-3"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 999,
          background: "#fff", border: "1.5px solid #e8e8e8",
          borderRadius: 11, padding: "5px",
          boxShadow: "0 8px 28px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
          minWidth: 160,
          animation: "ddFadeIn 0.15s cubic-bezier(.4,0,.2,1) both",
        }}>
          <button
            onClick={() => { onChange(""); setOpen(false) }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "7px 10px", borderRadius: 7,
              border: "none", background: !value ? "#f3f3f3" : "transparent",
              fontSize: 12, fontWeight: !value ? 600 : 400,
              color: "#555", cursor: "pointer", textAlign: "left",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => { if (value) e.currentTarget.style.background = "#f7f7f7" }}
            onMouseLeave={(e) => { if (value) e.currentTarget.style.background = "transparent" }}
          >
            <span style={{
              width: 16, height: 16, borderRadius: 4,
              border: "1.5px solid #ddd", background: !value ? "#111" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {!value && <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 4.5l2 2 4-4"/></svg>}
            </span>
            All
          </button>

          <div style={{ height: 1, background: "#f0f0f0", margin: "4px 0" }} />

          {options.map((opt) => {
            const selected = value === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "7px 10px", borderRadius: 7,
                  border: "none", background: selected ? "#f3f3f3" : "transparent",
                  fontSize: 12, fontWeight: selected ? 600 : 400,
                  color: selected ? "#111" : "#444",
                  cursor: "pointer", textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "#f7f7f7" }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent" }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `1.5px solid ${selected ? "#111" : "#ddd"}`,
                  background: selected ? "#111" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "all 0.12s",
                }}>
                  {selected && <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 4.5l2 2 4-4"/></svg>}
                </span>
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

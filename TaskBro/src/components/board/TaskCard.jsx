import { Draggable } from "@hello-pangea/dnd"

const STATUS_CONFIG = {
  "Todo":        {
    dot:        "#6246EA",
    bg:         "#F0EDFF",
    text:       "#6246EA",
    glowFrom:   "rgba(98,70,234,0.10)",
    glowTo:     "rgba(98,70,234,0)",
  },
  "In Progress": {
    dot:        "#F59E0B",
    bg:         "#FFFBEB",
    text:       "#D97706",
    glowFrom:   "rgba(251,191,36,0.13)",
    glowTo:     "rgba(251,191,36,0)",
  },
  "Done":        {
    dot:        "#10B981",
    bg:         "#ECFDF5",
    text:       "#059669",
    glowFrom:   "rgba(16,185,129,0.10)",
    glowTo:     "rgba(16,185,129,0)",
  },
}

const formatDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    day:     "numeric",
    month:   "short",
  })
}

const CalendarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="#9CA3AF" strokeWidth="1.2"/>
    <path d="M1 5h10" stroke="#9CA3AF" strokeWidth="1.2"/>
    <path d="M4 1v2M8 1v2" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="5" stroke="#9CA3AF" strokeWidth="1.2"/>
    <path d="M6 3.5V6l1.5 1.5" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function TaskCard({ task, index, onClick, isSelected }) {
  const cfg    = STATUS_CONFIG[task.status] || STATUS_CONFIG["Todo"]
  const isDone = task.status === "Done"

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className="relative bg-white rounded-2xl cursor-pointer select-none w-full group overflow-hidden"
          style={{
            border: isSelected
              ? "1.5px solid #6246EA"
              : snapshot.isDragging
              ? "1.5px solid #6246EA"
              : "1px solid #EBEBEB",
            boxShadow: snapshot.isDragging
              ? "0 16px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)"
              : isSelected
              ? "0 0 0 3px rgba(98,70,234,0.10), 0 2px 8px rgba(0,0,0,0.06)"
              : "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
            transition: "box-shadow 150ms ease, border-color 150ms ease, transform 150ms ease",
            transform: snapshot.isDragging ? "rotate(1.5deg) scale(1.02)" : "none",
            opacity: snapshot.isDragging ? 0.97 : 1,
            ...provided.draggableProps.style,
          }}
          onMouseEnter={(e) => {
            if (!snapshot.isDragging && !isSelected) {
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)"
              e.currentTarget.style.borderColor = "#D1D5DB"
            }
          }}
          onMouseLeave={(e) => {
            if (!snapshot.isDragging && !isSelected) {
              e.currentTarget.style.boxShadow =
                "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)"
              e.currentTarget.style.borderColor = "#EBEBEB"
            }
          }}
        >
          <div
            aria-hidden
            style={{
              position:     "absolute",
              bottom:       0,
              right:        0,
              width:        "60%",
              height:       "55%",
              background:   `radial-gradient(ellipse at bottom right, ${cfg.glowFrom} 0%, ${cfg.glowTo} 70%)`,
              pointerEvents: "none",
              borderRadius: "0 0 16px 0",
            }}
          />

          <div className="relative px-4 pt-3.5 pb-3.5 flex flex-col gap-2.5">

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                <CalendarIcon />
                {formatDate(task.updated_at) ?? "—"}
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-gray-300 uppercase">
                #{task.id}
              </span>
            </div>

            <p
              className="text-[16px] font-black leading-snug tracking-tight"
              style={{
                color:          isDone ? "#9CA3AF" : "#014421",
                textDecoration: isDone ? "line-through" : "none", 
                
              }}
            >
              {task.name}
            </p>

            {task.contents && (
              <p className="text-[11.5px] text-gray-400 leading-relaxed line-clamp-2">
                {task.contents}
              </p>
            )}

            <div className="flex items-center justify-between pt-0.5">

              <span
                className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.text }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: cfg.dot }}
                />
                {task.status}
              </span>

              {task.created_at && (
                <span className="inline-flex items-center gap-1 text-[10.5px] text-gray-400">
                  <ClockIcon />
                  {formatDate(task.created_at)}
                </span>
              )}
            </div>

          </div>
        </div>
      )}
    </Draggable>
  )
}
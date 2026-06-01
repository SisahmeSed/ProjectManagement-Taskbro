import { useState, useRef, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { updateTask } from "../../api/tasks.api"
import { useToast } from "../ui/Toast"

const STATUS_GROUPS = [
  { id: "Todo",        label: "To Do"       },
  { id: "In Progress", label: "In Progress" },
  { id: "Done",        label: "Completed"   },
]

const STATUS_CONFIG = {
  "Todo":        { dot: "#6246EA", bg: "#F0EDFF", text: "#6246EA", accent: "#6246EA", headerBg: "#FAFAF9" },
  "In Progress": { dot: "#F59E0B", bg: "#FFFBEB", text: "#D97706", accent: "#F59E0B", headerBg: "#FFFDF5" },
  "Done":        { dot: "#10B981", bg: "#ECFDF5", text: "#059669", accent: "#10B981", headerBg: "#F5FDF9" },
}

const formatDate = (dateStr) => {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
}

const SortIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M5 2L3 4.5h4L5 2zM5 8L3 5.5h4L5 8z" fill="#9CA3AF"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const DragHandleIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
    <circle cx="3" cy="3"  r="1.2" fill="#D1D5DB"/>
    <circle cx="3" cy="7"  r="1.2" fill="#D1D5DB"/>
    <circle cx="3" cy="11" r="1.2" fill="#D1D5DB"/>
    <circle cx="7" cy="3"  r="1.2" fill="#D1D5DB"/>
    <circle cx="7" cy="7"  r="1.2" fill="#D1D5DB"/>
    <circle cx="7" cy="11" r="1.2" fill="#D1D5DB"/>
  </svg>
)

function RowDotsMenu({ task, onEdit }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="3"  r="1.2" fill="#9CA3AF"/>
          <circle cx="7" cy="7"  r="1.2" fill="#9CA3AF"/>
          <circle cx="7" cy="11" r="1.2" fill="#9CA3AF"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32">
          <button
            onClick={() => { onEdit?.(task); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5a1.5 1.5 0 012.1 2.1L4 10.2l-2.8.6.6-2.8 6.7-6.5z"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Edit
          </button>
        </div>
      )}
    </div>
  )
}

function ColHeader({ label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 select-none cursor-pointer hover:text-gray-600 transition-colors">
      {label}<SortIcon />
    </span>
  )
}

function TaskRow({ task, index, onTaskClick, isSelected }) {
  const [hovered, setHovered] = useState(false)
  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG["Todo"]

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 cursor-pointer transition-colors duration-100"
          style={{
            background: snapshot.isDragging ? "#F3F4F6" : hovered || isSelected ? "#F9FAFB" : "white",
            boxShadow: snapshot.isDragging ? "0 4px 16px rgba(0,0,0,0.10)" : "none",
            ...provided.draggableProps.style,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onTaskClick?.(task)}
        >
          <div
            {...provided.dragHandleProps}
            className="shrink-0 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
            style={{ opacity: hovered || snapshot.isDragging ? 1 : 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <DragHandleIcon />
          </div>

          <input
            type="checkbox"
            defaultChecked={task.status === "Done"}
            className="w-3.5 h-3.5 rounded border-gray-300 accent-violet-500 shrink-0 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />

          <span
            className="flex-1 min-w-0 text-[13px] font-medium truncate"
            style={{
              textDecoration: task.status === "Done" ? "line-through" : "none",
              color: task.status === "Done" ? "#9CA3AF" : "#1F2937",
            }}
          >
            {task.name}
          </span>

          <div className="w-30 shrink-0">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: cfg.bg, color: cfg.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
              {task.status}
            </span>
          </div>

          <div className="w-32.5 shrink-0">
            <span className="text-[12px] text-gray-600 font-medium">
              {task.project_id ? `Project ${task.project_id}` : "—"}
            </span>
          </div>

          <div className="w-27.5 shrink-0">
            <span className="text-[12px] text-gray-500">{formatDate(task.updated_at)}</span>
          </div>

          <RowDotsMenu task={task} onEdit={onTaskClick} />
        </div>
      )}
    </Draggable>
  )
}

function SectionGroup({ group, tasks, onTaskClick, selectedTaskId, onAddTask }) {
  const [collapsed, setCollapsed] = useState(false)
  const cfg = STATUS_CONFIG[group.id] || STATUS_CONFIG["Todo"]

  return (
    <div className="mb-1">
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-gray-200"
        style={{ background: cfg.headerBg, borderLeft: `3px solid ${cfg.accent}` }}
      >
        <button className="flex items-center gap-2" onClick={() => setCollapsed(!collapsed)}>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className="transition-transform duration-150 shrink-0"
            style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
          >
            <path d="M2 4l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[13px] font-semibold text-gray-700">{group.label}</span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: cfg.bg, color: cfg.text }}
          >
            {tasks.length}
          </span>
        </button>
        <button onClick={() => onAddTask?.(group.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <PlusIcon />
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-white border-b border-gray-100">
            <div className="w-2.5 shrink-0" />
            <div className="w-3.5 shrink-0" />
            <div className="flex-1 min-w-0"><ColHeader label="Tasks" /></div>
            <div className="w-30 shrink-0"><ColHeader label="Status" /></div>
            <div className="w-32.5 shrink-0"><ColHeader label="Project" /></div>
            <div className="w-27.5 shrink-0"><ColHeader label="Updated" /></div>
            <div className="w-6 shrink-0" />
          </div>

          <Droppable droppableId={group.id} type="LIST_TASK">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  background: snapshot.isDraggingOver ? "#F9FAFB" : "white",
                  minHeight: "40px",
                }}
              >
                {tasks.length === 0 && !snapshot.isDraggingOver && (
                  <div className="px-3 py-4 text-center">
                    <p className="text-[12px] text-gray-300">No tasks — drop here or add one</p>
                  </div>
                )}
                {tasks.map((task, index) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    index={index}
                    onTaskClick={onTaskClick}
                    isSelected={selectedTaskId === task.id}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <button
            onClick={() => onAddTask?.(group.id)}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-gray-400
              hover:text-gray-600 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <PlusIcon />
            Add task
          </button>
        </>
      )}
    </div>
  )
}

export default function ListView({
  tasks = [],
  onTasksChange,
  onTaskClick,
  selectedTaskId,
  onAddTask,
}) {
  const { showToast } = useToast() || {}

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const taskId    = parseInt(draggableId)
    const task      = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus = destination.droppableId

    const sourceGroup = tasks.filter((t) => t.status === source.droppableId)
    const destGroup   = tasks.filter((t) => t.status === destination.droppableId)

    const remaining = tasks.filter((t) => t.id !== taskId)
    const updated   = { ...task, status: newStatus }

    const destItems = remaining.filter((t) => t.status === newStatus)
    destItems.splice(destination.index, 0, updated)
    const others = remaining.filter((t) => t.status !== newStatus)
    const newTasks = [...others, ...destItems]

    onTasksChange?.(newTasks)

    if (newStatus !== task.status) {
      try {
        await updateTask({ task_id: taskId, name: task.name, status: newStatus, contents: task.contents ?? "" })
        showToast?.(`Moved "${task.name}" to ${newStatus}`, "success")
      } catch (err) {
        console.error("Failed to update task:", err)
        onTasksChange?.(tasks)
        showToast?.("Failed to move task.", "error")
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white min-h-0">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-y-auto">
          {STATUS_GROUPS.map((group) => (
            <SectionGroup
              key={group.id}
              group={group}
              tasks={tasks.filter((t) => t.status === group.id)}
              onTaskClick={onTaskClick}
              selectedTaskId={selectedTaskId}
              onAddTask={onAddTask}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
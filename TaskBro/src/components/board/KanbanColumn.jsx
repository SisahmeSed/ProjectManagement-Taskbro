import { Droppable } from "@hello-pangea/dnd"
import TaskCard from "./TaskCard"

const TodoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="#9CA3AF" strokeWidth="1.4"/>
  </svg>
)
const InProgressIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="#F59E0B" strokeWidth="1.4"/>
    <path d="M7 4v3.5l2 1.2" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const DoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill="#10B981"/>
    <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const COL_CONFIG = {
  "Todo":        { Icon: TodoIcon,       color: "#6B7280" },
  "In Progress": { Icon: InProgressIcon, color: "#D97706" },
  "Done":        { Icon: DoneIcon,       color: "#059669" },
}

export default function KanbanColumn({
  column,
  tasks = [],
  onTaskClick,
  selectedTaskId,
  onAddTask,
}) {
  if (!column) return null

  const cfg = COL_CONFIG[column.id] || { Icon: TodoIcon, color: "#6B7280" }
  const { Icon } = cfg

  return (
    <div className="flex flex-col w-68 shrink-0 h-full rounded-xl px-2 pt-3 pb-2" style={{ backgroundColor: "#EFEFEF" }}>

      <div className="flex items-center justify-between px-1 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Icon />
          <span className="text-[13px] font-semibold text-gray-700">
            {column.label}
          </span>
          <span className="text-[11px] font-medium text-gray-400 bg-white px-1.5 py-0.5 rounded-md">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={onAddTask}
            title="Add task"
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400
              hover:bg-gray-200 hover:text-gray-600 transition-colors text-base leading-none"
          >
            +
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400
              hover:bg-gray-200 hover:text-gray-600 transition-colors text-xs"
          >
            ···
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-none">
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-2 rounded-lg transition-colors duration-150 p-1"
              style={{
                background: snapshot.isDraggingOver ? "#E2E2E2" : "transparent",
                outline: snapshot.isDraggingOver ? "2px dashed #D1D5DB" : "2px dashed transparent",
                outlineOffset: "2px",
                minHeight: "80px",
              }}
            >
              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <p className="text-[12px] text-gray-400 font-medium">Drop to change status</p>
                  <button
                    onClick={onAddTask}
                    className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + Add task
                  </button>
                </div>
              )}

              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={() => onTaskClick(task)}
                  isSelected={selectedTaskId === task.id}
                />
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {tasks.length > 0 && (
        <button
          onClick={onAddTask}
          className="mt-1 mx-1 py-2 flex items-center gap-1.5 text-[12px] text-gray-400
            hover:text-gray-600 hover:bg-gray-200 rounded-md px-2 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Add task
        </button>
      )}
    </div>
  )
}
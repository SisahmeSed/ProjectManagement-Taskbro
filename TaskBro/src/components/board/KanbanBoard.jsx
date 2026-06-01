import { useState } from "react"
import { DragDropContext } from "@hello-pangea/dnd"
import KanbanColumn from "./KanbanColumn"
import AddTaskModal from "../modals/AddTaskModal"
import { updateTask } from "../../api/tasks.api"
import { createLog } from "../../api/changelog.api"
import { useAuth } from "../../store/AuthContext"
import { useToast } from "../ui/Toast"

const DEFAULT_COLUMNS = [
  { id: "Todo",        label: "To-do"       },
  { id: "In Progress", label: "In Progress" },
  { id: "Done",        label: "Completed"   },
]

export default function KanbanBoard({
  projectId,
  tasks = [],
  projectName,
  onTasksChange,
  onTaskClick,
  selectedTaskId,
  onTaskCreated,
}) {
  const { user }      = useAuth()
  const { showToast } = useToast()
  const [columns]     = useState(DEFAULT_COLUMNS)
  const [addingToCol, setAddingToCol] = useState(null)

  const getColumnTasks = (colId) => tasks.filter((t) => t.status === colId)

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    const newStatus = destination.droppableId
    const taskId    = parseInt(draggableId)
    const task      = tasks.find((t) => t.id === taskId)
    if (!task) return

    const updatedTask = { ...task, status: newStatus }

    onTasksChange(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
    if (selectedTaskId === task.id) onTaskClick(updatedTask)

    try {
      await updateTask({ task_id: taskId, name: task.name, status: newStatus })
      await createLog({
        user_id:    user?.user_id,
        task_id:    taskId,
        task_name:  task.name,
        old_status: task.status,
        new_status: newStatus,
        remark:     `moved::${user?.user_id || ""}||${task.status}->${newStatus}`,
      })
      showToast(`Moved "${task.name}" → ${newStatus}`)
    } catch (err) {
      console.error("Failed to update task:", err)
      onTasksChange(tasks)
      if (selectedTaskId === task.id) onTaskClick(task)
      showToast("Failed to move task. Please try again.", "error")
    }
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0 overflow-x-auto flex flex-col [scrollbar-none] [&::-webkit-scrollbar]:hidden">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-5 px-6 py-5 min-w-max h-full items-stretch">
              {columns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={getColumnTasks(col.id)}
                  onTaskClick={onTaskClick}
                  selectedTaskId={selectedTaskId}
                  onAddTask={() => setAddingToCol(col.id)}
                />
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {addingToCol && (
        <AddTaskModal
          projectId={projectId}
          defaultStatus={addingToCol}
          onClose={() => setAddingToCol(null)}
          onCreated={() => {
            setAddingToCol(null)
            onTaskCreated()
            showToast("Task created successfully!")
          }}
        />
      )}
    </>
  )
}
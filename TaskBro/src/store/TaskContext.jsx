import { createContext, useContext, useState } from "react"

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        selectedTask,
        setSelectedTask,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = () => useContext(TaskContext)
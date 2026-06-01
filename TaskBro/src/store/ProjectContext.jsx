import { createContext, useContext, useState } from "react"

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [projects,        setProjects]        = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)

  return (
    <ProjectContext.Provider value={{
      projects,
      setProjects,
      selectedProject,
      setSelectedProject,
      loading,
      setLoading,
      error,
      setError,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => useContext(ProjectContext)
import { createContext, useContext, useState } from "react"

const ChangelogContext = createContext(null)

export function ChangelogProvider({ children }) {
  const [changelogs, setChangelogs] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  return (
    <ChangelogContext.Provider value={{
      changelogs, setChangelogs,
      loading,    setLoading,
      error,      setError,
    }}>
      {children}
    </ChangelogContext.Provider>
  )
}

export const useChangelogs = () => useContext(ChangelogContext)
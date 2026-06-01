import { createContext, useContext, useState } from "react"

const MemberContext = createContext(null)

export function MemberProvider({ children }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  return (
    <MemberContext.Provider
      value={{
        members,
        setMembers,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </MemberContext.Provider>
  )
}

export const useMembers = () => useContext(MemberContext)

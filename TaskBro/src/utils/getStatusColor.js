export const getStatusColor = (status) => ({
  todo:        { bg: "bg-blue-100",   text: "text-blue-700"  },
  in_progress: { bg: "bg-amber-100",  text: "text-amber-700" },
  done:        { bg: "bg-green-100",  text: "text-green-700" },
}[status] || { bg: "bg-gray-100", text: "text-gray-600" })

export const getPriorityColor = (priority) => ({
  high:   { bg: "bg-red-100",    text: "text-red-600"    },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700" },
  low:    { bg: "bg-green-100",  text: "text-green-600"  },
}[priority] || { bg: "bg-gray-100", text: "text-gray-600" })
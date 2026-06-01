import api from "./axiosInstance"
export const createLog   = (data) => api.post("/test04/create_changelog", data)
export const getAllLogs   = ()     => api.get("/test04/get_all_change_log")
export const getLog      = (id)   => api.get("/test04/get_change_log", { params: { id } })
export const updateLog   = (data) => api.patch("/test04/update_change_log", data)
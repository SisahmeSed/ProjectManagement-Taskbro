import api from "./axiosInstance"
export const createTask  = (data) => api.post("/test03/create_task", data)
export const getAllTasks  = ()     => api.get("/test03/get_all_task")
export const getTask     = (id)   => api.get("/test03/get_task", { params: { id } })
export const updateTask  = (data) => api.patch("/test03/patch_task", data)
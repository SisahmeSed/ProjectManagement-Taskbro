import api from "./axiosInstance"
export const createProject  = (data) => api.post("/test02/create_project", data)
export const getAllProjects  = ()     => api.get("/test02/get_all_project")
export const getProject     = (id)   => api.get("/test02/get_project", { params: { id } })
export const updateProject  = (data) => api.patch("/test02/patch_project", data)
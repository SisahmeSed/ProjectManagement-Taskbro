import api from "./axiosInstance"

export const loginUser   = (data) => api.post("/testlogin", data)
export const createMember = (data) => api.post("/test01/create_member", data)
export const changePassword = (data) => api.patch("/test01/update_member", data)
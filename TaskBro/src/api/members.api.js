import api from "./axiosInstance"
export const createMember  = (data) => api.post("/test01/create_member", data)
export const getAllMembers  = ()     => api.get("/test01/get_all_member")
export const getMember     = (id)   => api.get("/test01/get_member", { params: { id } })
export const updateMember  = (data) => api.patch("/test01/update_member", data)
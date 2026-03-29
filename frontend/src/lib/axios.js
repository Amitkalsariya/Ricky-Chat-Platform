import axios from "axios"
export const aixosIns=axios.create({
    baseURL:import.meta.env.MODE==="development"? `http://${window.location.hostname}:3000/api`:"/api",
    withCredentials:true
})
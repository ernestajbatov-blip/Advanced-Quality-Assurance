import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === "production" 
    ? "http://188.0.132.80:3000/api" 
    : "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
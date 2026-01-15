import axios from "axios";

// Dynamically get the base URL from the current window location
const getBaseURL = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : "";
  return `${protocol}//${hostname}${port}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
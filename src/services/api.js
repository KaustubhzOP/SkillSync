// Base API URL with environment variable support for cloud deployment (Exp 10)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default API_BASE_URL;

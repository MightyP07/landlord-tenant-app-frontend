const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

console.log("API_BASE is:", API_BASE);

export default API_BASE;

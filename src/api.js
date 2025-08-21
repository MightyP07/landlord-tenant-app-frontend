const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://landlord-tenant-app.onrender.com");

export default API_BASE;

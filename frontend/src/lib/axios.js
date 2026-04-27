import axios from "axios";

const DEFAULT_DEV_API_URL = "http://localhost:3000/api";

const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredUrl) {
    return import.meta.env.DEV ? DEFAULT_DEV_API_URL : "/api";
  }

  if (import.meta.env.DEV && configuredUrl.startsWith("https://localhost")) {
    return configuredUrl.replace("https://", "http://");
  }

  return configuredUrl;
};

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // by adding this field browser will send the cookies to server automatically, on every single req
});

export default axiosInstance;

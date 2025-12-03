import axios from "axios";

const api = axios.create({
  baseURL: "https://gisss.shop:8443/api",
});

export default api;

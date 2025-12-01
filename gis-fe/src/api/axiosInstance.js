import axios from "axios";

const api = axios.create({
  baseURL: "http://182.229.16.44:8080/api",
});

export default api;

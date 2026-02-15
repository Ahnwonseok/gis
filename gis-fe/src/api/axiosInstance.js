import axios from "axios";

const api = axios.create({
  baseURL: "https://gisss.shop/api"  // 443 포트는 기본 포트이므로 생략 가능
  //baseURL: "https://gisss.shop:443/api",  // 명시적으로 포트 지정도 가능
  //baseURL: "https://localhost:8443/api",  // 로컬 개발용
});

export default api;

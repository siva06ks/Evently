import axios from "axios";

// Use your machine IP on physical device, localhost for emulator/web.
const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export async function loginRequest(email: string, password: string) {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
}

export async function registerRequest(
  username: string,
  email: string,
  password: string,
  role?: string,
) {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
    role,
  });
  return response.data;
}

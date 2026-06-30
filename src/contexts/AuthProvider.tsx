import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthContextType } from "../interfaces/AuthContextType";
import type { User } from "../interfaces/User";
import { loginRequest, registerRequest } from "@/services/authService";

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(email: string, password: string) {
    const data = await loginRequest(email, password);
    localStorage.setItem("token", data.token);
    setUser({ username: "", email });
  }

  async function register(
    username: string,
    email: string,
    password: string,
    role?: string,
  ) {
    await registerRequest(username, email, password, role);
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthContextType } from "../interfaces/AuthContextType";
import type { User } from "../interfaces/User";
import { loginRequest, registerRequest } from "@/services/authService";

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredUser(): User | null {
  const stored = localStorage.getItem("user");
  if (!stored || !localStorage.getItem("token")) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  async function login(email: string, password: string) {
    const data = await loginRequest(email, password);
    const userData: User = { username: "", email };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
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
    localStorage.removeItem("user");
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

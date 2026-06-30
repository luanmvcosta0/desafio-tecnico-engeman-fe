import type { User } from "./User";

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    role?: string,
  ) => Promise<void>;
  logout: () => void;
}

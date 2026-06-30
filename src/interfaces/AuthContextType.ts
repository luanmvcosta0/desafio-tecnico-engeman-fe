import type { User } from "./User";

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

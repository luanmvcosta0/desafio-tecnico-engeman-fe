export type UserRole = "ADMIN" | "BROKER" | "CUSTOMER";

export interface User {
  username: string;
  email: string;
  role?: UserRole;
}

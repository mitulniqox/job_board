import { UserRole } from "../users/user.model";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
}

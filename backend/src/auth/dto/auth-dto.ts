import { Role } from "generated/prisma/enums";

export class LoginDto {
  email: string;
  password: string;
}

export class SignUpDto {
  email: string;
  password: string;
  name: string;
  role: Role
}

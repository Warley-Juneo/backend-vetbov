import { IsString, MinLength } from "class-validator";
import { IsEmail } from "class-validator";

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
} 
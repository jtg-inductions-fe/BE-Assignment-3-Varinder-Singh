import { IsEmail, IsNotEmpty } from 'class-validator';

export class signinDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

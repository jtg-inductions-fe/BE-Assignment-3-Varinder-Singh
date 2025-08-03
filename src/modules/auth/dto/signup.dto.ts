import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class signupDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(65)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsIn(['admin', 'seller', 'buyer'])
  role: 'admin' | 'seller' | 'buyer';
}

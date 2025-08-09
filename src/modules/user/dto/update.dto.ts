import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class updateDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(65)
  name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsIn(['admin', 'seller', 'buyer'])
  role?: 'admin' | 'seller' | 'buyer';

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}

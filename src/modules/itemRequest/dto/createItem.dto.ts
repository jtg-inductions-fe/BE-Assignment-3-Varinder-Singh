import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsString, Length, Min } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @Length(3, 65)
  name: string;

  @IsString()
  @Length(3, 300)
  description: string;

  @Type(() => Date)
  @IsDate()
  start_time: Date;

  @Type(() => Date)
  @IsDate()
  end_time: Date;

  @IsString()
  @IsIn(['refurbished', 'new', 'pre-owned'])
  status: 'refurbished' | 'new' | 'pre-owned';

  @IsInt()
  @Min(0)
  age_of_item: number;

  @IsInt()
  @Min(0)
  no_of_items: number;

  @IsInt()
  @Min(0)
  max_price: number;
}

import { IsString, IsNotEmpty } from 'class-validator';

export class ItemDto {
  @IsString()
  @IsNotEmpty()
  item: string;
}

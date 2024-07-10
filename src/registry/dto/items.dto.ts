import { IsArray, ArrayNotEmpty, ArrayUnique, IsString } from 'class-validator';

export class ItemsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  items: string[];
}

import { IsString, IsNumber, IsObject, IsDefined } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  bedrooms: number;

  @IsNumber()
  bathrooms: number;

  @IsNumber()
  area: number;

  @IsDefined()
  @IsObject()
  location: {
    latitude: number;
    longitude: number;
  };
}

import { IsOptional, IsString, Length } from "class-validator";

export class CreateFarmDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  phone?: string;
} 
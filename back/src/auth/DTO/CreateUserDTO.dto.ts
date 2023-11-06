import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsEmail,
} from 'class-validator';

export class CreateUserDTO {

	@IsString({
		message: "Email must be a string"
	})
	@IsNotEmpty({
		message: "Email cannot be empty"
	})
	@IsEmail()
	@ApiProperty()
	email: string;

	@IsString({
		message: "Password must be a string"
	})
	@IsNotEmpty({
		message: "Password cannot be empty"
	})
	@MinLength(5, {
		message: "Password is too short"
	})
	@IsOptional()
	@ApiProperty()
	password: string;

	@IsString()
	@IsOptional()
	oathlink: string;

	@IsString()
	@IsOptional()
	xviilink: string;
}

// export class CreateArticleDto {
//   @IsString()
//   @IsNotEmpty()
//   @MinLength(5)
//   @ApiProperty()
//   title: string;

//   @IsString()
//   @IsOptional()
//   @IsNotEmpty()
//   @MaxLength(300)
//   @ApiProperty({ required: false })
//   description?: string;

//   @IsString()
//   @IsNotEmpty()
//   @ApiProperty()
//   body: string;

//   @IsBoolean()
//   @IsOptional()
//   @ApiProperty({ required: false, default: false })
//   published?: boolean = false;
// }
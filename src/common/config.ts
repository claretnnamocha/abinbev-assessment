import { Transform, plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validate,
} from 'class-validator';

class Config {
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsString()
  DB_URL: string;

  @IsNotEmpty()
  @IsString()
  NODE_ENV: string;

  @IsNotEmpty()
  @IsEmail()
  EMAIL_FROM: string;

  @IsNotEmpty()
  @IsString()
  EMAIL_NAME: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  SMTP_HOST: string;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsNumber()
  SMTP_PORT: number;

  @IsOptional()
  @IsString()
  SMTP_USER: string;

  @IsOptional()
  @IsString()
  SMTP_PASSWORD: string;

  @Transform(({ value }) => JSON.parse(value))
  @IsOptional()
  @IsBoolean()
  SMTP_SECURE = false;
}

export let config: Config;

export const setupConfig = async () => {
  config = plainToInstance(Config, process.env);

  const [error] = await validate(config, { whitelist: true });
  if (error) return error;
};

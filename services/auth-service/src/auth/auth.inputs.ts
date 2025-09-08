import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength, IsOptional, IsString } from 'class-validator';
@InputType()
export class RegisterInput {
  @Field() @IsEmail() email!: string;
  @Field() @MinLength(6) password!: string;
  @Field({ nullable: true }) @IsOptional() @IsString() name?: string;
}
@InputType()
export class LoginInput {
  @Field() @IsEmail() email!: string;
  @Field() @MinLength(6) password!: string;
}

import { ObjectType, Field } from '@nestjs/graphql';
@ObjectType()
export class AuthPayload {
  @Field() accessToken!: string;
  @Field() userId!: string;
  @Field(() => [String]) roles!: string[];
}

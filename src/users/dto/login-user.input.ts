import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginUserInput {
  @Field({nullable: false})
  email: string;

  @Field({nullable: false})
  password: string;
}

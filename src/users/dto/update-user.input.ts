import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field({nullable: true, defaultValue: ''})
  social?: string;

  @Field({nullable: true})
  password?: string;

  @Field({nullable: true})
  firstName?: string;

  @Field({nullable: true})
  lastName?: string;

  @Field({nullable: true})
  displayName?: string;

  @Field({nullable: true})
  phone?: string;

  @Field({nullable: true})
  salt?: string;

  @Field(() => ID, {nullable: true})
  avatar?: string;
}

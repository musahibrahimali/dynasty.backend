import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateAdminInput {
  @Field({nullable: false})
  email: string;

  @Field({nullable: true})
  password: string;

  @Field({nullable: false})
  firstName: string;

  @Field({nullable: false})
  lastName: string;

  @Field({nullable: true})
  displayName?: string;

  @Field({nullable: true})
  phone?: string;

  @Field({nullable: true})
  salt?: string;

  @Field(() => ID, {nullable: true})
  avatar?: string;

  @Field(() => [String], {nullable: true, defaultValue: ['user', 'admin']})
  roles?: string[];

  @Field({nullable: true, defaultValue: true})
  isAdmin?: boolean;
}

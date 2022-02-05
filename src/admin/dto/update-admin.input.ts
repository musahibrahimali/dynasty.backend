import { CreateAdminInput } from './create-admin.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateAdminInput extends PartialType(CreateAdminInput) {
  @Field({nullable: true})
  email?: string;

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

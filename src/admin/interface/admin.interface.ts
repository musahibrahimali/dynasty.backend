import { Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class IAdmin {
  @Field(() => ID)
    _id: string;

    @Field({ nullable: true })
    social?: string;

    @Field()
    email: string;

    @Field({nullable: true})
    password?: string;

    @Field({nullable: false})
    firstName: string;

    @Field({nullable: false})
    lastName: string;

    @Field({nullable: false})
    displayName: string;

    @Field({nullable: true})
    phone?: string;

    @Field({nullable: true})
    avatar?: string;

    @Field({nullable: true})
    salt?: string;

    @Field(() => [String], {nullable: true, defaultValue: ['user', 'admin']})
    roles?: string[];

    @Field({nullable: true, defaultValue: true})
    isAdmin?: boolean;

    @Field({nullable: true})
    createdAt?: Date;

    @Field({nullable: true})
    updatedAt?: Date;
}
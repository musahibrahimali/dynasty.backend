import {ObjectType, Field, ID} from '@nestjs/graphql';
import {GraphQLJSONObject} from "graphql-type-json";


@ObjectType()
export class GProduct {
    @Field(() => ID)
    _id: string;

    @Field()
    name: string;

    @Field()
    description: string;

    @Field(() => GraphQLJSONObject)
    price: any;

    @Field(() => [String])
    images: string[];

    @Field()
    category: string;

    @Field()
    brand: string;

    @Field()
    rating: number;

    @Field()
    numReviews: number;

    @Field()
    numInStock: number;

    @Field(() => [String])
    colours: string[];

    @Field(() => [String])
    sizes: string[];

    @Field({nullable: true})
    createdAt?: Date;

    @Field({nullable: true})
    updatedAt?: Date;
}

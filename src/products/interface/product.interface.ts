import {Field, ID, InterfaceType} from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json'

@InterfaceType()
export abstract class IProduct {
    @Field(() => ID)
    _id: string;

    @Field()
    name: string;

    @Field()
    description: string;

    @Field(() => GraphQLJSONObject)
    price: any;

    @Field()
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

    @Field()
    colours: string[];

    @Field()
    sizes: string[];

    @Field({nullable: true})
    createdAt?: Date;

    @Field({nullable: true})
    updatedAt?: Date;
}
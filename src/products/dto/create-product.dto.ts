import {InputType, Field} from '@nestjs/graphql';
import {GraphQLJSONObject} from "graphql-type-json";

@InputType()
export class CreateProductDto {

    @Field()
    name: string;

    @Field()
    description: string;

    // change the return type of this to any
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
}

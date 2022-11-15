import {CreateProductDto} from './create-product.dto';
import {InputType, Field, PartialType} from '@nestjs/graphql';
import {GraphQLJSONObject} from "graphql-type-json";

@InputType()
export class UpdateProductDto extends PartialType(CreateProductDto) {
    @Field({nullable: true})
    name?: string;

    @Field({nullable: true})
    description?: string;

    @Field(() => GraphQLJSONObject, {nullable: true})
    price: any;

    @Field(() => [String], {nullable: true})
    images?: string[];

    @Field({nullable: true})
    category?: string;

    @Field({nullable: true})
    brand?: string;

    @Field({nullable: true})
    rating?: number;

    @Field({nullable: true})
    numReviews?: number;

    @Field({nullable: true})
    numInStock?: number;

    @Field(() => [String], {nullable: true})
    colours?: string[];

    @Field(() => [String], {nullable: true})
    sizes?: string[];
}

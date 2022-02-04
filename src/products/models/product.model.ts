import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class GProduct {
    @Field(() => ID)
    _id: string;

    @Field()
        name: string;

    @Field()
        description: string;

    @Field()
        price: number;

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

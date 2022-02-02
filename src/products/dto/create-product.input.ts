import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {

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
}

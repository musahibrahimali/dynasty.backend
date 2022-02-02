import { CreateProductInput } from './create-product.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field({nullable: true})
    name?: string;

  @Field({nullable: true})
    description?: string;

  @Field({nullable: true})
    price?: number;

  @Field({nullable: true})
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

  @Field({nullable: true})
    colours?: string[];

  @Field({nullable: true})
    sizes?: string[];
}

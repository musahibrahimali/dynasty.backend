import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PubSub } from 'graphql-subscriptions';
import { GProduct } from './models/product.model';
import { IProduct } from './interface/product.interface';

// subscription handler
const pubSub = new PubSub();

@Resolver(() => GProduct)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  // create a new product item
  @Mutation(() => GProduct)
  async createProduct(@Args('createProductInput') createProductInput: CreateProductInput): Promise<IProduct> {
    const product = await this.productsService.create(createProductInput);
    // publish to the createProduct event
    pubSub.publish('createdProduct', { createdProduct: product });
    return product;
  }

  // find all products 
  @Query(() => [GProduct], { name: 'products' })
  async findAll(): Promise<IProduct[]> {
    return await this.productsService.findAll();
  }

  // find products by category
  @Query(() => [GProduct], { name: 'productsByCategory' })
  async findByCategory(@Args('category', { type: () => String }) category: string): Promise<IProduct[]> {
    return await this.productsService.findByCategory(category);
  }

  // find product by brand
  @Query(() => [GProduct], { name: 'productsByBrand' })
  async findByBrand(@Args('brand', { type: () => String }) brand: string): Promise<IProduct[]> {
    return await this.productsService.findByBrand(brand);
  }

  // find one product
  @Query(() => GProduct, { name: 'product' })
  async findOne(@Args('id', { type: () => String }) id: string): Promise<IProduct> {
    return await this.productsService.findOne(id);
  }

  // update a product
  @Mutation(() => GProduct)
  async updateProduct(@Args('id') id: string, @Args('updateProductInput') updateProductInput: UpdateProductInput): Promise<IProduct> {
    const product = await this.productsService.update(id, updateProductInput);
    // publish to the updateProduct event
    pubSub.publish('updateProduct', { updatedProduct: product });
    return product;
  }

  // remove product
  @Mutation(() => GProduct)
  async removeProduct(@Args('id', { type: () => String }) id: string):Promise<boolean> {
    const isRemoved = await this.productsService.remove(id);
    // publish to the removeProduct event
    pubSub.publish('removeProduct', { removedProduct: id });
    return isRemoved;
  }
}

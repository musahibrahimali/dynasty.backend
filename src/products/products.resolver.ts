import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PubSub } from 'graphql-subscriptions';
import { GProduct } from './models/product.model';
import { IProduct } from './interface/product.interface';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { GqlAuthGuard } from '@common';
import { AccessGuard, Actions, UseAbility } from 'nest-casl';
import { UseGuards } from '@nestjs/common';
import { GAdmin } from '@admin/models/admin.model';
import { GUser } from '@users/models/user.model';

// subscription handler
const pubSub = new PubSub();

@Resolver(() => GProduct)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  // create a new product item
  @Mutation(() => GProduct)
  @UseAbility(Actions.manage, GAdmin)
  @UseAbility(Actions.read, GUser)
  async createProduct(
      @Args({ name: 'images', type: () => [GraphQLUpload] }) images: FileUpload[],
      @Args('createProductInput') createProductInput: CreateProductDto
  ): Promise<IProduct> {
    const product = await this.productsService.create(createProductInput, images);
    // publish to the createProduct event
    await pubSub.publish('createdProduct', {createdProduct: product});
    return product;
  }

  // find all products 
  @Query(() => [GProduct], { name: 'products' })
  // @UseGuards(GqlAuthGuard, AccessGuard)
  // @UseAbility(Actions.manage, GAdmin)
  // @UseAbility(Actions.read, GUser)
  async findAll(): Promise<IProduct[]> {
    return await this.productsService.findAll();
  }

  // find products by category
  @Query(() => [GProduct], { name: 'productsByCategory' })
  @UseAbility(Actions.manage, GAdmin)
  @UseAbility(Actions.read, GUser)
  async findByCategory(
      @Args('category', { type: () => String }) category: string
  ): Promise<IProduct[]> {
    return await this.productsService.findByCategory(category);
  }

  // find product by brand
  @Query(() => [GProduct], { name: 'productsByBrand' })
  @UseAbility(Actions.manage, GAdmin)
  @UseAbility(Actions.read, GUser)
  async findByBrand(
      @Args('brand', { type: () => String }) brand: string
  ): Promise<IProduct[]> {
    return await this.productsService.findByBrand(brand);
  }

  // find one product
  @Query(() => GProduct, { name: 'product' })
  @UseAbility(Actions.manage, GAdmin)
  @UseAbility(Actions.read, GUser)
  async findOne(
      @Args('id', { type: () => String }) id: string
  ): Promise<IProduct> {
    return await this.productsService.findOne(id);
  }

  // update a product
  @Mutation(() => GProduct)
  @UseAbility(Actions.manage, GAdmin)
  @UseAbility(Actions.read, GUser)
  async updateProduct(
      @Args({ name: 'images', type: () => [GraphQLUpload] }) images: FileUpload[],
      @Args('id') id: string, @Args('updateProductInput') updateProductInput: UpdateProductDto
  ): Promise<IProduct> {
    const product = await this.productsService.update(id, updateProductInput, images);
    // publish to the updateProduct event
    await pubSub.publish('updateProduct', {updatedProduct: product});
    return product;
  }

  // remove product
  @Mutation(() => GProduct)
  @UseAbility(Actions.manage, GAdmin)
  @UseAbility(Actions.read, GUser)
  async removeProduct(
      @Args('id', { type: () => String }) id: string
  ):Promise<boolean> {
    const isRemoved = await this.productsService.remove(id);
    // publish to the removeProduct event
    await pubSub.publish('removeProduct', {removedProduct: id});
    return isRemoved;
  }
}

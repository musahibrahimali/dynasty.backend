import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { IProduct } from './interface/product.interface';
import { Product, ProductsModel } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductsModel>,
  ) {}
  async create(createProductInput: CreateProductInput):Promise<IProduct> {
    // create a new product item
    const product = await this.productModel.create(createProductInput);  
    return await product.save();
  }

  // find all products
  async findAll():Promise<IProduct[]> {
    const products = await this.productModel.find();
    return products;
  }

  // find products by category
  async findByCategory(category: string):Promise<IProduct[]> {
    const products = await this.productModel.find({category: category});
    return products;
  }

  // find products by brand
  async findByBrand(brand: string):Promise<IProduct[]> {
    const products = await this.productModel.find({brand: brand});
    return products;
  }

  // find one product
  async findOne(id: string):Promise<IProduct> {
    const product = await this.productModel.findOne({_id: id});
    return product;
  }

  // update a product
  async update(id: string, updateProductInput: UpdateProductInput):Promise<IProduct> {
    // find the product and update it
    const product = await this.productModel.findOneAndUpdate({_id: id}, updateProductInput, {new: true});
    return product;
  }

  // delete a product
  async remove(id: string):Promise<boolean> {
    // find and delete the product by id
    const product = await this.productModel.findOneAndRemove({_id: id});
    return product ? true : false;
  }
}

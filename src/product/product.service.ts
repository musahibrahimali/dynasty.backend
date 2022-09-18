/*
* ########################################################
* ################## IMPORTS #############################
* ########################################################
* */

import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Product, ProductsModel} from "./schemas/product.schema";
import {CreateProductDto, UpdateProductDto} from "./dto";
import {IProduct} from "../common";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductsModel>,
  ) {}
  async addProduct(createProductInput: CreateProductDto, images: any[]): Promise<IProduct> {
    // get all the names of the images
    // update the createProductInput with the image names
    createProductInput.images = images.map(image => image.filename);
    // create a new product item
    const product = await this.productModel.create(createProductInput);
    // save and return the saved product
    return await product.save();
  }

  // find all product
  async getProducts():Promise<IProduct[]> {
    return this.productModel.find();
  }

  // find product by category
  async getByCategory(category: string):Promise<IProduct[]> {
    return await this.productModel.find({category: category});
  }

  // find product by brand
  async getByBrand(brand: string):Promise<IProduct[]> {
    return await this.productModel.find({brand: brand});
  }

  // find one product
  async getProduct(id: string):Promise<IProduct> {
    return await this.productModel.findOne({_id: id});
  }

  // update a product
  async updateProduct(id: string, updateProductInput: UpdateProductDto, images: any[]):Promise<IProduct> {
    try{
      // check if the product exists
      const prod = await this.productModel.findOne({_id: id});
      if(!prod){
        return null;
      }
      // check if images array is not empty
      if(images.length > 0){
        // get the image names
        // append the image names to the updateProductInput
        updateProductInput.images = images.map(image => image.filename);
        // upload the images
        // await Promise.all(images.map(image => this.uploadImage(image, updateProductInput.category)));
      }
      // find the product and update it
      return await this.productModel.findOneAndUpdate({_id: id}, updateProductInput, {new: true});
    }catch(error){
      return error;
    }
  }

  // delete a product
  async deleteProduct(id: string): Promise<boolean> {
    try{
      const prod = await this.productModel.findOne({_id: id});
      if(!prod){
        return false;
      }
      // find and delete the product by id
      const product = await this.productModel.findOneAndRemove({_id: id});
      return !!product;
    }catch(error){
      return error;
    }
  }
}

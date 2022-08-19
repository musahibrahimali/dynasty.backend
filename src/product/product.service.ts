/*
* ########################################################
* ################## IMPORTS #############################
* ########################################################
* */

import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import {Product, ProductsModel} from "@product/schemas/product.schema";
import {CreateProductDto} from "@product/dto/create-product.dto";
import {IProduct} from "@common/interface/interface";
import {UpdateProductDto} from "@product/dto/update-product.dto";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductsModel>,
    private configService: ConfigService,
  ) {}
  async create(createProductInput: CreateProductDto, images: any[]): Promise<IProduct> {
    // get all the names of the images
    // update the createProductInput with the image names
    createProductInput.images = images.map(image => image.filename);
    // upload the images
    const uploadImages = await Promise.all(images.map(image => this.uploadImage(image, createProductInput.category)));
    if(uploadImages){
      // create a new product item
      const product = await this.productModel.create(createProductInput);  
      // save and return the saved product
      return await product.save();
    }
    return null;
  }

  // find all product
  async findAll():Promise<IProduct[]> {
    return this.productModel.find();
  }

  // find product by category
  async findByCategory(category: string):Promise<IProduct[]> {
    return await this.productModel.find({category: category});
  }

  // find product by brand
  async findByBrand(brand: string):Promise<IProduct[]> {
    return await this.productModel.find({brand: brand});
  }

  // find one product
  async findOne(id: string):Promise<IProduct> {
    return await this.productModel.findOne({_id: id});
  }

  // update a product
  async update(id: string, updateProductInput: UpdateProductDto, images: any[]):Promise<IProduct> {
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
        await Promise.all(images.map(image => this.uploadImage(image, updateProductInput.category)));
      }
      // find the product and update it
      return await this.productModel.findOneAndUpdate({_id: id}, updateProductInput, {new: true});
    }catch(error){
      return error;
    }
  }

  // delete a product
  async remove(id: string): Promise<boolean> {
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

  // upload images
  private async uploadImage(image: any, category: string): Promise<boolean> {
    try{
      const { filename, createReadStream } = image;
      const stream = createReadStream();
      const chunks = [];
      await new Promise<Buffer>((resolve, reject) => {
          let buffer: Buffer;
          stream.on('data', function (chunk) {
            chunks.push(chunk);
          });
          stream.on('end', function () {
            buffer = Buffer.concat(chunks);
            resolve(buffer);
          });
          stream.on('error', reject);
        });
        const buffer = Buffer.concat(chunks);
        const uploadsDir = await this.configService.get('UPLOADS_DIR');
        const folderPath = path.join(__dirname, `${uploadsDir}/images/products/${category}`);
        if(!fs.existsSync(folderPath)){
          fs.mkdirSync(folderPath, {recursive: true});
        }
        // write the file to the folder
        fs.writeFile(`${folderPath}/${filename}`, buffer, (error:any) => {
          if(error){
            return error;
          }
        });
      return true;
    }catch(error){
      return error;
    }
  }

  // read all images
  async readImages():Promise<string[] | any> {
    console.log("done");
  }

}

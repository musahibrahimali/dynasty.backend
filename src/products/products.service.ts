import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { FileUpload } from 'graphql-upload';
import { Model } from 'mongoose';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { IProduct } from './interface/product.interface';
import { Product, ProductsModel } from './schemas/product.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductsModel>,
    private configService: ConfigService,
  ) {}
  async create(createProductInput: CreateProductInput, images: FileUpload[]): Promise<IProduct> {
    // get all the names of the images
    const imageNames = images.map(image => image.filename);
    // update the createProductInput with the image names
    createProductInput.images = imageNames;
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
  async update(id: string, updateProductInput: UpdateProductInput, images: FileUpload[]):Promise<IProduct> {
    try{
      // check if the product exists
      const prod = await this.productModel.findOne({_id: id});
      if(!prod){
        return null;
      }
      // check if images array is not empty
      if(images.length > 0){
        // get the image names
        const imageNames = images.map(image => image.filename);
        // append the image names to the updateProductInput
        updateProductInput.images = imageNames;
        // upload the images
        await Promise.all(images.map(image => this.uploadImage(image, updateProductInput.category)));
      }
      // find the product and update it
      const product = await this.productModel.findOneAndUpdate({_id: id}, updateProductInput, {new: true});
      return product;
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
      return product ? true : false;
    }catch(error){
      return error;
    }
  }

  // upload images
  private async uploadImage(image: FileUpload, category: string): Promise<boolean> {
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

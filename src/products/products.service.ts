import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InjectModel} from '@nestjs/mongoose';
import {FileUpload} from 'graphql-upload';
import {Model} from 'mongoose';
import {CreateProductDto} from './dto/create-product.dto';
import {UpdateProductDto} from './dto/update-product.dto';
import {IProduct} from './interface/product.interface';
import {Product, ProductsModel} from './schemas/product.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductsModel>,
    private configService: ConfigService,
  ) {}
  async create(createProductInput: CreateProductDto, images: FileUpload[]): Promise<IProduct> {
    try{
      // if images is not empty or null
        if(images.length > 0){
          // upload the images
          const uploadImages = await Promise.all(images.map((image) => {
            return this.uploadImage(image, createProductInput.category);
          }));
          if(uploadImages){
            // replace the images array with the image names
            createProductInput.images = uploadImages;
            // create a new product item
            const product = await this.productModel.create(createProductInput);
            // save and return the saved product
            return await product.save();
          }
        }else{
          // just create the product without images
            const product = await this.productModel.create(createProductInput);
            // save and return the saved product
            return await product.save();
        }
    }catch (error){
        return error;
    }
  }

  // find all products
  async findAll():Promise<IProduct[]> {
    try{
      // get all products
      const _allProducts = await this.productModel.find();
      // get all the images of each product
      return await Promise.all(_allProducts.map(async (product) => {
        product.images = await Promise.all(product.images.map(async (image) => {
          return await this.readImages(image, product.category);
        }));
        return product;
      }));
    }catch (e) {
        return e;
    }
  }

  // find products by category
  async findByCategory(category: string):Promise<IProduct[]> {
    try {
      // find all products by category
        const _allCategoryProducts = await this.productModel.find({category: category});
        // get all the images of each product
        return await Promise.all(_allCategoryProducts.map(async (product) => {
            product.images = await Promise.all(product.images.map(async (image) => {
                return await this.readImages(image, product.category);
            }));
            return product;
        }));
    }catch (e) {
        return e;
    }
  }

  // find products by brand
  async findByBrand(brand: string):Promise<IProduct[]> {
    try {
      // find all products of the same brand
      const _allBrandProducts = await this.productModel.find({brand: brand});
      // get all the images of each product
        return await Promise.all(_allBrandProducts.map(async (product) => {
            product.images = await Promise.all(product.images.map(async (image) => {
                return await this.readImages(image, product.category);
            }));
            return product;
        }));
    }catch (e) {
        return e;
    }
  }

  // find one product
  async findOne(id: string):Promise<IProduct> {
    try {
      // find one product
      const _product = await this.productModel.findOne({_id: id});
      // get all the images of the product
        _product.images = await Promise.all(_product.images.map(async (image) => {
            return await this.readImages(image, _product.category);
        }));
        return _product;
    }catch (e) {
        return e;
    }
  }

  // update a product
  async update(id: string, updateProductInput: UpdateProductDto, images: FileUpload[]):Promise<IProduct> {
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
  private async uploadImage(image: FileUpload, category: string): Promise<string> {
    try{
      // resolve the image from promise
        const {createReadStream, filename} = await image;
        // split and get the file extension
        const _fileExtension = filename.split('.').pop();
      const stream = createReadStream();
      const chunks = [];
      await new Promise<Buffer>((resolve, reject) => {
          let buffer: Buffer;
          stream.on('data', function (chunk) {
            // console.log("data chunk ::::::>>>>> ", chunk);
            chunks.push(chunk);
          });
          stream.on('end', function () {
            buffer = Buffer.concat(chunks);
            resolve(buffer);
          });
          stream.on('error', reject);
        });
        const buffer = Buffer.concat(chunks);
        const uploadsDir = await this.configService.get<string>('UPLOADS_DIR');
        // console.log("the uploads dir is ::::>>>>>>", uploadsDir);
        const folderPath = path.join(__dirname, `${uploadsDir}/images/products/${category}`);
        if(!fs.existsSync(folderPath)){
          fs.mkdirSync(folderPath, {recursive: true});
        }
        const _fileNameWithoutSpaces = await this.constructFileName(filename);
        const __fileName = `${_fileNameWithoutSpaces}.${_fileExtension}`;
        // write the file to the folder
        fs.writeFile(`${folderPath}/${__fileName}`, buffer, (error:any) => {
          if(error){
            console.log(error);
            return error;
          }
        });
      return __fileName;
    }catch(error){
      return error;
    }
  }

  // read all images
  private async readImages(image:string, category: string):Promise<string[] | any> {
    try{
      // get the uploads dir
        const uploadsDir = await this.configService.get<string>('UPLOADS_DIR');
        // get the folder path
        const folderPath = path.join(__dirname, `${uploadsDir}/images/products/${category}`);
        // read the folder
        const files = fs.readdirSync(folderPath);
        // check if the image exists in the folder
        if(files.includes(image)){
            // return `${folderPath}/${image}`;
            return `${this.configService.get<string>('BACKEND_URL')}/images/products/${category}/${image}`;
        }else{
          return undefined;
        }
    }catch (e) {
        return e;
    }
  }

  private async constructFileName(filename: string): Promise<string> {
    try{
      // get the current year, month and day and time with hours and minutes
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const _fileName = filename.split('.').slice(0, -1).join('.');
      // replace all " " in _fileName
      const _fileNameWithoutSpaces = _fileName.replace(/ /g, '-');
      // console.log(`file name without spaces is ::::>>>>>> ${_fileNameWithoutSpaces}`);
      // construct the file name
      return `${year}-${month}-${day}-${hours}-${minutes}-${_fileNameWithoutSpaces}`;
    }catch(error){
      return error;
    }
  }

}

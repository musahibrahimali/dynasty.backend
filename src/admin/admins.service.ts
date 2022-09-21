import {Injectable} from '@nestjs/common';
import {CreateAdminInput} from './dto/create-admin.input';
import {UpdateAdminInput} from './dto/update-admin.input';
import {Admin, AdminsModel} from './schema/admin.schema';
import {Model} from 'mongoose';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {comparePassword, Ctx, generateSalt, hashPassword} from '@common';
import {InjectModel} from '@nestjs/mongoose';
import {LoginAdminInput} from './dto/login-admin.input';
import {FileUpload} from 'graphql-upload';
import * as fs from 'fs';
import * as path from 'path';
import {IAdmin} from './interface/admin.interface';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private readonly adminsModel: Model<AdminsModel>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // create a new admin
  async create(createAdminInput: CreateAdminInput, context:Ctx): Promise<IAdmin> {
    try{
      createAdminInput.displayName = createAdminInput.firstName + ' ' + createAdminInput.lastName;
      // generate salt 
      const salt = await generateSalt();
      // add the salt to the dto
      createAdminInput.salt = salt;
      // hash password
      // add the hashed password to the dto
      createAdminInput.password = await hashPassword(createAdminInput.password, salt);
      const admin = await this.adminsModel.create(createAdminInput);
      // save user to database
      const _admin = await admin.save();
      if(admin._id){
        // generate a token
        const payload = { sub: admin._id, username: admin.email };
        const token = this.jwtService.sign(payload);
        const domain = this.configService.get('DOMAIN');
        // set cookie to response
        context.res.cookie('access_token', token, {
          domain: domain,
          httpOnly: true,
          secure: false, // set to true in production
        });
      }
      return _admin;
    }catch(error){
      return error;
    }
  }

  // login admin
  async login(loginUserInput:LoginAdminInput, context: Ctx): Promise<IAdmin> {
    const email = loginUserInput.email;
    const password = loginUserInput.password;
    const admin = await this.adminsModel.findOne({ email });
    if(!admin){
      return undefined;
    }
    // compare password
    const isMatch = await comparePassword(password, admin.password);
    if(isMatch){
      // generate a token
      const payload = { sub: admin._id, username: admin.email };
      const token = this.jwtService.sign(payload);
      const domain = this.configService.get('DOMAIN');
      // set the cookie to the response
      context.res.cookie('access_token', token, {
          domain: domain,
          httpOnly: true,
          secure: false, // set to true in production
      });
    }else{
      return undefined;
    }
    return admin;
  }

  // find a admin by id
  async findOne(id: string): Promise<IAdmin> {
    return this.adminsModel.findOne({_id: id});
  }

  // validate jwt admin
  async validateUser(payload: any): Promise<IAdmin> {
    return this.adminsModel.findOne({_id: payload.sub});
  }

  // update user
  async update(id: string, updateAdminInput: UpdateAdminInput): Promise<IAdmin> {
    // find and update user
    return this.adminsModel.findByIdAndUpdate(id, updateAdminInput, {new: true});
  }

  // update user avatar
  async updateAvatar(id: string, avatar: FileUpload): Promise<IAdmin> {
    try{
      const { createReadStream, filename } = avatar;
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
      const folderPath = path.join(__dirname, `${uploadsDir}/images/avatars`);
      if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath, {recursive: true});
      }
      // write the file to the folder
      fs.writeFile(`${folderPath}/${filename}`, buffer, (error:any) => {
        if(error){
          return error;
        }
      });
      // find and update the admin avatar string
      const admin = await this.adminsModel.findOne({ _id: id });
      // set the avatar to the new avatar string
      admin.avatar = filename;
      return admin;
    }catch(error){
      return error;
    }
  }

  // logout admin
  async logout(context:Ctx): Promise<boolean> {
    // set the cookie age to 0 on the response
    context.res.cookie('access_token', '', {
      httpOnly: true,
      maxAge: 0,
    });
    return true;
  }

  // delete user
  async remove(id: string): Promise<boolean> {
    // delete user
    const result = await this.adminsModel.findByIdAndRemove(id);
    return !!result;
  }
}

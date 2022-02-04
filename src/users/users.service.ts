import { Injectable } from '@nestjs/common';
import { generateSalt } from 'src/common/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { hashPassword, comparePassword } from 'src/common/functions/common.function';
import { Model } from 'mongoose';
import { User, UsersModel } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { LoginUserInput } from './dto/login-user.input';
import { InjectModel } from '@nestjs/mongoose';
import {Ctx} from 'src/common/common';
import { ConfigService } from '@nestjs/config';
import { FileUpload } from 'graphql-upload';
import * as fs from 'fs';
import * as path from 'path';
import { IUser } from './interface/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<UsersModel>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // create a new user
  async create(createUserInput: CreateUserInput, context:Ctx): Promise<IUser> {
    try{
      createUserInput.displayName = createUserInput.firstName + ' ' + createUserInput.lastName;
      // generate salt 
      const salt = await generateSalt();
      // add the salt to the dto
      createUserInput.salt = salt;
      // hash password
      const hassedPassword = await hashPassword(createUserInput.password, salt);
      // add the hassed password to the dto
      createUserInput.password = hassedPassword;
      const user = await this.usersModel.create(createUserInput);
      // save user to database
      const _user = await user.save();
      if(user._id){
        // generate a token
        const payload = { sub: user._id, username: user.email };
        const token = this.jwtService.sign(payload);
        const domain = this.configService.get('DOMAIN');
        // set cookie to response
        context.res.cookie('access_token', token, {
          domain: domain,
          httpOnly: true,
          secure: false, // set to true in production
        });
      }
      return _user;
    }catch(error){
      return error;
    }
  }

  // login user
  async login(loginUserInput:LoginUserInput, context: Ctx): Promise<IUser> {
    const email = loginUserInput.email;
    const password = loginUserInput.password;
    const user = await this.usersModel.findOne({ email });
    if(!user){
      return undefined;
    }
    // compare password
    const isMatch = await comparePassword(password, user.password);
    if(isMatch){
      // generate a token
      const payload = { sub: user._id, username: user.email };
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
    return user;
  }

  // validate social user
  async validateSocialUser(socialId: string, user: CreateUserInput): Promise<IUser> {
    // check if user already exists in our db, if not create a new user
    const _user = await this.usersModel.findOne({socialId});
    if(!_user){
      // create a new user
      const newUser = await this.usersModel.create(user);
      return newUser.save();
    }
    return _user;
  }

  // find a user by id
  async findOne(id: string): Promise<IUser> {
    const user = await this.usersModel.findOne({_id: id});
    return user;
  }

  // validate jwt user
  async validateUser(payload: any): Promise<User> {
    const user = await this.usersModel.findOne({ _id: payload.sub });
    return user;
  }

  // update user
  async update(id: string, updateUserInput: UpdateUserInput): Promise<IUser> {
    // find and update user
    const user = await this.usersModel.findByIdAndUpdate(id, updateUserInput, { new: true });
    return user;
  }

  // update user avatar
  async updateAvatar(id: string, avatar: FileUpload): Promise<IUser> {
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
      // find and update the user avatar string
      const user = await this.usersModel.findOne({ _id: id });
      // set the avatar to the new avatar string
      user.avatar = filename;
      return user;
    }catch(error){
      return error;
    }
  }

  // logout user
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
    const result = await this.usersModel.findByIdAndRemove(id);
    return result ? true : false;
  }
}

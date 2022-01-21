import { Injectable } from '@nestjs/common';
import { CreateAdminInput } from './dto/create-admin.input';
import { UpdateAdminInput } from './dto/update-admin.input';
import { Admin, AdminsModel } from './schema/admin.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {Ctx} from 'src/types/types';
import { GAdmin } from './models/admin.model';
import { InjectModel } from '@nestjs/mongoose';
import { generateSalt } from 'src/common/common';
import { comparePassword, hashPassword } from 'src/common/functions/common.function';
import { LoginAdminInput } from './dto/login-admin.input';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private readonly adminsModel: Model<AdminsModel>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // create a new admin
  async create(createAdminInput: CreateAdminInput, context:Ctx): Promise<GAdmin> {
    try{
      createAdminInput.displayName = createAdminInput.firstName + ' ' + createAdminInput.lastName;
      // generate salt 
      const salt = await generateSalt();
      // add the salt to the dto
      createAdminInput.salt = salt;
      // hash password
      const hassedPassword = await hashPassword(createAdminInput.password, salt);
      // add the hassed password to the dto
      createAdminInput.password = hassedPassword;
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
  async login(loginUserInput:LoginAdminInput, context: Ctx): Promise<GAdmin> {
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
  async findOne(id: string): Promise<GAdmin> {
    const admin = await this.adminsModel.findOne({_id: id});
    return admin;
  }

  // validate jwt admin
  async validateUser(payload: any): Promise<GAdmin> {
    const admin = await this.adminsModel.findOne({ _id: payload.sub });
    return admin;
  }

  // update user
  async update(id: string, updateAdminInput: UpdateAdminInput): Promise<GAdmin> {
    // find and update user
    const admin = await this.adminsModel.findByIdAndUpdate(id, updateAdminInput, { new: true });
    return admin;
  }

  // update admin avatar
  async updateAvatar(id: string, avatar: string): Promise<GAdmin> {
    // find and update user
    const admin = await this.adminsModel.findOne({ _id: id });
    // set the avatar to the new avatar string
    admin.avatar = avatar;
    return admin;
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
    return result ? true : false;
  }
}

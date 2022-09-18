import {Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import {InjectModel} from '@nestjs/mongoose';
import * as fs from 'fs';
import * as path from 'path';
import {Admin, AdminModel} from "./schema/admin.schema";
import {CreateAdminDto, LoginAdminDto, UpdateAdminDto} from "./dto";
import {comparePassword, generateSalt, hashPassword, IAdmin} from "../common";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminModel>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /*
   * ########################################################################
   * ########################### REGISTER ADMIN #############################
   * ########################################################################
   * */
  async registerAdmin(createAdminDto: CreateAdminDto): Promise<string> {
    try{
      // generate salt 
      const salt = await generateSalt();
      // add the salt to the dto
      createAdminDto.salt = salt;
      // hash password
      // add the hashed password to the dto
      createAdminDto.password = await hashPassword(createAdminDto.password, salt);
      const admin = await this.adminModel.create(createAdminDto);
      // save user to database
      const _admin = await admin.save();
      if(_admin._id){
        // generate a token
        const payload = { sub: admin._id, username: admin.email };
        return this.jwtService.sign(payload);
      }
    }catch(error){
      return error;
    }
  }

  /*
   * ########################################################################
   * ################################ LOGIN ADMIN ###########################
   * ########################################################################
   * */
  async loginAdmin(loginAdminDto:LoginAdminDto): Promise<string> {
    const email = loginAdminDto.email;
    const password = loginAdminDto.password;
    const admin = await this.adminModel.findOne({ email });
    if(!admin){
      return undefined;
    }
    // compare password
    const isMatch = await comparePassword(password, admin.password);
    if(isMatch){
      // generate a token
      const payload = { sub: admin._id, username: admin.email };
      return this.jwtService.sign(payload);
    }
  }

  /*
   * ########################################################################
   * ########################### GET ADMIN PROFILE ##########################
   * ########################################################################
   * */
  async getAdminProfile(id: string): Promise<IAdmin> {
    return this.adminModel.findOne({_id: id});
  }

  /*
   * ########################################################################
   * ########################### VALIDATE ADMIN #############################
   * ########################################################################
   * */
  async validateAdmin(payload: any): Promise<IAdmin> {
    return this.adminModel.findOne({_id: payload.sub});
  }

  /*
   * ########################################################################
   * ########################### UPDATE ADMIN ###############################
   * ########################################################################
   * */
  async updateAdmin(id: string, updateAdminDto: UpdateAdminDto): Promise<IAdmin> {
    // find and update user
    return this.adminModel.findByIdAndUpdate(id, updateAdminDto, {new: true});
  }

  /*
   * ########################################################################
   * ########################### UPDATE USER AVATAR #########################
   * ########################################################################
   * */
  async updateAdminAvatar(id: string, avatar: any): Promise<IAdmin> {
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
      const uploadsDir = await this.configService.get<string>('UPLOADS_DIR');
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
      const admin = await this.adminModel.findOne({ _id: id });
      // set the avatar to the new avatar string
      admin.avatar = filename;
      return admin;
    }catch(error){
      return error;
    }
  }

  /*
   * ########################################################################
   * ########################### DELETE USER ################################
   * ########################################################################
   * */
  async deleteAdmin(id: string): Promise<boolean> {
    // delete user
    const result = await this.adminModel.findByIdAndRemove(id);
    return !!result;
  }
}

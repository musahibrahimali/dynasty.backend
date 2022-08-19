/*
* ########################################################################
* ############################# IMPORTS ##################################
* ########################################################################
* */
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {User, UserModel} from "@user/schema/user.schema";
import {CreateUserDto} from "@user/dto/create-user.dto";
import {generateSalt, hashPassword, IUser, IUserError} from "@common/common";

@Injectable()
export class UserService {
  constructor(
      @InjectModel(User.name) private userModel: Model<UserModel>,
      private jwtService: JwtService,
  ){}

  /*
  * ########################################################################
  * ############################# REGISTER USER ############################
  * ########################################################################
  * */
  async registerUser(createUserDto: CreateUserDto): Promise<string> {
    try {
      // username should be the same as email
      createUserDto.username = createUserDto.email;
      const _client = await this.createUser(createUserDto);
      if(_client._id){
        const payload = { username: _client.username, sub: _client._id };
        return this.jwtService.sign(payload);
      }
    }catch(error){
      return error;
    }
  }

  /*
  * ########################################################################
  * ################################ LOGIN USER ############################
  * ########################################################################
  * */
  async loginUser(user: IUser): Promise<string>{
    try{
      const payload = { username: user.email, sub: user._id };
      const _user = await this.userModel.findOne({_id: user._id});
      if(_user) {
        return this.jwtService.sign(payload);
      }
    }catch(error){
      return error;
    }
  }

  /*
  * ########################################################################
  * ############################# GET ALL USER #############################
  * ########################################################################
  * */
  async getAllUsers(): Promise<IUser[]> {
    // get all user
    return await this.getAllUserProfiles();
  }

  /*
  * ########################################################################
  * ############################# UPDATE USER PROFILE ######################
  * ########################################################################
  * */
  async updateProfile(id: string, updateUserDto: CreateUserDto):Promise<IUser>{
    return this.updateUserProfile(id, updateUserDto);
  }

  /*
  * ########################################################################
  * ############################# GET USER PROFILE #########################
  * ########################################################################
  * */
  async getProfile(id: string): Promise<IUser>{
    const client = await this.getUserProfile(id);
    if(client === undefined) {
      return undefined;
    }
    return client;
  }

  // update profile picture
  /*
  * ########################################################################
  * ############################# UPDATE USER PICTURE ######################
  * ########################################################################
  * */
  async setNewProfilePicture(id: string, newPicture: string): Promise<IUser>{
    return await this.updateUserProfilePicture(id, newPicture);
  }

  // delete profile picture
  /*
  * ########################################################################
  * ############################# DELETE USER PICTURE ######################
  * ########################################################################
  * */
  async deleteProfilePicture(userId:string):Promise<boolean>{
    try{
      const _user = await this.userModel.findOne({_id: userId})
      // update the profile image
      const isDeleted = false // await this.deleteFile(_user.image);
      _user.save();
      return isDeleted;
    }catch(error){
      return false;
    }
  }

  /*
  * ########################################################################
  * ############################# DELETE USER ##############################
  * ########################################################################
  * */
  async deleteUserData(id:string): Promise<boolean>{
    // const user = await this.userModel.findOne({_id: id});
    // delete all images
    // await this.deleteFile(user.image);
    // find and delete the client
    const _user = await this.userModel.findOneAndDelete({_id: id});
    return !!_user;

  }

  /*
  * ########################################################################
  * ############################# VALIDATE USER ############################
  * ########################################################################
  * */
  async validateUser(createUserDto: CreateUserDto): Promise<IUser>{
    const user = await this.findOne( createUserDto.email, createUserDto.password);
    if(!user) {
      return undefined;
    }
    return user;
  }

  /*
  * ########################################################################
  * ############################# VALIDATE SOCIAL USER #####################
  * ########################################################################
  * */
  async validateSocialUser(socialId: string, user:CreateUserDto): Promise<IUser | any>{
    const _user = await this.userModel.findOne({socialId: socialId});
    if(_user) {
      return _user;
    }
    return await this.userModel.create(user);
  }

  /*
  * ########################################################################
  * ############################# SIGN TOKEN ###############################
  * ########################################################################
  * */
  async signToken(user: IUser): Promise<string> {
    const payload = { username: user.username, sub: user._id };
    return this.jwtService.sign(payload);
  }


  /*
  * ########################################################################
  * ############################# PRIVATE METHODS ##########################
  * ########################################################################
  * */

  /*
  * ########################################################################
  * ############################# CREATE USER ##############################
  * ########################################################################
  * */
  private async createUser(createUserDto: CreateUserDto): Promise<IUser | IUserError | any> {
    try{
      const emailExist = await this.userModel.findOne({email: createUserDto.email});
      if (emailExist){
        return {
          status: "error",
          message: "Email already exists"
        }
      }

      // generate salt
      createUserDto.salt = await generateSalt();
      // hash the password
      // add the new password and salt to the dto
      createUserDto.password = await hashPassword(createUserDto.password, createUserDto.salt);
      // create a new user
      const createdClient = new this.userModel(createUserDto);
      return await createdClient.save();
    }catch(error){
      return {
        status: "Error",
        message: error.message
      }
    }
  }

  // find one client (user)
  /*
  * ########################################################################
  * ############################# FIND USER ################################
  * ########################################################################
  * */
  private async findOne(email: string, password:string): Promise<IUser | any> {
    try{
      const user = await this.userModel.findOne({username: email});
      if(!user) {
        return undefined;
      }
      // compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if(!isPasswordValid) {
        return null;
      }
      const defaultImage = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
      let profileImage: string;
      if(user.avatar === defaultImage){
        profileImage = defaultImage;
      }else if(user.social.length > 0) {
        profileImage = user.avatar;
      }else{
        // profileImage = await Promise.resolve(this.readStream(user.image));
      }
      return {
        ...user.toObject(),
        image: profileImage,
        password: "",
        salt: "",
        passwordResetKey: "",
      };
    }catch(err){
      return undefined;
    }
  }

  /*
  * ########################################################################
  * ######################### GET ALL USER PROFILES ########################
  * ########################################################################
  * */
  private async getAllUserProfiles(): Promise<IUser[] | any> {
    try{
      const users = await this.userModel.find().sort({createdAt: -1});
      return users.map(user => {
        const defaultImage = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
        let profileImage: string;
        if(user.avatar === defaultImage){
          profileImage = defaultImage;
        }else if(user.social.length > 0) {
          profileImage = user.avatar;
        }else{
          // profileImage = await Promise.resolve(this.readStream(user.image));
        }
        return {
          ...user.toObject(),
          image: profileImage,
          password: "",
          salt: "",
          passwordResetKey: "",
        };
      }).filter(user => user.isAdmin !== true);
    }catch(err){
      return undefined;
    }
  }

  /*
  * ########################################################################
  * ########################### GET USER PROFILE ###########################
  * ########################################################################
  * */
  private async getUserProfile(id: string): Promise<IUser | any> {
    try{
      const user = await this.userModel.findOne({_id: id});
      if(!user) {
        return undefined;
      }
      const defaultImage = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
      let profileImage: string;
      if(user.avatar === defaultImage){
        profileImage = defaultImage;
      }else if(user.social.length > 0){
        profileImage = user.avatar;
      }else{
        // profileImage = await Promise.resolve(this.readStream(user.image));
      }
      return {
        ...user.toObject(),
        avatar: profileImage,
        password: "",
        salt: "",
        passwordResetKey: "",
      };
    }catch(err){
      return undefined;
    }
  }

  /*
  * ########################################################################
  * ######################## UPDATE PROFILE PICTURE ########################
  * ########################################################################
  * */
  private async updateUserProfilePicture(id: string, picture: string): Promise<IUser | any>{
    const user = await this.userModel.findOne({_id: id});
    if(user.avatar === "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"){
      // update the client image to the new picture
      user.avatar = picture;
    }else{
      // delete the old picture from database
      // await this.deleteFile(user.image);
      // update the client image to the new picture
      user.avatar = picture;
    }
    // save to database
    const updatedUser = await user.save();
    return {
      ...updatedUser.toObject(),
      password: "",
      salt: "",
    };
  }

  // update profile
  /*
  * ########################################################################
  * ############################# UPDATE PROFILE ###########################
  * ########################################################################
  * */
  private async updateUserProfile(id: string, updateUserDto: CreateUserDto): Promise<IUser | IUserError | any>{
    // find and update the client
    const _user = await this.userModel.findOneAndUpdate({_id: id}, updateUserDto, {new: true});
    if(_user){
      return {
        ..._user.toObject(),
        password: "",
        salt: "",
        passwordResetKey: "",
      };
    }else{
      return {
        status: "Error",
        message: "no user matching this id"
      };
    }
  }

}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { Connection, Model } from 'mongoose';
import { User, UserModel } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { GridFSBucketReadStream } from 'mongodb';
import {IUser} from 'src/interface/interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    private fileModel: MongoGridFS;
    constructor(
        @InjectModel(User.name) private userModel:Model<UserModel>,
        private jwtService: JwtService,
        @InjectConnection() private readonly connection: Connection,
    ) {
        this.fileModel = new MongoGridFS(this.connection.db, 'userProfilePictures');
    }

    // register client
    async registerUser(createUserDto: CreateUserDto): Promise<string>{
        try{
            createUserDto.displayName = createUserDto.firstName + " " + createUserDto.lastName;
            const _user = await this.creaateUser(createUserDto);
            if(_user._id){
                const payload = { username: _user.email, sub: _user._id };
                return this.jwtService.sign(payload);
            }
        }catch(error){
            return error;
        }
    }

    // log in user
    async loginUser(user:IUser): Promise<string>{
        try{
            const payload = { username: user.email, sub: user._id };
            return this.jwtService.sign(payload);
        }catch(error){
            return error;
        }
    }

    // update client profile
    async updateProfile(id: string, updateClientDto: CreateUserDto):Promise<IUser>{
        return this.updateUserProfile(id, updateClientDto);
    }

    // get user profile
    async getProfile(id: string): Promise<IUser>{
        const user = await this.getUserProfile(id);
        if(user === undefined) {
            return undefined;
        }
        return user;
    }

    // update profile picture
    async setNewProfilePicture(id: string, newPicture: string): Promise<string>{
        const user = await this.updateUserProfilePicture(id, newPicture);
        return user;
    }

    // delete profile picture
    async deleteProfilePicture(userId:string):Promise<boolean>{
        try{
            const _user = await this.userModel.findOne({_id: userId});
            // update the profile image
            const isDeleted = await this.deleteFile(_user.profile);
            _user.profile = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            _user.save();
            return isDeleted;
        }catch(error){
            return false;
        }
    }

    // delete client data from database
    async deleteUserData(id:string): Promise<boolean>{
        const user = await this.userModel.findOne({_id: id});
        // delete all images 
        await this.deleteFile(user.profile);
        // find and delete the client
        const _user = await this.userModel.findOneAndDelete({_id: id});
        if(_user){
            return true;
        }
        return false;
    }

    // validate client
    async validateUser(createUserDto: CreateUserDto):Promise<IUser>{
        const user = await this.findOne( createUserDto.email, createUserDto.password);
        if(!user) {
            return undefined;
        }
        return user;
    }

    // validate with social media
    async validateSocialUser(social: string, userDto:CreateUserDto): Promise<IUser>{
        const user = await this.userModel.findOne({social: social});
        if(user) {
            return user;
        }
        return await this.userModel.create(userDto);
    }

    // sign token for social login
    async signToken(user: IUser): Promise<string> {
        const payload = { username: user.email, sub: user._id };
        return this.jwtService.sign(payload);
    }

    /* Private methods */

    // hash the password
    private async hashPassword(password: string, salt: string): Promise<string> {
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    // create a new client
    private async creaateUser(createUserDto: CreateUserDto): Promise<IUser> {
        try{
            // check if email already exists
            const emailExists = await this.userModel.findOne({email: createUserDto.email});
            if(emailExists === null){
                const saltRounds = 10;
                // generate salt 
                createUserDto.salt = await bcrypt.genSalt(saltRounds);
                // hash the password
                const hashedPassword = await this.hashPassword(createUserDto.password, createUserDto.salt);
                // add the new password and salt to the dto
                createUserDto.password = hashedPassword;
                // create a new user
                console.log(createUserDto);
                const createdUser = await this.userModel.create(createUserDto);
                return createdUser;
            }else{
                return undefined;
            }
        }catch(error){
            return error;
        }
    }

    // find one user
    private async findOne(email: string, password:string): Promise<IUser | any> {
        try{
            const user = await this.userModel.findOne({email: email});
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
            if(user.profile === defaultImage){
                profileImage = defaultImage;
            }else if(user.social.length > 0) {
                profileImage = user.profile;
            }else{
                profileImage = await Promise.resolve(this.readStream(user.profile));
            }
            const userData = {
                ...user.toObject(),
                profile : profileImage,
                password: "",
                salt: "",
            }
            return userData;
        }catch(err){
            return "user not found";
        }
    }

    // get the profile of a  client (user)
    private async getUserProfile(id: string): Promise<IUser | any> {
        try{
            const user = await this.userModel.findOne({_id: id});
            if(!user) {
                return undefined;
            }
            const defaultImage = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
            let profileImage: string;
            if(user.profile === defaultImage){
                profileImage = defaultImage;
            }else if(user.social.length > 0){
                profileImage = user.profile;
            }else{
                profileImage = await Promise.resolve(this.readStream(user.profile));
            }
            const userData = {
                ...user.toObject(),
                profile : profileImage,
                password: "",
                salt: "",
            }
            return userData;
        }catch(err){
            return undefined;
        }
    }

    // update profile picture
    private async updateUserProfilePicture(id: string, picture: string): Promise<string>{
        const user = await this.userModel.findOne({_id: id});
        if(user.profile === "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"){
            // update the client image to the new picture
            user.profile = picture;
        }else{
            // delete the old picture from database
            await this.deleteFile(user.profile);
            // update the client image to the new picture
            user.profile = picture;
        }
        // save to database
        const updatedUser = await user.save();
        return updatedUser.profile;
    }

    // update profile
    private async updateUserProfile(id: string, updateUserDto: CreateUserDto): Promise<IUser>{
        // find and update the client
        await this.userModel.findOneAndUpdate({_id: id}, updateUserDto, {new: true});
        const userData = await this.getUserProfile(id);
        return userData;
    }

    /* multer file reading */
    // read the file from the database
    private async readStream(id: string): Promise<GridFSBucketReadStream | any> {
        try{
            const fileStream = await this.fileModel.readFileStream(id);
            // get the file contenttype
            const contentType = await this.findInfo(id).then(result => result.contentType);
            // read data in chunks
            const chunks = [];
            fileStream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            // convert the chunks to a buffer
            return new Promise((resolve, reject) => {
                fileStream.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    // convert the buffer to a base64 string
                    const base64 = buffer.toString('base64');
                    // convert the base64 string to a data url
                    const dataUrl = `data:${contentType};base64,${base64}`;
                    // resolve the data url
                    resolve(dataUrl);
                });
                // handle reject
                fileStream.on('error', (err) => {
                    reject(err);
                });
            });
        }catch(error){
            return error;
        }
    }

    private async findInfo(id: string): Promise<any> {
        try{
            const result = await this.fileModel
                .findById(id).catch( () => {throw new HttpException('File not found', HttpStatus.NOT_FOUND)} )
                .then(result => result)
                return{
                    filename: result.filename,
                    length: result.length,
                    chunkSize: result.chunkSize,
                    uploadDate: result.uploadDate,
                    contentType: result.contentType      
                }
        }catch(error){
            return error;
        }
    }

    // delete the file from the database
    private async deleteFile(id: string): Promise<boolean>{
        try{
            return await this.fileModel.delete(id)
        }catch(error){
            return false;
        }
    }
}

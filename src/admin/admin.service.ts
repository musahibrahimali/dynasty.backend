import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { MongoGridFS } from 'mongo-gridfs';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { GridFSBucketReadStream } from 'mongodb';
import {IAdmin} from 'src/interface/interface';
import { AdminModel, Admin } from './schema/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    private fileModel: MongoGridFS;
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminModel>,
        private jwtService: JwtService,
        @InjectConnection() private readonly connection: Connection,
    ){
        this.fileModel = new MongoGridFS(this.connection.db, 'adminProfilePictures');
    }

    // register new admin
    async registerAdmin(createAdminDto: CreateAdminDto): Promise<string> {
        try{
            const _admin = await this.creaateAdmin(createAdminDto);
            if(_admin._id){
                const payload = { username: _admin.email, sub: _admin._id };
                return this.jwtService.sign(payload);
            }
        }catch(error){
            return error; 
        }
    }

    // log in admin
    async loginAdmin(user:IAdmin): Promise<string> {
        try{
            const payload = { username: user.email, sub: user._id };
            return this.jwtService.sign(payload);
        }catch(error){
            return error;
        }
    }

    // update client profile
    async updateProfile(id: string, updateClientDto: CreateAdminDto):Promise<IAdmin>{
        return this.updateAdminProfile(id, updateClientDto);
    }

    // get user profile
    async getProfile(id: string): Promise<IAdmin>{
        const client = await this.getAdminProfile(id);
        if(client === undefined) {
            return undefined;
        }
        return client;
    }

    // update profile picture
    async setNewProfilePicture(id: string, newPicture: string): Promise<string>{
        const client = await this.updateAdminProfilePicture(id, newPicture);
        return client;
    }

    // delete profile picture
    async deleteProfilePicture(clientId:string):Promise<boolean>{
        try{
            const _admin = await this.adminModel.findOne({_id: clientId})
            // update the profile image
            const isDeleted = await this.deleteFile(_admin.profile);
            _admin.profile = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            _admin.save();
            return isDeleted;
        }catch(error){
            return false;
        }
    }

    // delete client data from database
    async deleteAdminData(id:string): Promise<boolean>{
        const admin = await this.adminModel.findOne({_id: id});
        // delete all images 
        await this.deleteFile(admin.profile);
        // find and delete the client
        const _admin = await this.adminModel.findOneAndDelete({_id: id});
        if(_admin){
            return true;
        }
        return false;
    }

    // validate client
    async validateAdmin(createAdminDto: CreateAdminDto):Promise<IAdmin>{
        const admin = await this.findOne( createAdminDto.email, createAdminDto.password);
        if(admin === undefined) {
            return undefined;
        }
        return admin;
    }


    /* Private methods */
    // hash the password
    private async hashPassword(password: string, salt: string): Promise<string> {
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    // find one client (user)
    private async findOne(email: string, password:string): Promise<IAdmin | any> {
        try{
            const admin = await this.adminModel.findOne({email: email});
            if(!admin) {
                return undefined;
            }
            // compare passwords
            const isPasswordValid = await bcrypt.compare(password, admin.password);
            if(!isPasswordValid) {
                return null;
            }
            const defaultImage = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
            let profileImage: string;
            if(admin.profile === defaultImage){
                profileImage = defaultImage;
            }else{
                profileImage = await Promise.resolve(this.readStream(admin.profile));
            }
            const userData = {
                ...admin.toObject(),
                profile : profileImage,
                password: "",
                salt: "",
            }
            return userData;
        }catch(error){
            return error;
        }
    }

    // get the profile of a  client (user)
    private async getAdminProfile(id: string): Promise<IAdmin | any> {
        try{
            const admin = await this.adminModel.findOne({_id: id});
            if(!admin) {
                return undefined;
            }
            const defaultImage = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
            let profileImage: string;
            if(admin.profile === defaultImage){
                profileImage = defaultImage;
            }else{
                profileImage = await Promise.resolve(this.readStream(admin.profile));
            }
            const userData = {
                ...admin.toObject(),
                profile: profileImage,
                password: "",
                salt: ""
            }
            return userData;
        }catch(error){
            return undefined;
        }
    }

    // create a new admin
    private async creaateAdmin(createAdminDto: CreateAdminDto): Promise<IAdmin|any> {
        try{
            // check if email already exists
            const emailExists = await this.adminModel.findOne({email: createAdminDto.email});
            if(emailExists){
                return {
                    status: "error",
                    message: "Email already exists"
                }
            }
            const saltRounds = 10;
            // generate salt 
            createAdminDto.salt = await bcrypt.genSalt(saltRounds);
            // hash the password
            const hashedPassword = await this.hashPassword(createAdminDto.password, createAdminDto.salt);
            // add the new password and salt to the dto
            createAdminDto.password = hashedPassword;
            // create a new user
            const createdAdmin = new this.adminModel(createAdminDto);
            return await createdAdmin.save();
        }catch(error){
            return error;
        }
    }

    // update profile picture
    private async updateAdminProfilePicture(id: string, picture: string): Promise<string>{
        try{
            const admin = await this.adminModel.findOne({_id: id});
            if(admin.profile === "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"){
                // update the client image to the new picture
                admin.profile = picture;
            }else{
                // delete the old picture from database
                await this.deleteFile(admin.profile);
                // update the client image to the new picture
                admin.profile = picture;
            }
            // save to database
            const updatedAdmin = await admin.save();
            return updatedAdmin.profile;
        }catch(error){
            return error;
        }
    }

    // update profile
    private async updateAdminProfile(id: string, updateClientDto: CreateAdminDto): Promise<IAdmin | any>{
        try{
            // first find the admin
            const _admin = await this.adminModel.findOne({_id: id});
            // find and update the client
            if(updateClientDto.firstName && updateClientDto.lastName){
                updateClientDto.displayName = updateClientDto.firstName + ' ' + updateClientDto.lastName;
            }
            if(updateClientDto.firstName && updateClientDto.lastName.length < 0){
                updateClientDto.displayName = updateClientDto.firstName + ' ' + _admin.lastName;
            }
            if(updateClientDto.firstName.length < 0 && updateClientDto.lastName){
                updateClientDto.displayName = _admin.firstName + ' ' + updateClientDto.lastName;
            }
            // if password is not '' then update the password as well
            if(updateClientDto.password.length > 6){
                const hansedPassword = await this.hashPassword(updateClientDto.password, _admin.salt);
                updateClientDto.password = hansedPassword;
            }
            const updatedAdmin = await this.adminModel.findOneAndUpdate({_id: id}, updateClientDto, {new: true});
            const userData = {
                ...updatedAdmin.toObject(),
                password: "",
                salt: "",
            }
            return userData;
        }catch(error){
            return error;
        }
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

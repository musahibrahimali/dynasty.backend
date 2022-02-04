import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    HttpStatus, 
    Param, 
    Patch, 
    Post, 
    Request, 
    Response, 
    UploadedFile, 
    UseGuards, 
    UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { boolean } from 'joi';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard, FacebookAuthGuard,JwtAuthGuard } from 'src/authorization/authorizations';
import { IUser } from 'src/interface/interface';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
    constructor(
        private userService:UserService,
        private configService: ConfigService,
    ) {}

    @ApiCreatedResponse({type: String})
    @Post('register')
    async registerClient(@Body() createUserDto: CreateUserDto, @Response({passthrough: true}) response): Promise<{access_token: string}>{
        const domain = this.configService.get("DOMAIN");
        const token = await this.userService.registerUser(createUserDto);
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        return {access_token : token};
    }

    @ApiCreatedResponse({type: String})
    @Post('login')
    async loginClient(@Body() createUserDto: CreateUserDto, @Response({passthrough: true}) response):Promise<{access_token: string}>{
        const client = await this.userService.validateUser(createUserDto);
        const token = await this.userService.loginUser(client);
        const domain = this.configService.get("DOMAIN");
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        return {access_token : token};
    }

    // google authentication
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    // google callback
    @ApiCreatedResponse({type: String})
    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    async googleCallback(@Request() request, @Response({passthrough: true}) response):Promise<any>{
        const originUrl = this.configService.get("ORIGIN_URL");
        const token = await this.userService.signToken(request.user);
        const domain = this.configService.get("DOMAIN");
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        // redirect to client page
        response.redirect(`${originUrl}/client/home`);
    }

    // facebook auth
    @Get("facebook")
    @UseGuards(FacebookAuthGuard)
    async facebookLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    // facebook callback
    @ApiCreatedResponse({type: String})
    @Get('facebook/callback')
    async facebookCallback(@Request() request, @Response({passthrough: true}) response):Promise<{access_token: string}>{
        const token = await this.userService.signToken(request.user);
        const domain = this.configService.get("DOMAIN");
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        response.redirect('/');
        return {access_token : token};
    }

    // update profile picture
    @ApiCreatedResponse({type: String})
    @UseGuards(JwtAuthGuard)
    @Patch('update-picture/:id')
    @UseInterceptors(FileInterceptor('profilePicture'))
    async updateProfilePicture(@Param('id') id: string, @UploadedFile() file: Express.Multer.File | any):Promise<string>{
        const fileId: string = file.id;
        return this.userService.setNewProfilePicture(id, fileId);
    }

    // update profile
    @ApiCreatedResponse({type: CreateUserDto})
    @UseGuards(JwtAuthGuard)
    @Patch('update-profile:/id')
    async updateClientProfile(@Param("id") id: string, @Body() updateUserDto: CreateUserDto): Promise<IUser>{
        return this.userService.updateProfile(id, updateUserDto);
    }

    // get the user profile information
    @ApiCreatedResponse({type: CreateUserDto})
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() request):Promise<IUser> {
        const {userId} = request.user;
        return this.userService.getProfile(userId);
    }

    // delete profile picture
    @ApiCreatedResponse({type: boolean})
    @UseGuards(JwtAuthGuard)
    @Patch('delete-profile-picture/:id')
    async deleteProfilePicture(@Param("id") id: string):Promise<boolean>{
        return this.userService.deleteProfilePicture(id);
    }

    // log out user
    @ApiCreatedResponse({type: null})
    @Get('logout')
    async logoutClient(@Response({passthrough: true}) response): Promise<null>{
        response.cookie('access_token', '', { maxAge: 1 });
        response.redirect('/');
        return null;
    }

    // delete user account
    @ApiCreatedResponse({type: boolean})
    @UseGuards(JwtAuthGuard)
    @Delete('delete-user/:id')
    async deleteCLientData(@Param("id") id: string, @Response({passthrough: true}) response): Promise<boolean>{
        response.cookie('access_token', '', { maxAge: 1 });
        return this.userService.deleteUserData(id);
    }
}

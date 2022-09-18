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
import {ApiCreatedResponse} from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';
import {boolean} from 'joi';
import {ConfigService} from '@nestjs/config';
import {UserService} from "./user.service";
import {CreateUserDto, ProfileInfoDto} from "./dto";
import {FacebookAuthGuard, GoogleAuthGuard, IUser, JwtAuthGuard} from "../common";

@Controller({version: '1', path: 'user'})
export class UserController {
    constructor(
        private userService: UserService,
        private configService: ConfigService,
    ) {}

    /*
    * #############################################################################
    * ########################## REGISTER USER ####################################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: String, description: 'User created'})
    @Post('sign-up')
    async registerUser(
        @Body() createUserDto: CreateUserDto,
        @Response({passthrough: true}) response
    ): Promise<{ access_token: string }> {
        const domain = this.configService.get("DOMAIN");
        const token = await this.userService.registerUser(createUserDto);
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        return {access_token: token};
    }

    /*
    * #############################################################################
    * ########################## LOGIN USER #######################################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: String, description: 'log in user'})
    @Post('login')
    async loginUser(
        @Body() createUserDto: CreateUserDto,
        @Response({passthrough: true}) response
    ): Promise<{ access_token: string }> {
        const User = await this.userService.validateUser(createUserDto);
        const token = await this.userService.loginUser(User);
        const domain = this.configService.get("DOMAIN");
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        return {access_token: token};
    }

    /*
    * #############################################################################
    * ########################## RESET USER PASSWORD ##############################
    * #############################################################################
    * */
    // @ApiCreatedResponse({type: boolean, description: 'true if password was reset'})
    // @Post('reset-password')
    // async resetPassword(
    //     @Body() updateUserDto: CreateUserDto
    // ): Promise<boolean> {
    //     const password = updateUserDto.password;
    //     return this.userService.resetPassword(password);
    // }

    // google authentication
    /*
      * ########################################################################
      * ############################# GOOGLE AUTH ##############################
      * ########################################################################
      * */
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    /*
    * #############################################################################
    * ###################### GOOGLE AUTH CALLBACK #################################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: String})
    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    async googleCallback(
        @Request() request,
        @Response({passthrough: true}) response
    ): Promise<any> {
        const originUrl = this.configService.get("ORIGIN_URL");
        const token = await this.userService.signToken(request.user);
        const domain = this.configService.get("DOMAIN");
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        // redirect to User page
        response.redirect(`${originUrl}`);
    }

    /*
    * #############################################################################
    * ############################## FACEBOOK AUTH ################################
    * #############################################################################
    * */
    @Get("facebook")
    @UseGuards(FacebookAuthGuard)
    async facebookLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    /*
    * #############################################################################
    * ###################### FACEBOOK AUTH CALLBACK ###############################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: String})
    @Get('facebook/callback')
    async facebookCallback(
        @Request() request,
        @Response({passthrough: true}) response
    ): Promise<{ access_token: string }> {
        const token = await this.userService.signToken(request.user);
        const domain = this.configService.get("DOMAIN");
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        response.redirect('/');
        return {access_token: token};
    }

    /*
    * #############################################################################
    * ########################## GET ALL USERS ####################################
    * #############################################################################
    * */
    @Get('all')
    @ApiCreatedResponse({type: [ProfileInfoDto], description: "all users"})
    async getAllUsers(): Promise<IUser[]> {
        return this.userService.getAllUsers();
    }

    /*
    * #############################################################################
    * ########################## GET USERS BY ID ##################################
    * #############################################################################
    * */
    @Get('profile/:id')
    @ApiCreatedResponse({type: ProfileInfoDto, description: "user profile"})
    async getUserProfile(@Param("id") id: string): Promise<IUser> {
        return this.userService.getProfile(id);
    }

    /*
    * #############################################################################
    * ########################## UPDATE PROFILE PICTURE ###########################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: ProfileInfoDto, description: "Profile picture updated"})
    @UseGuards(JwtAuthGuard)
    @Patch('profile-picture/:id')
    @UseInterceptors(FileInterceptor('file', {dest: 'uploads/'}))
    async updateProfilePicture(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File | any
    ): Promise<string | any> {
        // const fileId: string = file.id;
        console.log(file);
        // return this.userService.setNewProfilePicture(id, fileId);
    }

    /*
    * #############################################################################
    * ########################## UPDATE PROFILE ###################################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: ProfileInfoDto, description: "Profile updated"})
    @UseGuards(JwtAuthGuard)
    @Patch('update-profile/:id')
    async updateUserProfile(
        @Param("id") id: string,
        @Body() updateUserDto: CreateUserDto
    ): Promise<IUser> {
        return this.userService.updateProfile(id, updateUserDto);
    }

    // get the user profile information
    /*
    * #############################################################################
    * ########################## GET USER PROFILE #################################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: ProfileInfoDto, description: "Profile information"})
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() request): Promise<IUser> {
        const {userId} = request.user;
        return this.userService.getProfile(userId);
    }

    // delete profile picture
    /*
    * #############################################################################
    * ########################## DELETE PROFILE PICTURE ###########################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: boolean, description: "Profile picture deleted"})
    @UseGuards(JwtAuthGuard)
    @Patch('delete-profile-picture/:id')
    async deleteProfilePicture(@Param("id") id: string): Promise<boolean> {
        return this.userService.deleteProfilePicture(id);
    }

    /*
    * #############################################################################
    * ########################## LOG OUT USER #####################################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: boolean, description: "Logged out"})
    @UseGuards(JwtAuthGuard)
    @Get('logout')
    async logoutUser(@Response({passthrough: true}) response): Promise<boolean> {
        response.cookie('access_token', '', {maxAge: 1});
        response.redirect('/');
        return null;
    }

    /*
    * #############################################################################
    * ########################## DELETE USER ACCOUNT ##############################
    * #############################################################################
    * */
    @ApiCreatedResponse({type: boolean, description: "User account deleted"})
    @UseGuards(JwtAuthGuard)
    @Delete('delete-account/:id')
    async deleteUserData(
        @Param("id") id: string,
        @Response({passthrough: true}) response
    ): Promise<boolean> {
        response.cookie('access_token', '', {maxAge: 1});
        return this.userService.deleteUserData(id);
    }
}

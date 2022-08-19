import {Body, Controller, Post, Response} from '@nestjs/common';
import {ApiCreatedResponse} from "@nestjs/swagger";
import {ConfigService} from "@nestjs/config";
import {CreateAdminDto} from "@admin/dto/create-admin.dto";
import {LoginAdminDto} from "@admin/dto/login-admin.dto";
import {AdminService} from "@admin/admin.service";

@Controller({version: '1', path: 'admins'})
export class AdminController {
    constructor(
        private adminService: AdminService,
        private configService: ConfigService,
    ) {}

    /*
    * ##########################################################################
    * ############################# REGISTER ADMIN #############################
    * ##########################################################################
    * */
    @ApiCreatedResponse({type: String, description: 'Admin created'})
    @Post('register')
    async registerAdmin(
        @Body() createUserDto: CreateAdminDto,
        @Response({passthrough: true}) response
    ): Promise<{ access_token: string }> {
        const domain = this.configService.get<string>("DOMAIN");
        const token = await this.adminService.registerAdmin(createUserDto);
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        return {access_token: token};
    }

    /*
    * ##########################################################################
    * ############################# LOGIN ADMIN ################################
    * ##########################################################################
    * */
    @ApiCreatedResponse({type: String, description: 'log in admin'})
    @Post('login')
    async loginUser(
        @Body() loginAdminDto: LoginAdminDto,
        @Response({passthrough: true}) response
    ): Promise<{ access_token: string }> {
        const token = await this.adminService.loginAdmin(loginAdminDto);
        const domain = this.configService.get<string>("DOMAIN");
        response.cookie('access_token', token, {
            domain: domain,
            httpOnly: true,
        });
        return {access_token: token};
    }

}

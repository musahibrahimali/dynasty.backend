import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { AdminsService } from './admins.service';
import { GAdmin } from './models/admin.model';
import { CreateAdminInput } from './dto/create-admin.input';
import { UpdateAdminInput } from './dto/update-admin.input';
import {Ctx} from 'src/types/types';
import { LoginAdminInput } from './dto/login-admin.input';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from 'src/common/common';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

// subscription handler
const pubSub = new PubSub();

@Resolver(() => GAdmin)
export class AdminsResolver {
  constructor(private readonly adminsService: AdminsService) {}

  // create a new user
  @Mutation(() => GAdmin)
  async createAdmin(
    @Args('createAdminInput') createUserDto: CreateAdminInput,
    @Context() context: Ctx,
  ): Promise<GAdmin> {
    const admin = await this.adminsService.create(createUserDto, context);
    return admin;
  }

  // log in user
  @Mutation(() => GAdmin)
  async loginAdmin(@Args('loginAdminInput') loginAdminInput: LoginAdminInput, @Context() context: Ctx): Promise<GAdmin> {
    return await this.adminsService.login(loginAdminInput, context);
  }

  // find a user
  @Query(() => GAdmin, { name: 'admin' })
  @UseGuards(GqlAuthGuard)
  async findOneAdmin(@CurrentUser() admin: GAdmin): Promise<GAdmin> {
    return this.adminsService.findOne(admin._id);
  }

  // update user
  @Mutation(() => GAdmin)
  async updateAdmin(@Args('id', { type: () => ID }) id: string, @Args('updateAdminInput') updateAdminInput: UpdateAdminInput): Promise<GAdmin> {
    const admin = await this.adminsService.update(id, updateAdminInput);
    pubSub.publish('adminUpdated', { adminUpdated: admin });
    return admin;
  }

  // update user avatar
  @Mutation(() => GAdmin)
  async updateAdminAvatar(@Args('id', { type: () => ID }) id: string, @Args('avatar') avatar: string): Promise<GAdmin> {
    const admin = await this.adminsService.updateAvatar(id, avatar);
    pubSub.publish('adminUpdated', { adminUpdated: admin });
    return admin;
  }

  // delete user
  @Mutation(() => GAdmin)
  async removeAdmin(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    const result = await this.adminsService.remove(id);
    pubSub.publish('adminDeleted', { adminDeleted: result });
    return result;
  }

  // logout user
  @Mutation(() => Boolean)
  async logoutAdmin(@Context() context:Ctx): Promise<boolean> {
    const result = await this.adminsService.logout(context);
    pubSub.publish('adminLogout', { adminLogout: result });
    return result;    
  }
}

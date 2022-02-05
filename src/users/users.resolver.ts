import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { GUser } from './models/user.model';
import {Ctx} from 'src/types/types';
import { LoginUserInput } from './dto/login-user.input';
import { PubSub } from 'graphql-subscriptions';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/common';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { GqlAuthGuard } from 'src/auth/guards/guards';

// subscription handler
const pubSub = new PubSub();

@Resolver(() => GUser)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // create a new user
  @Mutation(() => GUser)
  async createUser(
    @Args('createUserInput') createUserDto: CreateUserInput,
    @Context() context: Ctx,
  ): Promise<GUser> {
    const user = await this.usersService.create(createUserDto, context);
    return user;
  }

  // log in user
  @Mutation(() => GUser)
  async loginUser(@Args('loginUserInput') loginUserInput: LoginUserInput, @Context() context: Ctx): Promise<GUser> {
    return await this.usersService.login(loginUserInput, context);
  }

  // find a user
  @Query(() => GUser, { name: 'user' })
  @UseGuards(GqlAuthGuard)
  async findOne(@CurrentUser() user: GUser): Promise<GUser> {
    return await this.usersService.findOne(user._id);
  }

  // update user
  @Mutation(() => GUser)
  @UseGuards(GqlAuthGuard)
  async updateUser(@CurrentUser() usr: GUser, @Args('updateUserInput') updateUserInput: UpdateUserInput): Promise<GUser> {
    const user = await this.usersService.update(usr._id, updateUserInput);
    pubSub.publish('userUpdated', { userUpdated: user });
    return user;
  }

  // update user avatar
  @Mutation(() => GUser)
  @UseGuards(GqlAuthGuard)
  async updateAvatar(@Args({name: 'avatar', type: () => GraphQLUpload }) avatar: FileUpload, @CurrentUser() user: GUser): Promise<GUser> {
    const usr = await this.usersService.updateAvatar(user._id, avatar);
    pubSub.publish('userUpdated', { userUpdated: usr });
    return usr;
  }

  // delete user
  @Mutation(() => GUser)
  @UseGuards(GqlAuthGuard)
  async removeUser(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    const result = await this.usersService.remove(id);
    pubSub.publish('userDeleted', { userDeleted: result });
    return result;
  }

  // logout user
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logoutUser(@Context() context:Ctx): Promise<boolean> {
    const result = await this.usersService.logout(context);
    pubSub.publish('userLogout', { userLogout: result });
    return result;    
  }
}

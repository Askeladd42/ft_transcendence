import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, UseGuards} from '@nestjs/common';
import { RelationService } from './relation.service';
import { Friend } from './interfaces/friend.interface';
import { Blocked } from './interfaces/blocked.interface';
import { User } from 'src/users/users.decorator';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('relation')
export class RelationController {
  constructor(private relationService: RelationService, private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/findMyBlocked/:userId(\\d+)')
  async findMyBlocked(
    @Param('userId') userId: number,
    @User() CallerId: number
  ): Promise<number[]>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.findMyBlockedIdOnly(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/blockSomeone/:userId(\\d+)/:userIdToBlock(\\d+)')
  async blockSomeone(
    @Param('userId') userId: number,
    @Param('userIdToBlock') userIdToBlock: number,
    @User() CallerId: number
  ): Promise<boolean>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.blockSomeone(userId, userIdToBlock);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/unBlockSomeone/:userId(\\d+)/:userIdToUnBlock(\\d+)')
  async unBlockSomeone(
    @Param('userId') userId: number,
    @Param('userIdToUnBlock') userIdToUnBlock: number,
    @User() CallerId: number
  ): Promise<boolean>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.unBlockSomeone(userId, userIdToUnBlock);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/findMyFriend/:userId(\\d+)')
  async findMyFriend(
    @Param('userId') userId: number,
    @User() CallerId: number
  ): Promise<number[]>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.findMyFriendIdOnly(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/findMyPendingRequest/:userId(\\d+)')
  async findMyPendingRequest(
    @Param('userId') userId: number,
    @User() CallerId: number
  ): Promise<number[]>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.findMyPendingRequestsIdOnly(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/findFriendEmmitedRequest/:userId(\\d+)')
  async findMyEmmitedRequest(
    @Param('userId') userId: number,
    @User() CallerId: number
  ): Promise<number[]>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.findMyEmmitedRequestIdOnly(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/emmitOrAcceptFriendRequest/:userId(\\d+)/:userIdRequest(\\d+)')
  async emmitOrAcceptFriendRequest(
    @Param('userId') userId: number,
    @Param('userIdRequest') userIdRequest: number,
    @User() CallerId: number
  ): Promise<boolean>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.addFriend(userId, userIdRequest);
  }

  // to remove, cancel or refuse a friend request
  @UseGuards(JwtAuthGuard)
  @Delete('/removeFriend/:userId(\\d+)/:userIdToRemove(\\d+)')
  async removeFriend(
    @Param('userId') userId: number,
    @Param('userIdToRemove') userIdToRemove: number,
    @User() CallerId: number
  ): Promise<boolean>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.removeFriend(userId, userIdToRemove);
  }
}
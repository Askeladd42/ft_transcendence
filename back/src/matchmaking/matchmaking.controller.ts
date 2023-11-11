import {  Controller, Get, Post, Put, Param, Delete } from '@nestjs/common';
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { Matchmaking } from './interfaces/matchmaking.interface';

@Injectable()
export class ParseBooleanPipe implements PipeTransform<string, boolean> {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    if (value.toLowerCase() === 'true') {
      return true;
    } else if (value.toLowerCase() === 'false') {
      return false;
    } else {
      throw new BadRequestException('Invalid boolean value');
    }
  }
}

@Controller('matchmaking')
export class MatchmakingController
{
  constructor(private matchmakingService: MatchmakingService) {}

    // return active matchmaking with matchmakingId
    @Get('/matchmakingId/:matchmakingId(\\d+)')
    async findMatchmakingById(
        @Param('matchmakingId') matchmakingId: number
    ): Promise<Matchmaking | undefined>
    {
        return this.matchmakingService.findMatchmakingById(matchmakingId);
    }
    

    // return active matchmaking with userId
    @Get('/userId/:userId(\\d+)')
    async findMatchmakingByUser(
        @Param('userId') userId: number
    ): Promise<Matchmaking | undefined>
    {
        return this.matchmakingService.findMatchmakingByUser(userId);
    }
    // return active matchmaking for user
    @Post('/create/:userId(\\d+)/:isRanked')
    async createMatchmaking(
        @Param('userId') userId: number,
        @Param('isRanked', ParseBooleanPipe) isRanked: boolean,
    ): Promise<Matchmaking | undefined>
    {
        return this.matchmakingService.createMatchmaking(userId, isRanked);
    }

    @Delete('/cancel/:userId(\\d+)')
    cancelMatchmaking(
        @Param('userId') userId: number
    ): Promise <Boolean>
    {
        return this.matchmakingService.cancelMatchmaking(userId);
    }


    @Post('/initiateDuel/:userId(\\d+)/:targetUserId(\\d+)')
    initiateDuel(
        @Param('userId') userId: number,
        @Param('targetUserId') targetUserId: number,
    ): Promise<Matchmaking | undefined>
    {
        return this.matchmakingService.createDuelRequest(userId, targetUserId);
    }

    @Put('/acceptDuel/:userId(\\d+)')
    acceptDuel(
        @Param('userId') userId: number
    ): Promise<Matchmaking | undefined>
    {
        return this.matchmakingService.acceptDuelRequest(userId);
    }

    @Delete('/cancelDuel/:userId(\\d+)')
    cancelDuel(
        @Param('userId') userId: number
    ): Promise<boolean>
    {
        return this.matchmakingService.cancelOrDenyDuelRequest(userId);
    }
}
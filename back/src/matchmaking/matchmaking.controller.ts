import {  Controller, Get, Post, Put, Param, Delete } from '@nestjs/common';
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, UseGuards} from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { Matchmaking } from './interfaces/matchmaking.interface';
import { User } from 'src/users/users.decorator';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

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
  constructor(private matchmakingService: MatchmakingService, private authService: AuthService) {}

    // return active matchmaking with matchmakingId
    @Get('/matchmakingId/:matchmakingId(\\d+)')
    async findMatchmakingById(
        @Param('matchmakingId') matchmakingId: number
    ): Promise<Matchmaking | undefined>
    {
        return this.matchmakingService.findMatchmakingById(matchmakingId);
    }
    

    // return active matchmaking with userId
    @UseGuards(JwtAuthGuard)
    @Get('/userId/:userId(\\d+)')
    async findMatchmakingByUser(
        @Param('userId') userId: number,
        @User() CallerId: number
    ): Promise<Matchmaking | undefined>
    {
        if (await this.authService.verifysame({id: userId}, CallerId) == false)
            return({message: "Intruder !!!"} as any)
        return this.matchmakingService.findMatchmakingByUser(userId);
    }

    // return active matchmaking for user
    @UseGuards(JwtAuthGuard)
    @Post('/create/:userId(\\d+)/:isRanked')
    async createMatchmaking(
        @Param('userId') userId: number,
        @Param('isRanked', ParseBooleanPipe) isRanked: boolean,
        @User() CallerId: number
    ): Promise<Matchmaking | undefined>
    {
        if (await this.authService.verifysame({id: userId}, CallerId) == false)
            return({message: "Intruder !!!"} as any)
        return this.matchmakingService.createMatchmaking(userId, isRanked);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/cancel/:userId(\\d+)')
    async cancelMatchmaking(
        @Param('userId') userId: number,
        @User() CallerId: number
    ): Promise <Boolean>
    {
        if (await this.authService.verifysame({id: userId}, CallerId) == false)
            return({message: "Intruder !!!"} as any)
        return this.matchmakingService.cancelMatchmaking(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/initiateDuel/:userId(\\d+)/:targetUserId(\\d+)')
    async initiateDuel(
        @Param('userId') userId: number,
        @Param('targetUserId') targetUserId: number,
        @User() CallerId: number
    ): Promise<Matchmaking | undefined>
    {
        if (await this.authService.verifysame({id: userId}, CallerId) == false)
            return({message: "Intruder !!!"} as any)
        return this.matchmakingService.createDuelRequest(userId, targetUserId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('/acceptDuel/:userId(\\d+)')
    async acceptDuel(
        @Param('userId') userId: number,
        @User() CallerId: number
    ): Promise<Matchmaking | undefined>
    {
        if (await this.authService.verifysame({id: userId}, CallerId) == false)
            return({message: "Intruder !!!"} as any)
        return this.matchmakingService.acceptDuelRequest(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/cancelDuel/:userId(\\d+)')
    async cancelDuel(
        @Param('userId') userId: number,
        @User() CallerId: number
    ): Promise<boolean>
    {
        if (await this.authService.verifysame({id: userId}, CallerId) == false)
            return({message: "Intruder !!!"} as any)
        return this.matchmakingService.cancelOrDenyDuelRequest(userId);
    }
}
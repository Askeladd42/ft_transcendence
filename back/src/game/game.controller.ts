import { Controller, Get, Put, Param } from '@nestjs/common';
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, UseGuards} from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './interfaces/game.interface';
import { User } from 'src/users/users.decorator';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('game')
export class GameController
{
  constructor(public gameService: GameService, private authService: AuthService) {}

  // should not use this for the moment (will be used for spectate)
  @Get()
  async findAll(): Promise<Game[]>
  {
    return this.gameService.findAll();
  }

  // return all games for one user (will be used for history)
  @Get('/userId/:id(\\d+)')
  async findAllForOneUser(
    @Param('id') id: number
  ): Promise<Game[]>
  {
    return this.gameService.findAllForOneUser(id);
  }

  // return one game by id (will be used for getting info on current game (for player and spectator))
  @Get('/gameId/:id(\\d+)')
  async findOne(
    @Param('id') id: number
  ): Promise<Game | undefined>
  {
    return this.gameService.findById(id);
  }

  // will update the position of the player on a game (go up)
  @UseGuards(JwtAuthGuard)
  @Put('/playerGoUp/:id(\\d+)/:userId(\\d+)')
  async playerGoUp(
    @Param('id') id: number, 
    @Param('userId') userId: number,
    @User() CallerId: number
  )
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    this.gameService.updatePlayerDirection(id, userId, -1);
  }

  // will update the position of the player on a game (go down)
  @UseGuards(JwtAuthGuard)
  @Put('/playerGoDown/:id(\\d+)/:userId(\\d+)')
  async playerGoDown(
    @Param('id') id: number, 
    @Param('userId') userId: number,
    @User() CallerId: number
  )
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    this.gameService.updatePlayerDirection(id, userId, 1);
  }

  // will update the position of the player on a game (stop movement)
  @UseGuards(JwtAuthGuard)
  @Put('/playerStopMoving/:id(\\d+)/:userId(\\d+)')
  async playerStopMoving(
    @Param('id') id: number, 
    @Param('userId') userId: number,
    @User() CallerId: number
  )
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    this.gameService.updatePlayerDirection(id, userId, 0);
  }

  // will update the position of the player on a game
  @UseGuards(JwtAuthGuard)
  @Put('/sandevistanSmash/:id(\\d+)/:userId(\\d+)/')
  async sandevistanSmash(
    @Param('id') id: number, 
    @Param('userId') userId: number,
    @User() CallerId: number
  )
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    this.gameService.sandevistanSmash(id, userId);
  }

  // will update the position of the player on a game
  @UseGuards(JwtAuthGuard)
  @Put('/sandevistanGuard/:id(\\d+)/:userId(\\d+)/')
  async sandevistanGuard(
    @Param('id') id: number, 
    @Param('userId') userId: number,
    @User() CallerId: number
  )
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    this.gameService.sandevistanGuard(id, userId);
  }
}
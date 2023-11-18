import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, UseGuards} from '@nestjs/common';
import { PrivateMessageService } from './privateMessage.service';
import { PrivateMessage } from './interfaces/privateMessage.interface';
import { User } from 'src/users/users.decorator';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Injectable()
export class stringExistNotNullPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!value || value == null) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}

@Controller('privateMessage')
export class PrivateMessageController {
  constructor(private relationService: PrivateMessageService, private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/getAllUserWithPrivateMessage/:userId(\\d+)')
  async getAllUserWithPrivateMessage(
    @Param('userId') userId: number,
    @User() CallerId: number
  ): Promise<number[]>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.getAllUserWithPrivateMessage(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getAllMessageFromUser/:userId(\\d+)/:OtherUserId(\\d+)')
  async getAllMessageFromUser(
    @Param('userId') userId: number,
    @Param('OtherUserId') OtherUserId: number,
    @User() CallerId: number
  ): Promise<PrivateMessage[]>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.getAllMessageFromUser(userId, OtherUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/newMessageToUser/:userId(\\d+)/:OtherUserId(\\d+)/:content')
  async newMessageToUser(
    @Param('userId')userId: number,
    @Param('OtherUserId')OtherUserId: number,
    @Param('content', stringExistNotNullPipe)content: string,
    @User() CallerId: number
  ): Promise<boolean>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.newMessageToUser(userId, OtherUserId, content);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/updateMessageToUser/:userId(\\d+)/:OtherUserId(\\d+)/:dateMessageToUpdate/:content')
  async updateMessageToUser(
    @Param('userId')userId: number,
    @Param('OtherUserId')OtherUserId: number,
    @Param('dateMessageToDelete', stringExistNotNullPipe)dateMessageToUpdate: string,
    @Param('content', stringExistNotNullPipe)content: string,
    @User() CallerId: number
  ): Promise<boolean>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.updateMessageToUser(userId, OtherUserId, dateMessageToUpdate, content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/deleteMessageToUser/:userId(\\d+)/:OtherUserId(\\d+)/:dateMessageToDelete')
  async deleteMessageToUser(
    @Param('userId')userId: number,
    @Param('OtherUserId')OtherUserId: number,
    @Param('dateMessageToDelete', stringExistNotNullPipe)dateMessageToDelete: string,
    @User() CallerId: number
  ): Promise<boolean>
  {
    if (await this.authService.verifysame({id: userId}, CallerId) == false)
      return({message: "Intruder !!!"} as any)
    return this.relationService.deleteMessageToUser(userId, OtherUserId, dateMessageToDelete);
  }

}
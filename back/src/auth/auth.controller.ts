import { Body, Controller, Post, Get, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/users/users.service';
import { UserValid } from './UserValid.guard';
import { JwtAuthGuard } from './jwt.guard';
import { Public } from './JWTconstant';
import { ValidateUserDTO } from './DTO/ValidateUser.dto';
import { Admin } from './admin.guard';
import { AdminStrategy } from './admin.strategy';
import { Identity } from './identity.guard';
import { User } from 'src/users/users.decorator';


@Controller('auth')
export class AuthController {
  constructor(
	private authService: AuthService,
	private userService: UserService
	) {}

  @Get()
  auth(): string {
	return ("Log in u stupid bastard (curl -X POST http://localhost:2000/auth/login -d '{\"username\": \"john\", \"password\": \"changeme\"}' -H \"Content-Type: application/json\")");
  }

  @UseGuards(JwtAuthGuard)
  @Get('loggedstatus')
  async	amIlogged(@Body() user: ValidateUserDTO, @Request() req: any): Promise<any> {
	console.log("[auth controller amIlogged] Function called")
	console.log("user id and mail ", req.user)
	return({message: "You are logged, buddy !!!!"});
  }

  @Public()
  @UseGuards(UserValid)
  @Post('login')
  async signIn(@Body() user: ValidateUserDTO): Promise<any> {
	console.log("[auth controller login] Function called with ", user)
	const myUser = await this.userService.user({email: user.email})
	if (myUser == null)
		return (null)
	const myJWT = await this.authService.signIn(user.email)
    return {id: myUser.id, access_token: myJWT.access_token };
  }

  //@Public()
  @UseGuards(Admin)
  //@UseGuards(UserValid)
  @Post('test')
  async test(@Body() user: ValidateUserDTO,@User() callerid): Promise<any> {
	console.log("[auth controller test] Function called with ", user)
	console.log("[auth controller test] id is ", callerid)
	console.log("[auth controller test]")
	console.log("[auth controller test]")
    return true;
  }
}//
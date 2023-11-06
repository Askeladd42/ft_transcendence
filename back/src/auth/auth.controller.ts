import { Body, Controller, Post, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/users/users.service';
import { UserValid } from './UserValid.guard';
import { JwtAuthGuard } from './jwt.guard';
import { Public } from './JWTconstant';


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
  async	amIlogged(@Body() user: {email: string, password: string}): Promise<any> {
	console.log("[auth controller amIlogged] Function called")
	return("You are logged, buddy !!!!");
  }

  @Public()
  @UseGuards(UserValid)
  @Post('login')
  async signIn(@Body() user: {email: string, password: string}): Promise<any> {
	console.log("[auth controller login] Function called with ", user)
	const myUser = await this.userService.user({email: user.email})
	const myJWT = await this.authService.signIn(user.email)
    return {id: myUser.id, access_token: myJWT.access_token };
  }

  @Public()
  @Post('test')
  async test(@Body() user: {email: string, password: string}): Promise<any> {
	console.log("[auth controller login] Function called with ", user)
    return this.authService.signIn(user.email);
  }
}
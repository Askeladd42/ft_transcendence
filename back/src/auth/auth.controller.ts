import { Body, Controller, Post, Get, HttpCode, HttpStatus, UseGuards, Request, Param, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/users/users.service';
import { UserValid } from './UserValid.guard';
import { JwtAuthGuard } from './jwt.guard';
import { Public, clientSecretConstant, clientidConstant } from './constant';
import { ValidateUserDTO } from './DTO/ValidateUser.dto';
import { Admin } from './admin.guard';
import { AdminStrategy } from './admin.strategy';
import { Identity } from './identity.guard';
import { User } from 'src/users/users.decorator';
import { HttpService } from '@nestjs/axios';
import { auth42 } from './42auth.guard';


@Controller('auth')
export class AuthController {
  constructor(
	private authService: AuthService,
	private userService: UserService,
	private	readonly httpService: HttpService
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

  @Public()
  @Get("auth42")
  async	oathcode422(@Query() code): Promise<any> {
	console.log("[auth controller oathcode42]Received this")
	console.log(code)
	if (code?.error != null || !code?.code)
		return (code);
	const myCode = code.code

	var body = {
		'grant_type':'authorization_code',
		'client_id':'u-s4t2ud-c6e6bc6e663e516e2041f1a967a53d099a8e63b38c3b89947ec402f0b76971d4',
		'client_secret':'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',
		'code':myCode,
		'redirect_uri':'https://localhost:2000/auth/callback',
	}
	// body.append('grant_type', 'authorization_code')
	// body.append('client_id', 'u-s4t2ud-c6e6bc6e663e516e2041f1a967a53d099a8e63b38c3b89947ec402f0b76971d4')
	// body.append('client_secret', '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')
	// body.append('code', myCode)
	// body.append('redirect_uri', 'http://localhost:2000/auth/callback')
	const resp42 = await this.httpService.post('https://api.intra.42.fr/oauth/token', body).toPromise()
										.then(res => res.data)
	 									.catch(err => console.log("============================ nique la ", err)/*handle error*/)
	console.log(body)
	// const resp42 = await this.httpService.post('http://localhost:80/auth/callback', {data: body}).toPromise()
	// 									.then(res => res.data)
	// 									.catch(err => console.log("============================ nique la ", err)/*handle error*/)
	
	//console.log(resp42)

////
	return(code)
  }

  @Public()
  @UseGuards(auth42)
  @Get("42")
  async	oathcode42(@Query() code): Promise<any> {
	console.log("[auth controller 42]Received this")
	console.log(code)

	console.log("[auth controller 42]If you see this, user should be in db")
	if (code?.error != null || !code?.code)
		return (code);
	const myCode = code.code
	return(code)
  }

  @Public()
  @Get("callback")
  async	callback42(@Query() code): Promise<any> {
	console.log("[auth controller callback]Received this")
	console.log(code)
	if (code?.error != null || !code?.code)
	{
		console.log("[auth controller callback]i got nothing")
		return ("nothing");
	}
//
	return(code)
  }
//
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
import { Injectable, UnauthorizedException} from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from 'src/api/DTO/CreateUser.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
	private usersService: UserService,
	private jwtService: JwtService
	) {}

  async validUserPW(mail: string, pass: string): Promise<any> {
	console.log("[auth service validUser] function call with mail ", mail, " pass ", pass)
    const myuser =  await this.usersService.user({email: mail});
	if (!myuser)
	{
		console.log("Failed to sign in because bad user")
		return (null);
	}
	const mypass = await this.usersService.IdGetPass(myuser.id);
	const ismatch = await bcrypt.compare(pass, mypass.salted_password);
	//const ismatch = await bcrypt.compare(pass, mypass.salt, null);
	//console.log("[validuserpw] It looks like the password match between ", pass, "and the salt gives ", ismatch);
	//console.log("[validuserpw] It looks like the password match between ", mypass.salted_password, "and the salt gives ", ismatch);
	//console.log("My user is ", myuser)
	if (myuser && ismatch != true) {
//	if (myuser && await this.usersService.checkuserpass(pass, myuser?.id) != true) {
		console.log("Failed to sign in because bad password")
		return (null);
	}
	return myuser;
  }
//

  async makeorret(user: CreateUserDTO): Promise<User> {
	var myuser = await this.usersService.user({email: user.email})
	if (!myuser)
	{
		myuser = await this.usersService.createUser(user as any)
	}
	return (myuser)
  }
  async signIn(user: any): Promise<any> {
    
	console.log("[auth service sign in called with params ", user)
	const OurUser = await this.usersService.fuser(user);
	console.log("[auth service sign in] signin in user ", OurUser);
	if (OurUser)
	{
		console.log("[auth sign in] sign in successful");
		const JWT = { email: OurUser.email, id: OurUser.id};
		return {access_token: this.jwtService.sign(JWT)};
	}
	console.log("[auth sign in] sign in failed")
	return ({content: "Go fuck yourself"});
  }

  async verifyAdmin(user: CreateUserDTO): Promise<boolean> {
	const myuser = await this.usersService.user(user as any);
	if (myuser?.admin == 1)
		return(true);
	console.log("[auth service verifyAdmin] user not verified as admin")
	return (false);
  }

  async verifyadminorsame(user: CreateUserDTO, id: number): Promise<boolean> {
	const myuser = await this.usersService.user({id: id});
	if (myuser?.admin != 1)
	{
		if(myuser?.id != user.id)
		{
			console.log("[Auth service verifyadminorsame] different user and not admin")
			return (false);
		}
		console.log("[Auth service verifyadminorsame] checked as same user")
		return (true);
	}
	console.log("[Auth service verifyadminorsame] checked as admin")
	return (true);
  }

  async verifysame(user: CreateUserDTO, id: number): Promise<boolean> {
	if(user.id != id)
	{
		console.log("[Auth service verifysame] different user and not admin")
		return (false);
	}
	console.log("[Auth service verifysame] checked as same user")
	return (true);
  }
}

//test

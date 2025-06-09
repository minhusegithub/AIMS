import { Controller, Get, Post, Body, Patch, Param, Delete, Render, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor( 
    private  authService: AuthService

  ) {}
  
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  handleLogin( @Request() req) {
    return this.authService.login(req.user);
  }

  // @UseGuards(JwtAuthGuard)
  @Public()
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }


  // @UseGuards(JwtAuthGuard)
  @Public()
  @Get('profile1')
  getProfile1(@Request() req) {
    return req.user;
  }




}

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        });
        req['user'] = payload;
      } catch (error) {
        // Token invalid or expired, but don't throw error here
        // Let the guard handle it
      }
    }
    
    next();
  }
} 
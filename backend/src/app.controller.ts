import { Controller, Get, UseGuards } from '@nestjs/common';
import type { AuthUser } from './auth/current-user.decorator';
import { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Endpoint de prueba protegido (apartado 03). */
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(@CurrentUser() user: AuthUser) {
    return {
      message: 'Ruta protegida OK',
      user,
    };
  }
}

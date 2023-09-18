import {
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRoles } from 'src/users/entities/user.entity';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Delete('logout')
  async logout() {
    return 'logout';
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validateLogin(@Request() req: any) {
    return this.authService.validateLogin(req);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER, UserRoles.ADMIN)
  @Get('protected/user')
  getProtected() {
    return 'protected user';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @Get('protected/admin')
  getProtectedAdmin() {
    return 'protected admin';
  }
}

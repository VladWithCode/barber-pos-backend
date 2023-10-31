import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/users/entities/user.entity';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @Get()
  findAll(
    @Query('search') search: string,
    @Query('active_credits') active_credits: boolean,
  ) {
    return this.customersService.find({
      search,
      active_credits,
      limit: 0,
      skip: 0,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get(':id/get-payment-info')
  getPaymentInfo(@Param('id') id: string) {
    return this.customersService.getPaymentInfo(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}

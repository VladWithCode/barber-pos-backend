import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditScoreLabel, CreditStatus } from './types';

@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  getCreditListing(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('itemsPerPage') skip: number,
    @Query('isOverdue') isOverdue: boolean,
    @Query('overdueBy') overdueBy: number,
    @Query('creditStatus') creditStatus: CreditStatus,
    @Query('creditScoreLabel') creditScoreLabel: CreditScoreLabel,
  ) {
    return this.creditsService.getCreditListing({
      search,
      page,
      filters: {
        isOverdue,
        overdueBy,
        creditStatus,
        creditScoreLabel,
      },
    });
  }
}

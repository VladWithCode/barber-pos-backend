import { Injectable } from '@nestjs/common';
import { CustomersService } from 'src/customers/customers.service';
import { SalesService } from 'src/sales/sales.service';
import {
  CreditListingFilters,
  CreditListingItem,
  CreditScoreLabel,
} from './types';
import { FilterQuery } from 'mongoose';
import { Customer } from 'src/customers/entities/customer.entity';
import { asyncHandler } from 'src/utils/helpers';
import { Sale } from 'src/sales/entities/sale.entity';

@Injectable()
export class CreditsService {
  /*
   * Label min & max values for credit_score
   * First value is the minimum
   * Second value is the maximum
   */
  MinMaxCreditScores = {
    buena: [600, 1000],
    regular: [400, 600],
    mala: [0, 400],
  };

  constructor(
    private readonly customerService: CustomersService,
    private readonly saleService: SalesService,
  ) {}

  async getCreditListing(query: {
    search?: string;
    page?: number;
    filters?: CreditListingFilters;
  }) {
    const { search, page, filters } = query;

    const filterQuery: FilterQuery<Customer> = {};
    const lookupQuery: FilterQuery<Sale> = {};

    if (search !== undefined && search.length > 0) {
      filterQuery.$text = { $search: search };
    }

    if (filters.isOverdue !== undefined)
      filterQuery.has_overdue_payments = true;

    if (filters.creditScoreLabel !== undefined) {
      const minMaxForLabel = this.MinMaxCreditScores[filters.creditScoreLabel];

      filterQuery.credit_score = {
        $gte: minMaxForLabel[0],
        $lt: minMaxForLabel[1],
      };
    }

    if (filters.overdueBy) {
      filterQuery.overdue_by = filters.overdueBy;
    }

    if (filters.creditStatus !== undefined) {
      lookupQuery.status = filters.creditStatus;
    }

    const customers = await this.customerService.findWithQuery(filterQuery, {
      querySalesData: true,
      lookupQuery: {
        payment_type: 'credit',
      },
    });

    const creditListing: CreditListingItem[] = [];

    for (const customer of customers) {
      const creditItem: CreditListingItem = {
        _id: customer._id.toString(),
        customerName: customer.fullname,
        creditScore: customer.credit_score,
        creditScoreLabel: this.getCreditScoreLabel(customer.credit_score),
        isOverdue: false,
        overdueBy: 0,
        activeCreditPendingAmount: 0,
        activeCreditPaidAmount: 0,
        activeCreditInterestAccumulated: 0,
        activeCreditPurchases: 0,
        totalCreditPurchases: customer.sales.length,
      };

      for (const sale of customer.sales_data) {
        if (sale.status === 'paid') continue;

        if (creditItem.isOverdue || sale.status === 'overdue') {
          creditItem.isOverdue = true;

          creditItem.overdueBy =
            sale.overdue_by_fortnight > creditItem.overdueBy
              ? sale.overdue_by_fortnight
              : creditItem.overdueBy;
        }

        creditItem.activeCreditInterestAccumulated += sale.interest_pending;
        creditItem.activeCreditPendingAmount += sale.pending_amount;
        creditItem.activeCreditPaidAmount += sale.paid_amount;
        creditItem.activeCreditPurchases++;
      }

      creditListing.push(creditItem);
    }

    return creditListing;
  }

  getCreditScoreLabel(credit_score: number): CreditScoreLabel {
    const MinMaxAsArray = Object.entries(this.MinMaxCreditScores);

    for (const [label, [minScore, maxScore]] of MinMaxAsArray) {
      if (credit_score >= minScore && credit_score < maxScore)
        return label as CreditScoreLabel;
    }
  }
}

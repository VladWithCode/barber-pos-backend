import { TSaleStatus } from 'src/sales/entities/sale.entity';

export type CreditStatus = TSaleStatus;

export type CreditScoreLabel = 'buena' | 'regular' | 'mala';

export type CreditListingFilters = {
  isOverdue?: Boolean;
  overdueBy?: number;
  activeCreditPaidAmount?: number;
  activeCreditPendingAmount?: number;
  activeCreditTotalAmount?: number;
  creditStatus?: CreditStatus;
  creditScoreLabel?: CreditScoreLabel;
};

export type CreditListingItem = {
  _id: string;
  customerName: string;
  creditScore: number;
  creditScoreLabel: CreditScoreLabel;
  isOverdue: boolean;
  overdueBy: number;
  activeCreditPendingAmount: number;
  activeCreditPaidAmount: number;
  activeCreditInterestAccumulated: number;
  activeCreditPurchases: number;
  totalCreditPurchases: number;
};

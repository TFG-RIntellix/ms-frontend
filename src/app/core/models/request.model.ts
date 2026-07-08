export interface RequestSummary {
  requestId: string;
  partyName: string;
  status: string;
  requestType: string;
  amount: number;
  currency: string;
  creationDate: string;
  lastReviewDate?: string;
}

export interface RequestDetails extends RequestSummary {
  requestDate: string;
  partyNIF?: string;
  requestDescription?: string;
  partyPhoneNumber?: string;
  partyEmail?: string;
  partyAddress?: string;
  partyLaboralSituation?: string;
  partyIncome?: number;
  requestedAmount?: number;
  requestTermMonths?: number;
  interestRate?: number;
  purpose?: string;
  requestedCreditLimit?: number;
  isRevolving?: boolean;
  propertyValue?: number;
  isFirstHome?: boolean;
  loanType?: string;
  repaymentSystem?: string;
}

export interface RequestParty {
  requestId: string;
  partyId: string;
  partyName: string;
}

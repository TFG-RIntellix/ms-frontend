/**
 * Represents the summary of a credit request, typically used in list views.
 */
export interface RequestSummary {
  requestId: string;
  requestCode?: string;
  partyName: string;
  status: string;
  requestType: string;
  amount: number;
  currency: string;
  creationDate: string;
  lastReviewDate?: string;
}

/**
 * Represents the detailed view of a credit request, containing all financial and personal data.
 */
export interface RequestDetails extends RequestSummary {
  requestDate: string;
  partyNIF?: string;
  requestDescription?: string;
  partyPhoneNumber?: string;
  partyEmail?: string;
  partyAddress?: string;
  partyLaboralSituation?: string;
  partyIncome?: number;
  loanAmount?: number;
  requestTermMonths?: number;
  interestRate?: number;
  purpose?: string;
  creditLimit?: number;
  isRevolving?: boolean;
  propertyValue?: number;
  isFirstHome?: boolean;
  loanType?: string;
  repaymentSystem?: string;
}

/**
 * Represents the details of the party (client) requesting the credit.
 */
export interface RequestParty {
  requestId: string;
  partyId: string;
  partyName: string;
}

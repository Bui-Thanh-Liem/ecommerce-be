export interface WebhookEvent {
  gateway: string; // Name Bank
  transactionDate: string; // Transaction date in ISO 8601 format
  accountNumber: string; // Account number
  subAccount: string; // Sub-account number
  code: string; // Transaction code
  status: string; // Transaction status
  content: string; // Transaction content
  transferType: string; // Type of transfer (e.g., "internal", "external")
  description: string; // Description of the transaction
  transferAmount: number; // Transfer amount
  referenceCode: string; // Reference code
  accumulated: number; // Accumulated amount
  id: number; // Transaction ID}
}

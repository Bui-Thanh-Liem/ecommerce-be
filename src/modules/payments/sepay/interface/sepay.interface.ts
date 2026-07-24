export interface IWebhookEvent {
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

export interface IResponseCheckout {
  checkoutURL: string;
  checkoutFormFields: {
    signature: string;
    merchant?: string;
    operation?: 'PURCHASE';
    payment_method?: 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';
    order_invoice_number: string;
    order_amount: number;
    currency: string;
    order_description: string;
    order_tax_amount?: number;
    customer_id?: string;
    success_url?: string;
    error_url?: string;
    cancel_url?: string;
    custom_data?: string;
  };
}

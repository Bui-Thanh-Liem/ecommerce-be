import { Expose } from 'class-transformer';
import { IResponseCheckout } from '../interface/sepay.interface';
import { SerializerDto } from '@/shared/dtos/res/serializer.dto';

class CheckoutFormFields {
  @Expose()
  signature: string;

  @Expose()
  merchant?: string;

  @Expose()
  operation?: 'PURCHASE';

  @Expose()
  payment_method?: 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';

  @Expose()
  order_invoice_number: string;

  @Expose()
  order_amount: number;

  @Expose()
  currency: string;

  @Expose()
  order_description: string;

  @Expose()
  order_tax_amount?: number;

  @Expose()
  customer_id?: string;

  @Expose()
  success_url?: string;

  @Expose()
  error_url?: string;

  @Expose()
  cancel_url?: string;

  @Expose()
  custom_data?: string;
}

export class ResponseCheckoutDto extends SerializerDto implements IResponseCheckout {
  @Expose()
  checkoutURL: string;

  @Expose()
  checkoutFormFields: CheckoutFormFields;
}

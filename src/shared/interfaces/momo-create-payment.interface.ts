export interface IMoMoCreatePaymentRequest {
  partnerCode: string;
  partnerName: string;
  storeId: string;
  requestType: string;
  ipnUrl: string;
  redirectUrl: string;
  orderId: string;
  amount: number;
  lang: string;
  orderInfo: string;
  orderExpireTime: number;
  requestId: string;
  extraData: string;
  signature: string;
}

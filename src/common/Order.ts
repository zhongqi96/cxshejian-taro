interface OrderItem {
  quantity: number;
  price: number;
  productId: number;
  productName: string;
  thumbImg: string;
}

export default interface Order {
  billId: number;
  comId: number;
  comName: string;
  discountPrice: number;
  isUrge: number;
  memo: string;
  id: number;
  orderList: OrderItem[];
  orderNumber: string;
  orderType: number;
  payStatus: number;
  proType: number;
  refundFee: number;
  reserveDate: string
  isShowUrge: number;
  status: number;
  totalPrice: number;
  train: string;
  urgeTime: Date;
  username: string;
  isInvoice: boolean;
  money: string;
  mobile: string;
  address: string;
  orderTime: string;
  isShowInvoice: boolean;
  urged: boolean;
  settlementAmount: number;
  endTime: Date;
  receiver: string;
}

import { OrderItem, Order, ORDER_STATUSES, OrderStatus } from "../types";

// 1) Define the shapes of your incoming JSON (you can adjust as needed)
interface ApiItem {
  itemId: number;
  itemname: string;
  quantity: number;
  itemPrice: number;
  itemInstruction?: string | null;
}

export interface ApiOrder {
  id: number;
  orderId: string;
  statusId: number;
  statusName: string;
  custName: string | null;
  customerContactNo: string;
  restaurantName: string;
  resAddress: string;
  customerDeliveryAddress: string;
  items: ApiItem[];
  amount: number;
  generalInstruction?: string | null;
  paymentTypeName: string;
  resLat: number;
  resLog: number;
  cLat: number;
  cLog: number;
  orderDate: string;
  orderTime: string;
  vendorAcceptedTimeInUTC?: string | null;
  dsAssignedTimeInUTC?: string | null;
  deliveredTime?: string | null;
}

// 2) Map a single ApiItem → OrderItem
export function mapApiItemToOrderItem(i: ApiItem): OrderItem {
  return {
    id: i.itemId.toString(),
    name: i.itemname.trim(),
    quantity: i.quantity,
    price: i.itemPrice,
    customizations: i.itemInstruction ? [i.itemInstruction] : undefined,
  };
}

// 3) Map a single ApiOrder → Order
export function mapApiOrderToOrder(a: ApiOrder): Order {
  const statusInfo = ORDER_STATUSES[a.statusId.toString()];
  const status = statusInfo?.name as OrderStatus;
console.log()
  // normalize paymentMethod
  let paymentMethod: Order['paymentMethod'];
  switch (a.paymentTypeName.toLowerCase()) {
    case 'pay on delivery':
    case 'cash':
      paymentMethod = 'cash';
      break;
    case 'card':
      paymentMethod = 'card';
      break;
    case 'upi':
      paymentMethod = 'upi';
      break;
    default:
      paymentMethod = 'cash';
  }

  return {
    id:            a.id.toString(),
    orderNumber:   a.orderId,
    status,
    statusId:      a.statusId,
    customerName:  a.custName || undefined,
    customerPhone: a.customerContactNo,
    restaurantName:    a.restaurantName,
    restaurantAddress: a.resAddress,
    deliveryAddress:   a.customerDeliveryAddress,
    items:         a.items.map(mapApiItemToOrderItem),
    totalAmount:   a.amount,
    deliveryFee:   5,  // static default
    distance:      undefined,
    estimatedTime: undefined,
    pickupLocation: {
      latitude:  a.resLat,
      longitude: a.resLog,
      address:   a.resAddress,
    },
    dropLocation: {
      latitude:  a.cLat,
      longitude: a.cLog,
      address:   a.customerDeliveryAddress,
    },
    createdAt:            `${a.orderDate}T${a.orderTime}`,
    acceptedAt:           a.vendorAcceptedTimeInUTC || undefined,
    pickedAt:             a.dsAssignedTimeInUTC     || undefined,
    deliveredAt:          a.deliveredTime           || undefined,
    specialInstructions:  a.generalInstruction      || undefined,
    paymentMethod,
  };
}

// 4) How you’d use it in your fetch:

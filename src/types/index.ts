export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  vehicleType: 'bike' | 'scooter' | 'car';
  isOnline: boolean;
  rating: number;
  totalDeliveries: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}


export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName?: string;            // custName was null
  customerPhone: string;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;              // you’ll fill this statically (5–10)
  distance?: number;                // not in payload
  estimatedTime?: number;           // not in payload
  pickupLocation: Location;         // resLat/resLog + resAddress
  dropLocation: Location;           // cLat/cLog + custAddress
  createdAt: string;                // orderDate + orderTime
  acceptedAt?: string;              // vendorAcceptedTimeInUTC or null
  pickedAt?: string;                // dsAssignedTimeInUTC or null
  deliveredAt?: string;             // deliveredTime or null
  specialInstructions?: string;     // generalInstruction
  paymentMethod: 'cash' | 'card' | 'upi';
  statusId:number;
}
export enum OrderStatus {
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  PICKED = 'picked',
  EN_ROUTE = 'en_route',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}
export interface OrderStatusInfo {
  id: string;
  name: string;        // should match one of your OrderStatus enum values
  description: string;
}

export const ORDER_STATUSES: Record<string, OrderStatusInfo> = {
  "4":  { id: "4",  name: "pending",              description: "order needs to be confirmed" },
  "5":  { id: "5",  name: "accepted",             description: "order accepted by restaurant" },
  "8":  { id: "8",  name: "cancelled",            description: "order cancelled" },
  "52": { id: "52", name: "assigned",             description: "delivery staff assigned" },
  "53": { id: "53", name: "started",              description: "reaching restaurant" },
  "54": { id: "54", name: "picked",               description: "order picked by delivery person" },
  "55": { id: "55", name: "missing_items",        description: "some items are missing" },
  "56": { id: "56", name: "out_for_delivery",     description: "order is out for delivery" },
  "57": { id: "57", name: "reached",              description: "reached the location" },
  "58": { id: "58", name: "delivered",            description: "order is delivered" },
  "59": { id: "59", name: "not_picked",           description: "customer has not picked the order" },
  "65": { id: "65", name: "at_the_restaurant",    description: "reached the restaurant" },
  "263":{ id: "263",name: "customer_not_showed_up",description: "customer did not show up for pickup" },
};

export interface Earnings {
  id: string;
  orderId: string;
  amount: number;
  type: 'delivery_fee' | 'tip' | 'bonus' | 'penalty';
  date: string;
  paymentMethod: 'cash' | 'digital';
  status: 'pending' | 'paid';
}

export interface Wallet {
  balance: number;
  pendingAmount: number;
  totalEarnings: number;
  cashInHand: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'order_issue' | 'payment' | 'technical' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  images?: string[];
  createdAt: string;
  updatedAt: string;
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
}

export interface Rating {
  id: string;
  orderId: string;
  rating: number;
  feedback?: string;
  type: 'customer' | 'restaurant';
  createdAt: string;
}

export interface AppState {
  auth: AuthState;
  orders: {
    activeOrders: Order[];
    orderHistory: Order[];
    currentOrder: Order | null;
    isLoading: boolean;
  };
  earnings: {
    wallet: Wallet;
    transactions: Earnings[];
    isLoading: boolean;
  };
  tickets: {
    tickets: Ticket[];
    isLoading: boolean;
  };
  app: {
    theme: 'light' | 'dark';
    language: 'en' | 'hi' | 'te';
    isOnline: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
// services/authService.ts
import axios from 'axios';
import { secureStorage } from '../storage/secureStorage';
import { endpoints } from './endpoints';
import { Order } from '../types';
import { ApiOrder, mapApiOrderToOrder } from './helper';

const client = axios.create({
  baseURL: 'http://13.200.251.201:8080/AIOPOSRestaurantAdminAPIs',
  timeout: 10_000,
});

export interface StaffValidation {
  id: number;
  resId: number;
  mobilenumber: string;
  mobileotp: string;
}

export const getStaffValidation = async (
  mobile: string
): Promise<StaffValidation> => {
  const url = `${endpoints.staffValidateCredentials}${mobile}`;
  const fullUrl = `${client.defaults.baseURL}${url}`;
  
  console.log('🌐 API Call - URL:', fullUrl);
  console.log('📱 API Call - Mobile:', mobile);
  
  try {
    const response = await client.get<StaffValidation[]>(url);
    const data = response.data;
    
    console.log('✅ API Success - Response received:', {
      url: fullUrl,
      status: response.status,
      dataLength: Array.isArray(data) ? data.length : 'Not an array'
    });
    
    if (!Array.isArray(data) || !data.length || data[0].mobilenumber !== mobile) {
      const error = new Error('Number not registered');
      console.error('❌ Validation Error:', {
        url: fullUrl,
        mobile,
        error: error.message,
        receivedData: data,
        isArray: Array.isArray(data),
        dataLength: Array.isArray(data) ? data.length : 'N/A',
        firstItemMobile: Array.isArray(data) && data.length > 0 ? data[0].mobilenumber : 'N/A'
      });
      throw error;
    }

    const { id, resId, mobilenumber, mobileotp } = data[0];

    console.log('💾 Storing user data in secure storage:', {
      id,
      resId,
      mobilenumber,
      url: fullUrl
    });

    // persist with your Expo secureStorage singleton:
    await Promise.all([
      secureStorage.setItem('myId', id.toString()),
      secureStorage.setItem('resId', resId.toString()),
      secureStorage.setItem('phone', mobilenumber),
      secureStorage.setItem('statusId', '3'),
    ]);

    console.log('✅ Staff validation completed successfully for mobile:', mobile);
    return data[0];
    
  } catch (error: any) {
    console.error('🚨 API Error - Complete Error Details:', {
      url: fullUrl,
      mobile,
      errorMessage: error.message,
      errorCode: error.code,
      errorStatus: error.response?.status,
      errorStatusText: error.response?.statusText,
      errorData: error.response?.data,
      errorHeaders: error.response?.headers,
      fullError: error,
      stack: error.stack
    });
    
    // Re-throw with enhanced error message
    const enhancedError = new Error(
      `Staff validation failed for ${mobile}. ${error.message}${
        error.response?.status ? ` (Status: ${error.response.status})` : ''
      }`
    );
    enhancedError.cause = error;
    throw enhancedError;
  }
};
export const GetOrderByUser = async (): Promise<Order[]> => {
  console.log('🔄 GetOrderByUser - Starting API call');
  
  try {
    let statusId = 5;
    let deliverytype = 9;
    const branchid = -1;
    
    const resId = await secureStorage.getItem('resId');
    console.log('📋 GetOrderByUser - Parameters:', {
      resId,
      branchid,
      statusId,
      deliverytype
    });
    
    const url = `${endpoints.getordersbyordermasterId}?resId=${resId}&branchId=${branchid}&statusId=${statusId}&ordertypeId=${deliverytype}`;
    const fullUrl = `${client.defaults.baseURL}${url}`;
    console.log('🌐 GetOrderByUser - Full URL:', fullUrl);
    
    const response = await client.get(url);
    const apiOrders = response.data as ApiOrder[];
const ordermaster: Order[] = apiOrders.map(mapApiOrderToOrder);    
    console.log('✅ GetOrderByUser - API Success:', {
      status: response.status,
      dataLength: Array.isArray(ordermaster) ? ordermaster.length : 'Not an array',
      dataType: typeof ordermaster,
      firstOrder: ordermaster.length > 0 ? ordermaster[0] : 'No orders'
    });
    
    return ordermaster;
  } catch (error: any) {
    console.error('🚨 GetOrderByUser - API Error:', {
      errorMessage: error.message,
      errorStatus: error.response?.status,
      errorData: error.response?.data,
      fullError: error
    });
    throw error;
  }
};
export const getOrders = async(): Promise<Order[]> => {
  console.log('🔄 getOrders - Starting API call');
  
  try {
    const mid = await secureStorage.getItem('myId');
    const dsId = mid ? parseInt(mid, 10) : -1;
    
    console.log('📋 getOrders - Parameters:', {
      myId: mid,
      dsId,
      parsedCorrectly: !isNaN(dsId)
    });
    
    const url = `${endpoints.getallOrders}${dsId}`;
    const fullUrl = `${client.defaults.baseURL}${url}`;
    console.log('🌐 getOrders - Full URL:', fullUrl);
    
    const response = await client.get(url);
    const apiOrders = response.data as ApiOrder[];
    
    console.log('📦 getOrders - Raw API Response:', {
      status: response.status,
      dataLength: Array.isArray(apiOrders) ? apiOrders.length : 'Not an array',
      dataType: typeof apiOrders,
      isArray: Array.isArray(apiOrders),
      firstApiOrder: apiOrders.length > 0 ? {
        id: apiOrders[0].id,
        orderId: apiOrders[0].orderId,
        statusId: apiOrders[0].statusId,
        statusName: apiOrders[0].statusName
      } : 'No orders'
    });
    
    // Map API orders to model orders using the helper function
    const ordermaster: Order[] = apiOrders.map(mapApiOrderToOrder);
    
    console.log('✅ getOrders - Mapped Orders:', {
      mappedOrdersLength: ordermaster.length,
      firstMappedOrder: ordermaster.length > 0 ? {
        id: ordermaster[0].id,
        orderNumber: ordermaster[0].orderNumber,
        statusId: ordermaster[0].statusId,
        status: ordermaster[0].status
      } : 'No orders',
      allOrderStatusIds: ordermaster.map(order => order.statusId),
      allOrderNumbers: ordermaster.map(order => order.orderNumber)
    });
    
    return ordermaster;
  } catch (error: any) {
    console.error('🚨 getOrders - API Error:', {
      errorMessage: error.message,
      errorStatus: error.response?.status,
      errorStatusText: error.response?.statusText,
      errorData: error.response?.data,
      fullError: error
    });
    throw error;
  }
};
export const filterOrders = (orders: Order[]) => {
  console.log('🔄 filterOrders - Starting filter process');
  console.log('📋 filterOrders - Input orders:', {
    totalOrders: orders.length,
    orderStatusIds: orders.map(order => order.statusId),
    orders: orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      statusId: order.statusId,
      status: order.status
    }))
  });
  
  const currentOrders = orders.filter(order => order.statusId !== 58);
  const pastOrders = orders.filter(order => order.statusId === 58);
  
  console.log('✅ filterOrders - Filter results:', {
    totalInput: orders.length,
    currentOrders: currentOrders.length,
    pastOrders: pastOrders.length,
    currentOrderIds: currentOrders.map(order => order.statusId),
    pastOrderIds: pastOrders.map(order => order.statusId)
  });
  
  return { currentOrders, pastOrders };
};

export const updateOrderStatusAPI = async (orderId: string, newStatusId: number): Promise<boolean> => {
  console.log('🔄 updateOrderStatusAPI - Starting dummy API call');
  
  try {
    const mid = await secureStorage.getItem('myId');
    const dsId = mid ? parseInt(mid, 10) : -1;
    
    console.log('📋 updateOrderStatusAPI - Parameters:', {
      orderId,
      newStatusId,
      dsId
    });
    
    // Dummy API call - simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ updateOrderStatusAPI - Dummy API Success:', {
      orderId,
      newStatusId,
      message: 'Status updated successfully (dummy call)'
    });
    
    return true;
  } catch (error: any) {
    console.error('🚨 updateOrderStatusAPI - Dummy API Error:', {
      orderId,
      newStatusId,
      errorMessage: error.message,
      fullError: error
    });
    throw error;
  }
};
export interface Status{
    id:number,
    statusId:number,
    deliveryStaffId:number,
    deliveryStaffContactNo:string

}

export const updatestatusId = async(status:Status)=>{
const dsId = await secureStorage.getItem('myId');
const numericDsId = dsId ? parseInt(dsId, 10) : null;
const phone =  await secureStorage.getItem('phone')
status = {...status,deliveryStaffContactNo:phone ? phone : '983482433',deliveryStaffId:numericDsId ? numericDsId : -7}
 await client.post(endpoints.updateorderstatus,status)

}
export const getOrderstatus = async(id:number):Promise<object[]>=>{
  try{
    const res =  await client.get(`${endpoints.getorderStatus}${id}`);
    const status = res[0].statusId;
    return status;
  }
   catch (error) {
    console.error('Error fetching data', error);
    throw error;
  }
};
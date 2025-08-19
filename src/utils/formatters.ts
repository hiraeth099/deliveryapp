export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  const safeAmount = amount || 0;
  return `${currency}${safeAmount.toFixed(2)}`;
};

export const formatDistance = (distanceInKm: number): string => {
  const safeDistance = distanceInKm || 0;
  if (safeDistance < 1) {
    return `${Math.round(safeDistance * 1000)}m`;
  }
  return `${safeDistance.toFixed(1)}km`;
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};

export const formatDate = (date: string | Date | null | undefined, format: 'short' | 'long' | 'time' = 'short'): string => {
  // Handle null/undefined dates - default to July 1, 2025 10:10 AM
  if (!date) {
    const defaultDate = new Date('2025-07-01T10:10:00');
    switch (format) {
      case 'short':
        return defaultDate.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      case 'long':
        return defaultDate.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      case 'time':
        return defaultDate.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      default:
        return defaultDate.toLocaleString('en-IN');
    }
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    const defaultDate = new Date('2025-07-01T10:10:00');
    switch (format) {
      case 'short':
        return defaultDate.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      case 'long':
        return defaultDate.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      case 'time':
        return defaultDate.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      default:
        return defaultDate.toLocaleString('en-IN');
    }
  }
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    case 'long':
      return dateObj.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    default:
      return dateObj.toLocaleString('en-IN');
  }
};

export const formatOrderStatus = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'cancelled':
      return 'Cancelled';
    case 'assigned':
      return 'Assigned';
    case 'started':
      return 'Started';
    case 'picked':
      return 'Picked Up';
    case 'missing_items':
      return 'Missing Items';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'reached':
      return 'Reached';
    case 'delivered':
      return 'Delivered';
    case 'not_picked':
      return 'Not Picked';
    case 'at_the_restaurant':
      return 'At Restaurant';
    case 'customer_not_showed_up':
      return 'Customer No Show';
    // Legacy status support
    case 'en_route':
      return 'On the Way';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  }
};

export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#F59E0B'; // Orange
    case 'accepted':
      return '#3B82F6'; // Blue
    case 'cancelled':
      return '#EF4444'; // Red
    case 'assigned':
      return '#EA580C'; // Orange-red
    case 'started':
      return '#8B5CF6'; // Purple
    case 'picked':
      return '#10B981'; // Green
    case 'missing_items':
      return '#F59E0B'; // Orange
    case 'out_for_delivery':
      return '#06B6D4'; // Cyan
    case 'reached':
      return '#84CC16'; // Lime
    case 'delivered':
      return '#10B981'; // Green
    case 'not_picked':
      return '#EF4444'; // Red
    case 'at_the_restaurant':
      return '#8B5CF6'; // Purple
    case 'customer_not_showed_up':
      return '#EF4444'; // Red
    // Legacy status support
    case 'en_route':
      return '#06B6D4'; // Cyan
    default:
      return '#6B7280'; // Grey
  }
};

export const formatPhoneNumber = (phone: string): string => {
  // Format Indian phone numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export const calculateEarnings = (orders: any[]): { today: number; week: number; month: number } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return orders.reduce(
    (acc, order) => {
      const orderDate = new Date(order.createdAt);
      const earning = order.deliveryFee || 0;

      if (orderDate >= today) acc.today += earning;
      if (orderDate >= weekStart) acc.week += earning;
      if (orderDate >= monthStart) acc.month += earning;

      return acc;
    },
    { today: 0, week: 0, month: 0 }
  );
};
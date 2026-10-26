export type OrderType = 'dine_in' | 'takeaway';
export type OrderSource = 'pos' | 'web';
export type PaymentMethod = 'cash' | 'qris';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type CategoryType = 'coffee' | 'non_coffee' | 'snack';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  created_at: string;
}

export interface Menu {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Order {
  id: string;
  daily_queue_number: number;
  order_code: string;
  customer_name: string;
  order_type: OrderType;
  order_source: OrderSource;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  category_type: CategoryType;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
  menu?: Menu;
}

export interface CategoryReport {
  category_type: CategoryType;
  title: string;
  total_sales: number;
  total_quantity: number;
}

export interface FinancialReport {
  gross_sales_today: number;
  gross_sales_month: number;
  total_transactions: number;
  categories: CategoryReport[];
}

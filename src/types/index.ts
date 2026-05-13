export type UserRole = "customer" | "vendor" | "admin";

export type VendorStatus = "pending" | "approved" | "rejected";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  shop_name: string;
  description: string | null;
  logo_url: string | null;
  status: VendorStatus;
  created_at: string;
  profile?: Profile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  vendor?: Vendor;
  category?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  customer_id: string;
  vendor_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  qpay_invoice_id: string | null;
  created_at: string;
  customer?: Profile;
  vendor?: Vendor;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Product {
  id: string;
  type: "event" | "digital_content";
  title: string;
  description: string | null;
  price: number;
  created_at: string;
}

export interface Event {
  id: string;
  product_id: string;
  event_date: string;
  duration_minutes: number;
  capacity: number | null;
  location: string | null;
  meeting_url: string | null;
}

export interface DigitalContent {
  id: string;
  product_id: string;
  file_name: string;
  file_url: string | null;
}

export interface Purchase {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  original_price: number;
  final_price: number;
  discount_code: string | null;
  payment_method: "card" | "bank_transfer" | "cash";
  payment_status: "pending" | "completed" | "failed";
  payment_date: string | null;
  created_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  active: boolean;
  created_at: string;
}

// Combined types for UI display
export interface ProductWithDetails extends Product {
  event?: Event;
  digitalContent?: DigitalContent;
}

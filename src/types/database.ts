export interface Item {
  id: string;
  type: "event" | "digital_content";
  title: string;
  description: string | null;
  price: number;
  created_at: string;

  // Event specific
  event_date: string | null;
  duration: number | null;
  capacity: number | null;
  location: string | null;
  meeting_url: string | null;

  // Digital content specific
  file_url: string | null;
  file_name: string | null;
}

export interface Purchase {
  id: string;
  item_id: string;
  customer_name: string;
  customer_email: string;
  original_price: number;
  final_price: number;
  discount_code: string | null;
  payment_method: string;
  payment_status: "pending" | "completed" | "failed";
  payment_date: string | null;
  created_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

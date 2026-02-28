export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  slug: string;
  sku: string;
  price_ars: number;
  quantity: number;
  imageUrl: string;
  stock: number;
  units_per_pack: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
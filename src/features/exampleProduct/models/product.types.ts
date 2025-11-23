//typ ogolny
export type Product = {
  name: string;
  price: number;
};

// interfejs dla serwisow
export interface NewProductData {
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

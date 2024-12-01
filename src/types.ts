export interface Size {
  name: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  sizes: Size[];
  price: number;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  size: string;
  instagramUsername: string;
  orderDate: string;
}
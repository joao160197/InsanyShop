interface ImageObject extends Record<string, unknown> {
  url: string;
  name?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface CategoryObject {
  name?: unknown;
  [key: string]: unknown;
}

export interface SearchProductResponse {
  id?: number | string;
  name?: string;
  title?: string;
  description?: string;
  details?: string;
  desc?: string;
  price?: number | string;
  value?: number | string;
  amount?: number | string;
  image?: string | ImageObject;
  thumbnail?: string;
  images?: Array<string | ImageObject>;
  category?: string;
  stock?: number;
  rating?: number;
  brand?: string;
  [key: string]: unknown;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | ImageObject;
  category: string;
  stock: number;
  rating: number;
  brand: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

export interface SearchParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'best-sellers';
}

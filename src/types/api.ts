interface ImageObject {
  url: string;
  [key: string]: any;
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

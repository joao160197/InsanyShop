import { Product, ProductsResponse, Category, SearchParams } from '@/types/api';


interface ImageObject {
  url: string;
  name?: string;
  alt?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

const API_BASE_URL = 'https://api.insany.co';


const buildQueryString = (params: SearchParams): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value));
    }
  });
  
  return query.toString();
};



const normalizeProduct = (raw: unknown, idx: number): Product | null => {
  try {
    if (!raw || typeof raw !== 'object') return null;
    
    const obj = raw as Record<string, unknown>;
    
    
    const id = Number(obj.id ?? idx + 1);
    const name = String(obj.name ?? obj.title ?? '');
    const description = String(obj.description ?? obj.details ?? obj.desc ?? '');
    const price = Number(obj.price ?? obj.value ?? obj.amount ?? 0) || 0;
    const stock = Number(obj.stock ?? obj.quantity ?? obj.qtd ?? 0) || 0;
    const rating = Number(obj.rating ?? obj.rate ?? 0) || 0;
    const brand = String(obj.brand ?? obj.maker ?? obj.manufacturer ?? '');
    
    
    let image = '/image/image.png';
    const rawImage = obj.image ?? obj.thumbnail ?? 
      (Array.isArray(obj.images) ? obj.images[0] : undefined);
    
    if (typeof rawImage === 'string' && rawImage.trim()) {
      image = rawImage.trim();
    } else if (rawImage && typeof rawImage === 'object' && 'url' in rawImage && 
               typeof rawImage.url === 'string') {
      image = rawImage.url.trim();
    }
    

    let category = 'Categoria';
    const extractCategory = (value: unknown): string => {
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        const catObj = value as Record<string, unknown>;
        if (typeof catObj.name === 'string') return catObj.name;
        if (typeof catObj.title === 'string') return catObj.title;
        if (Array.isArray(catObj) && catObj.length > 0) {
          return extractCategory(catObj[0]);
        }
      }
      return 'Categoria';
    };
    
    category = extractCategory(obj.category ?? obj.categories ?? obj.type ?? obj.group);
    
    return {
      id,
      name,
      description,
      price,
      image,
      category,
      stock,
      rating,
      brand
    };
  } catch (error) {
    console.error('Error normalizing product:', error);
    return null;
  }
};


export const fetchProducts = async (params: SearchParams = {}): Promise<ProductsResponse> => {
 
  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 6);
    

    const validSortValues = ['newest', 'price-asc', 'price-desc', 'best-sellers'] as const;
    type SortValue = typeof validSortValues[number];
    const sort = validSortValues.includes(params.sort as SortValue) ? params.sort as SortValue : undefined;

    try {
      const searchUrl = `${API_BASE_URL}/api/search?q=${encodeURIComponent(q)}`;
      console.log('Buscando por termo via /api/search:', { searchUrl, q });
      
      const res = await fetch(searchUrl);
      if (!res.ok) {
        throw new Error(`Erro na busca: ${res.status} ${res.statusText}`);
      }
      
      const rawResults = await res.json();
      
      
      const processSearchResults = (results: unknown): Product[] => {
        if (!results) return [];
        
      
        if (Array.isArray(results)) {
          return results
            .map((item, idx) => normalizeProduct(item, idx))
            .filter((p): p is Product => p !== null);
        }
        
        
        if (typeof results === 'object' && results !== null && 'results' in results) {
          const resultsArray = (results as { results: unknown }).results;
          if (Array.isArray(resultsArray)) {
            return resultsArray
              .map((item, idx) => normalizeProduct(item, idx))
              .filter((p): p is Product => p !== null);
          }
        }
        
        return [];
      };
      
 
      const allProducts = processSearchResults(rawResults);
      

      let filtered = [...allProducts];
      if (params.category && params.category !== 'all') {
        const categoryFilter = params.category.toLowerCase();
        filtered = filtered.filter(p => 
          p.category.toLowerCase().includes(categoryFilter)
        );
      }
      
   
      if (sort) {
        switch (sort) {
          case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'best-sellers':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        
        }
      }
      
   
      const totalPages = Math.ceil(filtered.length / limit);
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);
      
      return {
        products: paginated,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts: filtered.length,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
      
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      console.error('Erro ao buscar produtos:', error);
 
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }
  }


  const cleanParams: Record<string, string | number> = {};
  if (params.category && params.category !== 'all') cleanParams.category = params.category;
  if (params.search) cleanParams.search = params.search;
  if (params.page) cleanParams.page = Number(params.page) || 1;
  if (params.limit) cleanParams.limit = Number(params.limit) || 6;
  if (params.sort) cleanParams.sort = params.sort;

  const queryString = buildQueryString(cleanParams);
  const url = `${API_BASE_URL}/api/products?${queryString}`;

  try {
    console.log('Buscando produtos de:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta da API de produtos:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url
      });
      throw new Error(`Erro ao buscar produtos: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Dados recebidos da API de produtos:', data);
    if (!data.products || !Array.isArray(data.products)) {
      console.warn('Formato inesperado de resposta da API de produtos:', data);
      return {
        products: [],
        pagination: {
          currentPage: Number(params.page) || 1,
          totalPages: 1,
          totalProducts: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }
    return data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return {
      products: [],
      pagination: {
        currentPage: Number(params.page) || 1,
        totalPages: 1,
        totalProducts: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }
};

interface RawProduct {
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
  thumbnail?: string | ImageObject;
  thumb?: string | ImageObject;
  images?: Array<string | ImageObject>;
  category?: string | { name?: string } | { category?: string } | { categories?: Array<{ name?: string }> };
  stock?: number;
  quantity?: number;
  qtd?: number;
  rating?: number;
  rate?: number;
  brand?: string;
  maker?: string;
  manufacturer?: string;
  [key: string]: unknown;
}

export const fetchProductById = async (id: string | number): Promise<Product> => {
  const url = `${API_BASE_URL}/api/products/${id}`;

  const getDefaultProduct = (productId: string | number): Product => ({
    id: Number(productId),
    name: 'Produto',
    description: '',
    price: 0,
    image: '/image/image.png',
    category: 'Categoria',
    stock: 0,
    rating: 0,
    brand: ''
  });

  const normalizeProduct = (raw: unknown): Product => {
    if (!raw || typeof raw !== 'object' || raw === null) {
      return getDefaultProduct(id);
    }
    
  
    const isRawProduct = (obj: unknown): obj is RawProduct => {
      return obj !== null && typeof obj === 'object' && 
        ('id' in obj || 'name' in obj || 'title' in obj);
    };
    
    if (!isRawProduct(raw)) {
      return getDefaultProduct(id);
    }

    
    const product = raw as Record<string, unknown>;
    
   
    const getString = (value: unknown, defaultValue = ''): string => 
      value !== undefined && value !== null ? String(value) : defaultValue;
    

    const getNumber = (value: unknown, defaultValue = 0): number => {
      const num = Number(value);
      return Number.isFinite(num) ? num : defaultValue;
    };

    
    const name = getString(
      (product as { name?: unknown }).name || 
      (product as { title?: unknown }).title, 
      'Produto sem nome'
    );
    
    
    const description = getString(
      (product as { description?: unknown }).description || 
      (product as { details?: unknown }).details || 
      (product as { desc?: unknown }).desc,
      'Sem descrição disponível'
    );
    
   
    const priceNum = getNumber(
      (product as { price?: unknown }).price || 
      (product as { value?: unknown }).value || 
      (product as { amount?: unknown }).amount
    );
    

    let image = '/image/image.png';
    const rawImage = (product as { image?: unknown }).image || 
                    (product as { thumbnail?: unknown }).thumbnail || 
                    (product as { thumb?: unknown }).thumb;
    
    if (typeof rawImage === 'string' && rawImage.trim()) {
      image = rawImage.trim();
    } else if (rawImage && typeof rawImage === 'object' && rawImage !== null && 'url' in rawImage) {
      const url = (rawImage as { url: unknown }).url;
      if (typeof url === 'string' && url.trim()) {
        image = url.trim();
      }
    }
    
 
    const productImages = (product as { images?: unknown }).images;
    if (Array.isArray(productImages) && productImages.length > 0) {
      const firstImage = productImages[0];
      if (typeof firstImage === 'string' && firstImage.trim()) {
        image = firstImage.trim();
      } else if (firstImage && typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
        const url = (firstImage as { url: unknown }).url;
        if (typeof url === 'string' && url.trim()) {
          image = url.trim();
        }
      }
    }

    let category = 'Categoria';
    const categoryValue = (product as { category?: unknown }).category;
    if (typeof categoryValue === 'string') {
      category = categoryValue;
    } else if (categoryValue && typeof categoryValue === 'object' && categoryValue !== null && 'name' in categoryValue) {
      const name = (categoryValue as { name: unknown }).name;
      if (typeof name === 'string') {
        category = name;
      }
    }
    
    const stockNum = getNumber(
      (product as { stock?: unknown }).stock || 
      (product as { quantity?: unknown }).quantity || 
      (product as { qtd?: unknown }).qtd
    );
    
    const ratingNum = getNumber(
      (product as { rating?: unknown }).rating || 
      (product as { rate?: unknown }).rate
    );
    
     const brand = getString(
      (product as { brand?: unknown }).brand || 
      (product as { maker?: unknown }).maker || 
      (product as { manufacturer?: unknown }).manufacturer,
      'Marca desconhecida'
    );
    
    const productId = getNumber(
      (product as { id?: unknown }).id || id,
      typeof id === 'number' ? id : 0
    );

    return {
      id: productId,
      name,
      description,
      price: priceNum,
      image,
      category,
      stock: stockNum,
      rating: ratingNum,
      brand
    };
  };

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Produto não encontrado: ${response.statusText}`);
    }

    const data = await response.json();

  
    const rawProduct = data?.product ?? data?.data ?? data;
    return normalizeProduct(rawProduct);
  } catch (error) {
    console.error(`Erro ao buscar produto com ID ${id}:`, error);
   
    return normalizeProduct(null);
  }
};


export const fetchCategories = async (): Promise<Category[]> => {
  const url = `${API_BASE_URL}/api/categories`;
  
  try {
    console.log('Buscando categorias de:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta da API de categorias:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Erro ao buscar categorias: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Dados recebidos da API de categorias:', data);
    
   
    if (data && Array.isArray(data.categories)) {
      return data.categories;
    }
    
   
    if (Array.isArray(data)) {
      return data;
    }
    
   
    console.warn('Formato inesperado de resposta da API de categorias:', data);
    return [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
   
    return [];
  }
};


export const searchProducts = async (query: string): Promise<Product[]> => {
  if (!query.trim()) return [];
  
  const url = `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    throw error;
  }
};

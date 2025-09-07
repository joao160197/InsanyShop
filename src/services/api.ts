import { Product, ProductsResponse, Category, SearchParams, SearchProductResponse, CategoryObject } from '@/types/api';

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


const isValidProduct = (item: unknown): item is SearchProductResponse => {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return 'id' in obj || 'name' in obj || 'title' in obj;
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

export const fetchProductById = async (id: string | number): Promise<Product> => {
  const url = `${API_BASE_URL}/api/products/${id}`;


  const normalizeProduct = (raw: any): Product => {
    if (!raw) {
      return {
        id: Number(id),
        name: 'Produto',
        description: '',
        price: 0,
        image: '/image/image.png',
        category: 'Categoria',
        stock: 0,
        rating: 0,
        brand: ''
      };
    }

    const name = raw.name ?? raw.title ?? '';
    const description = raw.description ?? raw.details ?? raw.desc ?? '';
    const priceNum = Number(raw.price ?? raw.value ?? raw.amount ?? 0) || 0;
    let image: string | undefined;
    const rawImage = raw.image ?? raw.thumbnail ?? raw.thumb ?? (Array.isArray(raw.images) ? raw.images[0] : undefined);
    if (typeof rawImage === 'string' && rawImage.trim()) {
      image = rawImage;
    } else if (rawImage && typeof rawImage === 'object' && typeof rawImage.url === 'string' && rawImage.url.trim()) {
      image = rawImage.url;
    }
    if (!image) image = '/image/image.png';

    let category: string = 'Categoria';
    if (typeof raw.category === 'string') category = raw.category;
    else if (raw.category && typeof raw.category.name === 'string') category = raw.category.name;
    else if (Array.isArray(raw.categories) && raw.categories.length) {
      const c = raw.categories[0];
      category = typeof c === 'string' ? c : (c?.name ?? category);
    }

    const stockNum = Number(raw.stock ?? raw.quantity ?? raw.qtd ?? 0) || 0;
    const ratingNum = Number(raw.rating ?? raw.rate ?? 0) || 0;
    const brand = raw.brand ?? raw.maker ?? raw.manufacturer ?? '';

    return {
      id: Number(raw.id ?? id),
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

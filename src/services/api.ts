import { Product, ProductsResponse, Category, SearchParams } from '@/types/api';

const API_BASE_URL = 'https://api.insany.co';

/**
 * Constrói uma URL de consulta com parâmetros
 */
const buildQueryString = (params: SearchParams): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value));
    }
  });
  
  return query.toString();
};

/**
 * Busca produtos com base nos parâmetros fornecidos
 */
export const fetchProducts = async (params: SearchParams = {}): Promise<ProductsResponse> => {
  // Cria um objeto de parâmetros limpo, removendo valores undefined ou vazios
  const cleanParams: Record<string, any> = {};
  
  if (params.category && params.category !== 'all') {
    cleanParams.category = params.category;
  }
  if (params.search) {
    cleanParams.search = params.search;
  }
  if (params.page) {
    cleanParams.page = params.page;
  }
  if (params.limit) {
    cleanParams.limit = params.limit;
  }
  if (params.sort) {
    cleanParams.sort = params.sort;
  }
  
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
    
    // Garante que a resposta tem o formato esperado
    if (!data.products || !Array.isArray(data.products)) {
      console.warn('Formato inesperado de resposta da API de produtos:', data);
      // Retorna um objeto vazio no formato esperado
      return {
        products: [],
        pagination: {
          currentPage: 1,
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
    // Retorna um objeto vazio no formato esperado em caso de erro
    return {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }
};

/**
 * Busca um produto pelo ID
 */
export const fetchProductById = async (id: string | number): Promise<Product> => {
  const url = `${API_BASE_URL}/api/products/${id}`;

  // Helper para normalizar diferentes formatos de produto vindos da API
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

    // Possíveis alternativas de campos
    const name = raw.name ?? raw.title ?? '';
    const description = raw.description ?? raw.details ?? raw.desc ?? '';
    const priceNum = Number(raw.price ?? raw.value ?? raw.amount ?? 0) || 0;

    // Resolver imagem: string direta, objeto com url, array de imagens, thumbnail, etc
    let image: string | undefined;
    const rawImage = raw.image ?? raw.thumbnail ?? raw.thumb ?? (Array.isArray(raw.images) ? raw.images[0] : undefined);
    if (typeof rawImage === 'string' && rawImage.trim()) {
      image = rawImage;
    } else if (rawImage && typeof rawImage === 'object' && typeof rawImage.url === 'string' && rawImage.url.trim()) {
      image = rawImage.url;
    }
    if (!image) image = '/image/image.png';

    // Categoria pode ser string, objeto ou array
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

    // Alguns endpoints podem devolver { product: {...} } ou o objeto já direto
    const rawProduct = data?.product ?? data?.data ?? data;
    return normalizeProduct(rawProduct);
  } catch (error) {
    console.error(`Erro ao buscar produto com ID ${id}:`, error);
    // Retorna um objeto normalizado básico para evitar quebra na UI
    return normalizeProduct(null);
  }
};

/**
 * Busca todas as categorias
 */
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
    
    // Se a resposta for um objeto com uma propriedade 'categories', use-a
    if (data && Array.isArray(data.categories)) {
      return data.categories;
    }
    
    // Se for um array, retorna diretamente
    if (Array.isArray(data)) {
      return data;
    }
    
    // Se chegar aqui, a resposta não está no formato esperado
    console.warn('Formato inesperado de resposta da API de categorias:', data);
    return [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    // Retorna um array vazio em caso de erro para evitar quebrar a UI
    return [];
  }
};

/**
 * Busca sugestões de busca
 */
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

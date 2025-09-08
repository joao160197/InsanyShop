'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Cards } from '@/components/Cards';
import { FilterBar } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import { fetchProducts } from '@/services/api';
import type { Product } from '@/types/api';
import styles from './page.module.scss';
import { useCart } from '@/context/CartContext';
import SearchParamsWrapper from '@/components/SearchParamsWrapper';

function CategoryPageContent() {
  const params = useParams();
  const { addItem } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || '';
  
  type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'best-sellers';
  
  const [filters, setFilters] = useState<{
    sort: SortOption;
    page: number;
    limit: number;
    search: string;
  }>({
    sort: 'price-desc',
    page: 1,
    limit: 6,
    search: '',
  });

  useEffect(() => {
    if (!slug) {
      setError('Categoria não encontrada');
      setIsLoading(false);
      return;
    }

    try {
      const formattedName = slug
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setCategoryName(formattedName);
    } catch (err) {
      console.error('Error formatting category name:', err);
      setCategoryName(slug);
    }
  }, [slug]);

  const handleSearchParamsChange = useCallback((searchTerm: string) => {
    setFilters(prev => {
      if ((prev.search || '') !== searchTerm) {
        return { ...prev, search: searchTerm, page: 1 };
      }
      return prev;
    });
  }, []);

  const categoryTagline = useMemo(() => {
    const key = (slug || '').toString().toLowerCase();
    
    const map: Record<string, string> = {
      
      'eletronicos': 'Smartphones, laptops, consoles e mais',
      'eletronicos-e-informatica': 'Smartphones, laptops, consoles e mais',
      'tecnologia': 'Smartphones, laptops, consoles e mais',
      'eletronico': 'Smartphones, laptops, consoles e mais',
      
     
      'roupas': 'Moda masculina, feminina e infantil',
      'roupa': 'Moda masculina, feminina e infantil',
      'roupas-e-calcados': 'Moda masculina, feminina e infantil',
      
    
      'calcados': 'Tênis, botas, sandálias e mais',
      'calçados': 'Tênis, botas, sandálias e mais',
      'sapatos': 'Tênis, botas, sandálias e mais',
      
  
      'esporte': 'Acessórios, vestuário e mais para o seu treino',
      'esportes': 'Acessórios, vestuário e mais para o seu treino',
      'esportivo': 'Acessórios, vestuário e mais para o seu treino',
      'esportiva': 'Acessórios, vestuário e mais para o seu treino',
      
      
      'casa': 'Decoração, utilidades e móveis',
      'lar': 'Decoração, utilidades e móveis',
      'casa-e-decoracao': 'Decoração, utilidades e móveis',
      
  
      'livros': 'Ficção, não-ficção, didáticos e mais',
      'livro': 'Ficção, não-ficção, didáticos e mais',
      'leitura': 'Ficção, não-ficção, didáticos e mais',
    };
    

    if (map[key]) return map[key];
    
   
    const matchedKey = Object.keys(map).find(k => key.includes(k));
    return matchedKey ? map[matchedKey] : '';
  }, [slug]);

  const loadProducts = useCallback(async () => {
    if (!slug) {
      setError('Categoria inválida');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchProducts({
        category: slug,
        search: filters.search || undefined,
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit
      });
      
      if (!response || !response.products) {
        throw new Error('Resposta inválida da API');
      }
      
      setProducts(response.products);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalProducts(response.pagination?.totalProducts || 0);
      
      if (response.products.length === 0) {
        setError('Nenhum produto encontrado nesta categoria.');
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Não foi possível carregar os produtos desta categoria. Tente novamente mais tarde.');
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  }, [slug, filters.search, filters.sort, filters.page, filters.limit]);

  useEffect(() => {
    if (slug) {
      loadProducts();
      
      const params = new URLSearchParams();
      if (filters.sort !== 'newest') params.set('sort', filters.sort);
      if (filters.page > 1) params.set('page', filters.page.toString());
      if ((filters.search || '').trim()) params.set('search', filters.search.trim());
      
      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [loadProducts, slug, filters.sort, filters.page, filters.search]);

  useEffect(() => {
    if (filters.sort !== 'price-asc' && filters.sort !== 'price-desc') {
      setFilters(prev => ({ ...prev, sort: 'price-desc' }));
    }
  }, [filters.sort]);


  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: filterType === 'page' ? parseInt(value) : value,
      ...(filterType === 'sort' ? { page: 1 } : {})
    }));
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const sortedProducts = useMemo(() => {
    const result = [...products];

    switch (filters.sort) {
      case 'price-asc':
        return [...result].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...result].sort((a, b) => b.price - a.price);
      case 'best-sellers':
        return [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return result;
    }
  }, [products, filters.sort]);

  if (isLoading) {
    return (
      <main className="container">
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h2>Carregando produtos...</h2>
          <p>Por favor, aguarde enquanto buscamos os produtos.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.container}>
        <h1 className={styles.pageTitle}>{categoryName || 'Categoria'}</h1>
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <button 
              onClick={() => loadProducts()}
              className={styles.retryButton}
            >
              Tentar novamente
            </button>
            <Link href="/" className={styles.backButton}>
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <main className="container">
        <h1 className={styles.pageTitle}>{categoryName || 'Categoria'}</h1>
        <div className={styles.emptyState}>
          <p>Nenhum produto encontrado nesta categoria.</p>
          <Link href="/" className={styles.backButton}>
            Voltar para a página inicial
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <SearchParamsWrapper onSearchParamsChange={handleSearchParamsChange} />
      <div className={styles.contentWrapper}>
        <div className={styles.headerTop}>
          <div className={styles.breadcrumb}>
            Produtos / <span className={styles.categoryName}>{categoryName || 'Categoria'}</span>
          </div>
          <div className={styles.filterBarContainer}>
            <FilterBar 
              className={styles.filterBar}
              currentCategory={slug || 'all'}
              onFilterChange={handleFilterChange}
              hideCategory
              priceOnly
              hideTitle
            />
          </div>
        </div>

        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>{categoryName || 'Categoria'}</h1>
          {categoryTagline && (
            <div className={styles.subtitle}>{categoryTagline}</div>
          )}
        </div>

        <Cards 
          products={sortedProducts} 
          onAddToCart={handleAddToCart}
        />
        
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => handleFilterChange('page', page.toString())}
            />
            <p className={styles.totalProducts}>
              Mostrando {sortedProducts.length} de {totalProducts} produtos
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CategoryPageContent />
    </Suspense>
  );
}

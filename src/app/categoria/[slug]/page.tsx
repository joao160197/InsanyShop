'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Cards } from '@/components/Cards';
import { FilterBar } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import { fetchProducts } from '@/services/api';
import type { Product } from '@/types/api';
import styles from './page.module.css';
import { useCart } from '@/context/CartContext';

export default function CategoryPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const { addItem } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  
  // Get the slug from params
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || '';
  
  const [filters, setFilters] = useState<{
    sort: 'newest' | 'price-asc' | 'price-desc' | 'best-sellers';
    page: number;
    limit: number;
    search: string;
  }>({
    sort: (searchParams?.get('sort') as any) || 'price-desc',
    page: parseInt(searchParams?.get('page') || '1'),
    limit: 6,
    search: (searchParams?.get('search') || '').trim(),
  });

  // Set category name from slug and load products
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

  // Sincroniza o termo de busca da URL com o estado de filtros
  useEffect(() => {
    const term = (searchParams.get('search') || '').trim();
    setFilters(prev => {
      if ((prev.search || '') !== term) {
        return { ...prev, search: term, page: 1 };
      }
      return prev;
    });
  }, [searchParams]);

  // Texto descritivo por categoria (exibido à direita do título)
  const categoryTagline = useMemo(() => {
    const key = (slug || '').toString().toLowerCase();
    const map: Record<string, string> = {
      eletronicos: 'Smartphones, laptops, consoles e mais',
      'eletronicos-e-informatica': 'Smartphones, laptops, consoles e mais',
      tecnologia: 'Smartphones, laptops, consoles e mais',
      roupas: 'Moda masculina, feminina e infantil',
      'roupas-e-calcados': 'Moda masculina, feminina e infantil',
      calcados: 'Tênis, botas, sandálias e mais',
      esporte: 'Acessórios, vestuário e mais para o seu treino',
      casa: 'Decoração, utilidades e móveis',
      livros: 'Ficção, não-ficção, didáticos e mais',
    };
    return map[key] || '';
  }, [slug]);

  // Carrega os produtos da categoria
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
  }, [slug, filters.sort, filters.page, filters.limit]);

  // Atualiza os produtos quando os filtros mudam
  useEffect(() => {
    if (slug) {
      loadProducts();
      
      // Atualiza a URL com os parâmetros atuais
      const params = new URLSearchParams();
      if (filters.sort !== 'newest') params.set('sort', filters.sort);
      if (filters.page > 1) params.set('page', filters.page.toString());
      if ((filters.search || '').trim()) params.set('search', filters.search.trim());
      
      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [loadProducts, slug]);

  // Garante que o sort esteja sempre em uma opção de preço nesta página
  useEffect(() => {
    if (filters.sort !== 'price-asc' && filters.sort !== 'price-desc') {
      setFilters(prev => ({ ...prev, sort: 'price-desc' }));
    }
  }, [filters.sort]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => {
      // Se estiver mudando o tipo de ordenação, volta para a primeira página
      if (filterType === 'sort') {
        return {
          ...prev,
          sort: value as any,
          page: 1
        };
      }
      return {
        ...prev,
        [filterType]: filterType === 'page' ? parseInt(value) : value
      };
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    
    // Rolar para o topo quando mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  // Ordenar produtos localmente (opcional, pode ser feito no backend)
  const sortedProducts = useMemo(() => {
    let result = [...products];

    switch (filters.sort) {
      case 'price-asc':
        return [...result].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...result].sort((a, b) => b.price - a.price);
      case 'best-sellers':
        return [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default: // newest
        return result;
    }
  }, [products, filters.sort]);

  // Se estiver carregando, mostra um indicador de carregamento
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

  // Se houver erro, mostra a mensagem de erro
  if (error) {
    return (
      <main className="container">
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
            <a href="/" className={styles.backButton}>
              Voltar para a página inicial
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Se não houver produtos, mostra uma mensagem
  if (sortedProducts.length === 0) {
    return (
      <main className="container">
        <h1 className={styles.pageTitle}>{categoryName || 'Categoria'}</h1>
        <div className={styles.emptyState}>
          <p>Nenhum produto encontrado nesta categoria.</p>
          <a href="/" className={styles.backButton}>
            Voltar para a página inicial
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.breadcrumb}>Produtos / {categoryName || 'Categoria'}</div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>{categoryName || 'Categoria'}</h1>
        {categoryTagline && (
          <div style={{ color: '#737380' }}>{categoryTagline}</div>
        )}
      </div>

      <FilterBar 
        currentSort={filters.sort}
        currentCategory={slug || 'all'}
        onFilterChange={handleFilterChange}
        hideCategory
        priceOnly
        hideTitle
      />

      <Cards 
        products={sortedProducts} 
        categoryName={categoryName}
        onAddToCart={(product) => addItem(product)}
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
    </main>
  );
}

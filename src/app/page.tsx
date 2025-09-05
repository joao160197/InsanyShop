"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Cards } from "@/components/Cards";
import { FilterBar } from "@/components/FilterBar";
import { Pagination } from "@/components/Pagination";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { fetchProducts } from "@/services/api";
import type { Product } from "@/types/api";
import styles from "./page.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  
  const [filters, setFilters] = useState({
    category: "all",
    sort: "newest" as 'newest' | 'price-asc' | 'price-desc' | 'best-sellers',
    page: 1,
    limit: 6, // 6 itens por página conforme solicitado
    search: ""
  });

  // Função para carregar os produtos
  const loadProducts = useCallback(async () => {
    try {
      console.log('Carregando produtos com filtros:', {
        category: filters.category,
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        search: filters.search
      });
      
      setIsLoading(true);
      setError(null);
      
      const response = await fetchProducts({
        category: filters.category,
        search: filters.search || undefined,
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort
      });
      
      console.log('Resposta da API:', {
        productsCount: response.products?.length,
        pagination: response.pagination
      });
      
      setProducts(response.products || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalProducts(response.pagination?.totalProducts || 0);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Carrega os produtos quando o componente é montado ou quando os filtros mudam
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Sincroniza o termo de busca da URL com o estado de filtros
  useEffect(() => {
    const term = (searchParams.get('search') || '').trim();
    setFilters(prev => {
      // Se o termo da URL é diferente do estado atual, atualiza e volta para página 1
      if ((prev.search || '') !== term) {
        return { ...prev, search: term, page: 1 };
      }
      return prev;
    });
  }, [searchParams]);

  const handleFilterChange = (filterType: string, value: string) => {
    console.log('Filter changed:', { filterType, value });
    if (filterType === 'category' && value && value !== 'all') {
      // Navega para a página de categoria dedicada
      router.push(`/categoria/${value}`);
      return;
    }
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
      // Reseta para a primeira página quando os filtros mudam
      ...(filterType !== 'page' && { page: 1 })
    }));
  };

  // Handle category selection from FeaturedCategories
  const handleCategorySelect = (categorySlug: string) => {
    console.log('Category selected:', categorySlug);
    handleFilterChange('category', categorySlug);
    
    // Scroll to the top of the product list
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    
    // Rolar para o topo da página quando mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  // Filtrar e ordenar produtos localmente (opcional, pode ser feito no backend)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Ordenar
    switch (filters.sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "best-sellers":
        // Ordenar por avaliação (rating) quando disponível
        return [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default: // newest
        return result;
    }
  }, [products, filters.sort]);

  return (
    <main className={styles.container}>
      <FilterBar 
        onFilterChange={handleFilterChange} 
        currentSort={filters.sort}
        currentCategory={filters.category}
      />
      
      {isLoading ? (
        <div className={styles.loading}>Carregando produtos...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          <Cards 
            products={filteredProducts} 
            onAddToCart={handleAddToCart} 
            categoryName={filters.category !== 'all' ? filters.category : undefined}
          />
          
          {totalPages > 1 && (
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
          
          <FeaturedCategories onCategorySelect={handleCategorySelect} />
        </>
      )}
    </main>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { Cards } from "@/components/Cards/index";
import { FilterBar } from "@/components/FilterBar";
import { Pagination } from "@/components/Pagination";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { fetchProducts } from "@/services/api";
import type { Product } from "@/types/api";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import SearchParamsWrapper from "@/components/SearchParamsWrapper";

function HomeContent() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const { addItem } = useCart();
  
  const [filters, setFilters] = useState({
    category: "all",
    sort: "newest" as 'newest' | 'price-asc' | 'price-desc' | 'best-sellers',
    page: 1,
    limit: 6, 
    search: ""
  });

 
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
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      setProducts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

 
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchParamsChange = useCallback((searchTerm: string) => {
    setFilters(prev => {
      if ((prev.search || '') !== searchTerm) {
        return { ...prev, search: searchTerm, page: 1 };
      }
      return prev;
    });
  }, []);

  const handleFilterChange = (filterType: string, value: string) => {
    console.log('Filter changed:', { filterType, value });
    if (filterType === 'category' && value && value !== 'all') {
      
      router.push(`/categoria/${value}`);
      return;
    }
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
     
      ...(filterType !== 'page' && { page: 1 })
    }));
  };

  
  const handleCategorySelect = (categorySlug: string) => {
    console.log('Category selected:', categorySlug);
    handleFilterChange('category', categorySlug);
    
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

 
  const filteredProducts = useMemo(() => {
    const result = [...products];

    switch (filters.sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "best-sellers":
       
        return [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default: // newest
        return result;
    }
  }, [products, filters.sort]);

  return (
    <main className={styles.container}>
      <SearchParamsWrapper onSearchParamsChange={handleSearchParamsChange} />
      <FilterBar 
        onFilterChange={handleFilterChange}
        currentCategory={filters.category}
      />
      
      {error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          {isLoading && <div className={styles.loading}>Carregando produtos...</div>}
          <div style={{ display: isLoading ? 'none' : 'block' }}>
            <Cards 
              products={filteredProducts} 
              onAddToCart={handleAddToCart}
            />
          </div>
          
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

export default function Home() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <HomeContent />
    </Suspense>
  );
}

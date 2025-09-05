'use client';

import { useState, useEffect } from 'react';
import { fetchCategories } from '@/services/api';
import type { Category } from '@/types/api';
import styles from './FeaturedCategories.module.scss';

type FeaturedCategoriesProps = {
  onCategorySelect?: (categorySlug: string) => void;
};

export function FeaturedCategories({ onCategorySelect }: FeaturedCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Buscar categorias da API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCategories();
        
        // Pegar apenas as primeiras 5 categorias para exibição
        const topCategories = data.slice(0, 5);
        setCategories(topCategories);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Não foi possível carregar as categorias.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <section className={styles.featuredCategories}>
        <h2 className={styles.title}>Principais categorias</h2>
        <div className={styles.loading}>Carregando categorias...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.featuredCategories}>
        <h2 className={styles.title}>Principais categorias</h2>
        <div className={styles.error}>{error}</div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null; // Não renderiza nada se não houver categorias
  }

  return (
    <section className={styles.featuredCategories}>
      <h2 className={styles.title}>Principais categorias</h2>
      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <div 
            key={category.id} 
            className={styles.categoryCard}
            onMouseEnter={() => setHoveredCard(category.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onCategorySelect?.(category.slug || String(category.id))}
          >
            <h3 className={styles.categoryName}>{category.name}</h3>
            {category.productCount !== undefined && (
              <span className={styles.productCount}>
                {category.productCount} {category.productCount === 1 ? 'produto' : 'produtos'}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

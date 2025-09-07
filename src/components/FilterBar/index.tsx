'use client';

import { useState, useEffect } from 'react';
import styles from './FilterBar.module.scss';
import { fetchCategories } from '@/services/api';

type OptionType = {
  value: string;
  label: string;
};

type FilterBarProps = {
  onFilterChange: (filterType: string, value: string) => void;
  currentSort: 'newest' | 'price-asc' | 'price-desc' | 'best-sellers';
  currentCategory: string;
  className?: string;
  hideCategory?: boolean;
  priceOnly?: boolean;
  hideTitle?: boolean;
};

export function FilterBar({ onFilterChange, currentSort, currentCategory, className = '', hideCategory = false, priceOnly = false, hideTitle = false }: FilterBarProps) {
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<OptionType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory);
  const [selectedSort, setSelectedSort] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const sortOptions: OptionType[] = priceOnly
    ? [
        { value: '', label: 'Organizar por' },
        { value: 'newest', label: 'Novidades' },
        { value: 'price-asc', label: 'Preço: Menor - maior' },
        { value: 'price-desc', label: 'Preço: Maior - meno' },
      ]
    : [
        { value: '', label: 'Organizar por' },
        { value: 'newest', label: 'Novidades' },
        { value: 'price-desc', label: 'Preço: Maior - menor' },
        { value: 'price-asc', label: 'Preço: Menor - maior' },
        { value: 'best-sellers', label: 'Mais vendidos' },
      ];

  useEffect(() => {
    setIsClient(true);
    
    const loadCategories = async () => {
      try {
        const apiCategories = await fetchCategories();
        const formattedCategories = [
          { value: 'all', label: 'Selecione a categroria' },
          ...apiCategories.map(cat => ({
            value: cat.slug || String(cat.id),
            label: cat.name
          }))
        ];
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
       
        setCategories([
          { value: 'all', label: 'Todas as categorias' },
          { value: 'eletronicos', label: 'Eletrônicos' },
          { value: 'roupas', label: 'Roupas e Calçados' },
          { value: 'casa', label: 'Casa e Decoração' },
          { value: 'livros', label: 'Livros' },
          { value: 'esporte', label: 'Esporte e Lazer' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    onFilterChange('category', value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSort(value);
    if (value) {
      const sortValue = value as 'newest' | 'price-asc' | 'price-desc' | 'best-sellers';
      onFilterChange('sort', sortValue);
    }
  };

  if (!isClient || isLoading) {
    return null;
  }

  return (
    <div 
      className={`${styles.filterBar} ${className}`.trim()}
    >
      <div className={styles.filterControls}>
        {!hideCategory && (
          <div className={styles.filterGroup}>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className={styles.select}
              disabled={isLoading}
            >
              {categories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className={styles.filterGroup}>
          <select
            id="sort-filter"
            value={selectedSort}
            onChange={handleSortChange}
            className={styles.select}
            disabled={isLoading}
          >
            {sortOptions.map((option) => (
              <option key={option.value || 'default'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!hideTitle && <h1 className={styles.pageTitle}>Todos os produtos</h1>}
    </div>
  );
}
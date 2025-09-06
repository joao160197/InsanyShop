'use client';

import { useState, useEffect } from 'react';
import styles from './FilterBar.module.scss';
import { IoIosArrowDown } from "react-icons/io";
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
  const [selectedSort, setSelectedSort] = useState<'newest' | 'price-asc' | 'price-desc' | 'best-sellers'>(currentSort);
  const [isLoading, setIsLoading] = useState(true);

  const sortOptions: OptionType[] = priceOnly
    ? [
        { value: 'price-desc', label: 'Organizar por' },
        { value: 'price-asc', label: 'Preço: Menor - maior' },
      ]
    : [
        { value: 'newest', label: 'Organizar por' },
        { value: 'price-desc', label: 'Preço: Maior - menor' },
        { value: 'price-asc', label: 'Preço: Menor - maior' },
        { value: 'best-sellers', label: 'Mais vendidos' },
      ];

  useEffect(() => {
    setIsClient(true);
    
    // Fetch categories from API
    const loadCategories = async () => {
      try {
        const apiCategories = await fetchCategories();
        // Add 'Todas as categorias' as the first option
        const formattedCategories = [
          { value: 'all', label: 'Todas as categorias' },
          ...apiCategories.map(cat => ({
            value: cat.slug || String(cat.id),
            label: cat.name
          }))
        ];
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories if API fails
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
    const value = e.target.value as 'newest' | 'price-asc' | 'price-desc' | 'best-sellers';
    setSelectedSort(value);
    onFilterChange('sort', value);
  };

  if (!isClient || isLoading) {
    return null;
  }

  return (
    <div className={`${styles.filterBar} ${className}`.trim()}>
      
      <div className={styles.filterControls}>
        {!hideCategory && (
          <div className={styles.filterGroup}>
            <select 
              className={styles.select}
              value={selectedCategory}
              onChange={handleCategoryChange}
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
            className={styles.select}
            value={selectedSort}
            onChange={handleSortChange}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
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
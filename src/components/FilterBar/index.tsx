'use client';

import { useState, useEffect } from 'react';
import styles from './FilterBar.module.scss';
import { IoIosArrowDown } from "react-icons/io";

type OptionType = {
  value: string;
  label: string;
};

type FilterBarProps = {
  onFilterChange: (filterType: string, value: string) => void;
};

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [isClient, setIsClient] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');

  const categories: OptionType[] = [
    { value: 'all', label: 'Selecione a categoria' },
    { value: 't-shirts', label: 'Camisetas' },
    { value: 'mugs', label: 'Canecas' },
  ];

  const sortOptions: OptionType[] = [
    { value: 'newest', label: 'Organizar por' },
    { value: 'price-asc', label: 'Preço: Maior - menor' },
    { value: 'price-desc', label: 'Preço: Menor - maior' },
    { value: 'best-sellers', label: 'Mais vendidos' },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    onFilterChange('category', value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSort(value);
    onFilterChange('sort', value);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.filterBar}>
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
  );
}
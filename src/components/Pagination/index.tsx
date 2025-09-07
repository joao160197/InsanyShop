'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Pagination.module.scss';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  
  if (totalPages <= 1) return null;

 
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className={`${styles.pagination} ${className}`}>
      <button
        className={`${styles.pageItem} ${currentPage === 1 ? styles.disabled : ''}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <FiChevronLeft size={16} />
      </button>
      
      {getPageNumbers().map((page) => (
        <button
          key={page}
          className={`${styles.pageItem} ${currentPage === page ? styles.active : ''}`}
          onClick={() => handlePageChange(page)}
          aria-current={currentPage === page ? 'page' : undefined}
          aria-label={`Ir para a página ${page}`}
        >
          {page}
        </button>
      ))}
      
      <button
        className={`${styles.pageItem} ${currentPage === totalPages ? styles.disabled : ''}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}

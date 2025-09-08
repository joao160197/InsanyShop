'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

type SearchParamsWrapperProps = {
  onSearchParamsChange: (searchTerm: string) => void;
};

function SearchParamsContent({ onSearchParamsChange }: SearchParamsWrapperProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const term = (searchParams.get('search') || '').trim();
    onSearchParamsChange(term);
  }, [searchParams, onSearchParamsChange]);

  return null;
}

export default function SearchParamsWrapper({ onSearchParamsChange }: SearchParamsWrapperProps) {
  return (
    <SearchParamsContent onSearchParamsChange={onSearchParamsChange} />
  );
}

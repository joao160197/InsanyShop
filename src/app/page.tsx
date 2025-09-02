"use client";

import { useState, useMemo } from "react";
import { Cards } from "@/components/Cards";
import { FilterBar } from "@/components/FilterBar";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
};

// Dados de exemplo dos produtos
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Roupas e Calçados",
    price: 70.0,
    image: "/image/image.png",
    category: "t-shirts"
  },
  {
    id: 2,
    name: "Roupas e Calçados",
    price: 89.9,
    image: "/image/image.png",
    category: "t-shirts"
  },
  {
    id: 3,
    name: "Roupas e Calçados",
    price: 180.0,
    image: "/image/image.png",
    category: "pants"
  },
  {
    id: 4,
    name: "Roupas e calçados ",
    price: 170.0,
    image: "/image/image.png",
    category: "pants"
  },
  {
    id: 5,
    name: "Roupas e Calçados",
    price: 90.0,
    image: "/image/image.png",
    category: "shirts"
  },
  {
    id: 6,
    name: "Roupas e Calçados",
    price: 120.0,
    image: "/image/image.png",
    category: "shirts"
  },
];

export default function Home() {
  const [filters, setFilters] = useState({
    category: "all",
    sort: "newest"
  });

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleAddToCart = (product: Product) => {
    // Implementar lógica de adicionar ao carrinho
    console.log("Adicionado ao carrinho:", product);
  };

  // Filtrar e ordenar produtos
  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    // Filtrar por categoria
    if (filters.category !== "all") {
      result = result.filter(product => product.category === filters.category);
    }

    // Ordenar
    switch (filters.sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "best-sellers":
        // Implementar lógica de mais vendidos quando disponível
        return result;
      default: // newest
        return result;
    }
  }, [filters]);

  return (
    <main className="container">
      <FilterBar onFilterChange={handleFilterChange} />
      <Cards 
        products={filteredProducts} 
        onAddToCart={handleAddToCart} 
      />
    </main>
  );
}

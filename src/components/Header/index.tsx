"use client";

import Link from "next/link";
import styles from "./Header.module.scss";
import { FiShoppingBag } from "react-icons/fi";
import { PiMagnifyingGlassThin } from "react-icons/pi";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { fetchCategories } from "@/services/api";
import type { Category } from "@/types/api";

export default function Header() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
   
    const load = async () => {
      const cats = await fetchCategories();
      setCategories(cats || []);
    };
    load();
  }, []);

  const normalize = (s: string) => (
    s
      .toLowerCase()
      .normalize('NFD')
  
      .replace(/[\u0300-\u036f]/g, '')
    
      .replace(/[^a-z0-9]+/g, '-')
 
      .replace(/^-+|-+$/g, '')
  );

  const categoryIndex = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => {
      const slug = c.slug || normalize(c.name || '');
      map.set(slug, slug);
      map.set(normalize(slug), slug);
      if (c.name) map.set(normalize(c.name), slug);
    });
    return map;
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = search.trim();
    
    const path = pathname || "/";
    if (path.startsWith("/categoria/")) {
      const slug = path.split("/")[2] || "";
      const url = term ? `/categoria/${slug}?search=${encodeURIComponent(term)}` : `/categoria/${slug}`;
      router.push(url);
      return;
    }
   
    if (!categories || categories.length === 0) {
      try {
        const cats = await fetchCategories();
        setCategories(cats || []);
      } catch {}
    }
    if (term) {
      const norm = normalize(term);
     
      if (categoryIndex.has(norm)) {
        router.push(`/categoria/${categoryIndex.get(norm)}`);
        return;
      }
      
      const match = [...categoryIndex.keys()].find(k => k.startsWith(norm));
      if (match) {
        router.push(`/categoria/${categoryIndex.get(match)}`);
        return;
      }
    
      const fallbackMap: Record<string, string> = {
        'eletronicos': 'eletronicos',
        'eletronicos-e-informatica': 'eletronicos-e-informatica',
        'roupas': 'roupas',
        'roupas-e-calcados': 'roupas-e-calcados',
        'esporte': 'esporte',
        'esportes-e-lazer': 'esportes-e-lazer',
        'casa': 'casa',
        'casa-e-decoracao': 'casa-e-decoracao',
        'livros': 'livros'
      };
      if (fallbackMap[norm]) {
        router.push(`/categoria/${fallbackMap[norm]}`);
        return;
      }
    }
    router.push(term ? `/?search=${encodeURIComponent(term)}` : "/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.Title}>
            <Link href="/">InsanyShop</Link>
          </div>
        </div>
        <div className={styles.rightSection}>
          <form className={styles.searchContainer} onSubmit={handleSubmit} role="search" aria-label="Buscar produtos">
            <input
              className={styles.input}
              type="text"
              placeholder="Procurando por algo específico?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar"
            />
            <button className={styles.searchButton} type="submit" aria-label="Buscar">
              <PiMagnifyingGlassThin size={24} color={"#737380"} />
            </button>
          </form>
          <Link href="/cart">
            <button className={styles.button} onClick={() => setSearch("")} type="button" aria-label="Carrinho">
              <div className={styles.cartIconContainer}>
                <FiShoppingBag size={24} color={"#737380"}/>
                {count > 0 && (
                  <span className={styles.cartBadge} aria-label={`Itens no carrinho: ${count}`}>
                    {count}
                  </span>
                )}
              </div>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}

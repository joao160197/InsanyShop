"use client";

import Link from "next/link";
import styles from "./Header.module.scss";
import { FiShoppingBag } from "react-icons/fi";
import { PiMagnifyingGlassThin } from "react-icons/pi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const router = useRouter();
  const { count } = useCart();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = search.trim();
    // Navega para a home com o termo de busca como query param
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
              <div style={{ position: 'relative' }}>
                <FiShoppingBag size={24} color={"#737380"}/>
                {count > 0 && (
                  <span aria-label={`Itens no carrinho: ${count}`} style={{ position: 'absolute', top: -6, right: -6, background: '#DE3838', color: '#fff', borderRadius: '999px', minWidth: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, padding: '0 4px' }}>
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
